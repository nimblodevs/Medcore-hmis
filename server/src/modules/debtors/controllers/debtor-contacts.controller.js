const {
  createDebtorContactSchema,
  updateDebtorContactSchema,
} = require('../validators/debtor-contact.validator');
const debtorContactRepository = require('../repositories/debtor-contact.repository');
const debtorAuditService = require('../services/debtor-audit.service');
const { AppError } = require('../../../utils/errors');
const { catchAsync } = require('../../../utils/catchAsync');

/**
 * Get all contacts for a debtor account
 * GET /api/debtors/accounts/:accountId/contacts
 */
const getDebtorContacts = catchAsync(async (req, res, next) => {
  const { accountId } = req.params;
  const { contactType, isActive } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorAccountId: accountId,
    contactType,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
  };

  const contacts = await debtorContactRepository.findAll(filters, tenantId);

  res.json({
    success: true,
    message: 'Debtor contacts retrieved successfully',
    data: contacts,
  });
});

/**
 * Create a new contact for a debtor account
 * POST /api/debtors/accounts/:accountId/contacts
 */
const createDebtorContact = catchAsync(async (req, res, next) => {
  const { accountId } = req.params;
  const validatedData = await createDebtorContactSchema.parseAsync(req.body);
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const contact = await debtorContactRepository.create({
    ...validatedData,
    debtorAccountId: accountId,
    createdById: user.id,
    tenantId,
  });

  await debtorAuditService.log({
    debtorAccountId: accountId,
    actorId: user.id,
    action: 'CONTACT_CREATED',
    entityType: 'DebtorContact',
    entityId: contact.id,
    newValues: contact,
    reason: 'New contact created for debtor account',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: 'Debtor contact created successfully',
    data: contact,
  });
});

/**
 * Update a debtor contact
 * PATCH /api/debtors/contacts/:id
 */
const updateDebtorContact = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const validatedData = await updateDebtorContactSchema.parseAsync(req.body);
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingContact = await debtorContactRepository.findById(id, tenantId);
  
  if (!existingContact) {
    throw new AppError('Debtor contact not found', 404);
  }

  const updatedContact = await debtorContactRepository.update(id, {
    ...validatedData,
    updatedById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: existingContact.debtorAccountId,
    actorId: user.id,
    action: 'CONTACT_UPDATED',
    entityType: 'DebtorContact',
    entityId: id,
    previousValues: existingContact,
    newValues: updatedContact,
    reason: 'Debtor contact updated',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor contact updated successfully',
    data: updatedContact,
  });
});

/**
 * Deactivate a debtor contact
 * POST /api/debtors/contacts/:id/deactivate
 */
const deactivateDebtorContact = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingContact = await debtorContactRepository.findById(id, tenantId);
  
  if (!existingContact) {
    throw new AppError('Debtor contact not found', 404);
  }

  const deactivatedContact = await debtorContactRepository.deactivate(id, {
    updatedById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: existingContact.debtorAccountId,
    actorId: user.id,
    action: 'CONTACT_DEACTIVATED',
    entityType: 'DebtorContact',
    entityId: id,
    previousValues: { isActive: true },
    newValues: { isActive: false },
    reason: 'Debtor contact deactivated',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor contact deactivated successfully',
    data: deactivatedContact,
  });
});

module.exports = {
  getDebtorContacts,
  createDebtorContact,
  updateDebtorContact,
  deactivateDebtorContact,
};
