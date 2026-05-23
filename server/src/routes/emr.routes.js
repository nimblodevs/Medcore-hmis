import { Router } from "express";
import { requireRole } from "../middleware/auth.middleware.js";
import { Roles } from "../constants/roles.js";

const router = Router();

// Placeholder routes - to be implemented with controllers
router.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "EMR module is being implemented",
    endpoints: {
      encounters: "/api/emr/encounters",
      triage: "/api/emr/encounters/:encounterId/triage",
      vitals: "/api/emr/encounters/:encounterId/vitals",
      allergies: "/api/emr/encounters/:encounterId/allergies",
      notes: "/api/emr/encounters/:encounterId/notes",
      diagnoses: "/api/emr/encounters/:encounterId/diagnoses",
      orders: "/api/emr/encounters/:encounterId/orders",
      prescriptions: "/api/emr/encounters/:encounterId/prescriptions",
      discharge: "/api/emr/encounters/:encounterId/discharge-summary"
    }
  });
});

// Encounter routes (placeholders)
router.get("/encounters", requireRole([Roles.DOCTOR, Roles.NURSE, Roles.ADMIN]), (req, res) => {
  res.json({ success: true, message: "List encounters endpoint - to be implemented" });
});

router.post("/encounters", requireRole([Roles.DOCTOR, Roles.NURSE]), (req, res) => {
  res.json({ success: true, message: "Create encounter endpoint - to be implemented" });
});

router.get("/encounters/:id", requireRole([Roles.DOCTOR, Roles.NURSE, Roles.ADMIN]), (req, res) => {
  res.json({ success: true, message: "Get encounter endpoint - to be implemented" });
});

router.patch("/encounters/:id", requireRole([Roles.DOCTOR, Roles.NURSE]), (req, res) => {
  res.json({ success: true, message: "Update encounter endpoint - to be implemented" });
});

router.post("/encounters/:id/close", requireRole([Roles.DOCTOR]), (req, res) => {
  res.json({ success: true, message: "Close encounter endpoint - to be implemented" });
});

router.post("/encounters/:id/cancel", requireRole([Roles.DOCTOR, Roles.ADMIN]), (req, res) => {
  res.json({ success: true, message: "Cancel encounter endpoint - to be implemented" });
});

// Get encounter by visit ID
router.get("/visits/:visitId/encounter", requireRole([Roles.DOCTOR, Roles.NURSE]), (req, res) => {
  res.json({ success: true, message: "Get encounter by visit endpoint - to be implemented" });
});

export default router;
