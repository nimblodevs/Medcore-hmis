# Hospital Management System - Operational Runbook

## Quick Start Commands

### 1. Database Setup
```bash
cd server

# Generate Prisma Client with unified schema
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name unified_hospital_system

# Reset database (DEV ONLY)
npx prisma migrate reset

# Open Prisma Studio to inspect data
npx prisma studio
```

### 2. Seed Reference Data
```bash
# Create departments, service units, queue configs, sample users
node src/database/seed.js
```

### 3. Start Development Servers
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend  
cd client
npm run dev
```

### 4. Verify Integration
```bash
# Test patient registration creates queue entry
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe",...}'

# Check queue was created
curl http://localhost:5000/api/queues/entries?patientId=<ID>

# Create EMR encounter from visit
curl -X POST http://localhost:5000/api/emr/encounters \
  -H "Content-Type: application/json" \
  -d '{"visitId":"<VISIT_ID>","chiefComplaint":"Fever"}'
```

## Module Status Matrix

| Module | Schema | Services | Controllers | Routes | Frontend | Status |
|--------|--------|----------|-------------|--------|----------|--------|
| Patient Management | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| Department Management | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| Queue Management | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| EMR | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| Pharmacy | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| Cash Management | ✅ | ✅ | ✅ | ✅ | ⏳ | BACKEND DONE |
| Credit/Invoice | ✅ | ✅ | ✅ | ✅ | ⏳ | BACKEND DONE |

## Common Workflows

### A. Complete Patient Journey
```
1. Register Patient → /api/patients
   - Generates UHID: HSP2026000001
   - Creates Patient record
   
2. Create Visit → /api/patients/:id/visits
   - Sets visit type (OUTPATIENT/EMERGENCY)
   - Assigns payer type (CASH/INSURANCE)
   
3. Auto-Create Queue Entry → Triggered by visit
   - QueueType: REGISTRATION
   - Status: WAITING
   
4. Call Patient → /api/queues/entries/:id/call
   - Receptionist calls patient
   - Status: CALLED
   
5. Complete Registration → /api/queues/entries/:id/complete-service
   - Status: COMPLETED
   - Triggers TRIAGE queue
   
6. Record Triage → /api/emr/encounters/:id/triage
   - Priority: RED/ORANGE/YELLOW/GREEN
   - Vitals recorded
   
7. Doctor Consultation → /api/emr/encounters/:id/notes
   - SOAP note created
   - Diagnosis added
   - Orders placed (LAB/RADIOLOGY/PHARMACY)
   
8. Lab Order Dispatch → /api/emr/orders/:id/dispatch
   - Creates LABORATORY queue entry
   - Lab technician processes
   
9. Pharmacy Prescription → /api/pharmacy/prescriptions/from-emr
   - Receives EMR prescription
   - Creates PHARMACY queue entry
   - Pharmacist dispenses after payment
   
10. Payment → /api/pharmacy/sales/:id/confirm-cash-payment
    - Cash or Credit billing
    - Updates sale status
    
11. Complete Visit → /api/patients/visits/:id/complete
    - Closes EMR encounter
    - Marks visit COMPLETED
```

### B. Emergency Override Flow
```
1. Emergency registration → Skip normal queue
2. Direct to EMERGENCY department queue
3. Triage priority RED → Immediate attention
4. Doctor sees emergency patient first
5. Treatment before payment (emergency protocol)
6. Billing completed post-treatment
```

### C. Credit Patient Flow
```
1. Patient with INSURANCE/SHA/CORPORATE
2. Credit account validation → /api/credit/accounts/:id
3. Check credit limit >= estimated cost
4. Approve credit → Creates Invoice
5. Dispense medication
6. Invoice sent to payer
7. Track outstanding balance
```

## Troubleshooting

### Issue: Duplicate Queue Entries
```sql
-- Find duplicate active entries for same visit
SELECT * FROM "QueueEntry" 
WHERE "visitId" = '<ID>' 
AND status IN ('WAITING', 'CALLED', 'IN_SERVICE')
AND "queueConfigId" = '<CONFIG_ID>';

-- Fix: Cancel duplicate
UPDATE "QueueEntry" 
SET status = 'CANCELLED', "cancelledAt" = NOW()
WHERE id = '<DUPLICATE_ID>';
```

### Issue: Stock Negative After Dispensing
```javascript
// Always check stock before dispensing
const batch = await prisma.pharmacyBatch.findUnique({
  where: { id: batchId }
});

if (batch.quantityOnHand < requestedQuantity) {
  throw new Error('Insufficient stock');
}

// Use transaction for atomic update
await prisma.$transaction(async (tx) => {
  await tx.pharmacyBatch.update({...});
  await tx.pharmacyStockMovement.create({...});
});
```

### Issue: EMR Encounter Already Exists
```javascript
// One encounter per visit enforced
const existing = await prisma.emrEncounter.findUnique({
  where: { visitId }
});

if (existing) {
  // Return existing instead of creating new
  return existing;
}
```

### Issue: Payment Before Dispensing Not Enforced
```javascript
// In dispensing service
if (sale.payerType === 'CASH' && sale.paymentStatus !== 'PAID') {
  if (!user.hasPermission('pharmacy.dispense_without_payment')) {
    throw new Error('Cash sales must be paid before dispensing');
  }
}
```

## Monitoring Queries

### Today's Statistics
```sql
-- Registrations today
SELECT COUNT(*) FROM "Patient" 
WHERE DATE("createdAt") = CURRENT_DATE;

-- Active queues
SELECT qc.name, COUNT(qe.id) as waiting
FROM "QueueConfiguration" qc
LEFT JOIN "QueueEntry" qe ON qc.id = qe."queueConfigId" 
  AND qe.status = 'WAITING'
GROUP BY qc.name;

-- EMR encounters by status
SELECT status, COUNT(*) 
FROM "EmrEncounter" 
WHERE DATE("createdAt") = CURRENT_DATE
GROUP BY status;

-- Pharmacy sales today
SELECT SUM("netAmount") as total_revenue
FROM "PharmacySale"
WHERE DATE("createdAt") = CURRENT_DATE;
```

### Department Performance
```sql
-- Average waiting time by department
SELECT d.name, 
       AVG(EXTRACT(EPOCH FROM (qe.calledAt - qe.arrivalAt)))/60 as avg_wait_minutes
FROM "Department" d
JOIN "QueueConfiguration" qc ON d.id = qc."departmentId"
JOIN "QueueEntry" qe ON qc.id = qe."queueConfigId"
WHERE qe.status = 'COMPLETED'
  AND DATE(qe."arrivalAt") = CURRENT_DATE
GROUP BY d.name;
```

## Backup & Recovery

### Daily Backup Script
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$DATE.sql
echo "Backup completed: backup_$DATE.sql"
```

### Restore from Backup
```bash
psql $DATABASE_URL < backups/backup_20260101_120000.sql
```

## Security Checklist

- [ ] All API endpoints require authentication
- [ ] Role-based permissions enforced
- [ ] Audit logs enabled for sensitive actions
- [ ] No hard deletes (soft delete only)
- [ ] Patient data encrypted at rest
- [ ] HTTPS in production
- [ ] Rate limiting on auth endpoints
- [ ] Session timeout configured
- [ ] CORS properly configured

## Production Deployment

### Environment Variables Required
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="secure-random-string"
FRONTEND_URL="https://hospital.example.com"
NODE_ENV="production"
PORT=5000
```

### Docker Compose (Production)
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: hospital
      POSTGRES_USER: hospital_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  backend:
    build: ./server
    environment:
      DATABASE_URL: postgresql://hospital_user:${DB_PASSWORD}@db:5432/hospital
    depends_on:
      - db
    ports:
      - "5000:5000"
  
  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## Support Contacts

- **Technical Lead**: Review INTEGRATION_SUMMARY.md for architecture
- **Database Issues**: Check Prisma schema in server/prisma/schema.prisma
- **Frontend Issues**: See client/src/features/* structure
- **API Documentation**: Swagger UI at /api-docs (when enabled)

Last Updated: January 2026
Version: 1.0.0
