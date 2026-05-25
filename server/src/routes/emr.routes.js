import { Router } from "express";
import { randomUUID } from "node:crypto";
import requireRole from "../middlewares/requireRole.js";

const router = Router();
const clinicalRoles = ["DOCTOR", "NURSE", "CLINICIAN", "ADMIN", "HOSPITAL_ADMIN"];

const ok = (res, data = null, message = "OK", status = 200) =>
  res.status(status).json({ success: true, message, data });

router.get("/", (_req, res) => {
  ok(res, {
    encounters: "/api/emr/encounters",
    triage: "/api/emr/encounters/:encounterId/triage",
    vitals: "/api/emr/encounters/:encounterId/vitals",
    allergies: "/api/emr/patients/:patientId/allergies",
    notes: "/api/emr/encounters/:encounterId/notes",
    diagnoses: "/api/emr/encounters/:encounterId/diagnoses",
    orders: "/api/emr/encounters/:encounterId/orders",
    prescriptions: "/api/emr/encounters/:encounterId/prescriptions",
    discharge: "/api/emr/encounters/:encounterId/discharge-summary"
  });
});

router.use(requireRole(clinicalRoles));

router.get("/encounters", (req, res) => {
  ok(res, [], "Encounters retrieved");
});

router.post("/encounters", (req, res) => {
  ok(res, { id: randomUUID(), ...req.body, status: "OPEN" }, "Encounter created", 201);
});

router.get("/visits/:visitId/encounter", (req, res) => {
  ok(res, { visitId: req.params.visitId, status: "OPEN" }, "Encounter retrieved");
});

router.get("/encounters/:id", (req, res) => {
  ok(res, { id: req.params.id, status: "OPEN" }, "Encounter retrieved");
});

router.patch("/encounters/:id", (req, res) => {
  ok(res, { id: req.params.id, ...req.body }, "Encounter updated");
});

router.post("/encounters/:id/close", (req, res) => {
  ok(res, { id: req.params.id, status: "CLOSED", reason: req.body.reason }, "Encounter closed");
});

router.post("/encounters/:id/cancel", (req, res) => {
  ok(res, { id: req.params.id, status: "CANCELLED", reason: req.body.reason }, "Encounter cancelled");
});

router.get("/encounters/:encounterId/:collection", (req, res) => {
  ok(res, [], `${req.params.collection} retrieved`);
});

router.post("/encounters/:encounterId/:collection", (req, res) => {
  ok(
    res,
    { id: randomUUID(), encounterId: req.params.encounterId, ...req.body },
    `${req.params.collection} recorded`,
    201
  );
});

router.get("/patients/:patientId/allergies", (req, res) => {
  ok(res, [], `Allergies retrieved for patient ${req.params.patientId}`);
});

router.get("/notes/:id", (req, res) => ok(res, { id: req.params.id }, "Note retrieved"));
router.patch("/notes/:id", (req, res) => ok(res, { id: req.params.id, ...req.body }, "Note updated"));
router.post("/notes/:id/:action", (req, res) => ok(res, { id: req.params.id, action: req.params.action }, "Note action completed"));

router.patch("/diagnoses/:id", (req, res) => ok(res, { id: req.params.id, ...req.body }, "Diagnosis updated"));
router.delete("/diagnoses/:id", (req, res) => ok(res, null, "Diagnosis deleted"));

router.post("/orders/:id/:action", (req, res) => ok(res, { id: req.params.id, action: req.params.action }, "Order action completed"));
router.post("/prescriptions/:id/:action", (req, res) =>
  ok(res, { id: req.params.id, action: req.params.action }, "Prescription action completed")
);

router.get("/encounters/:encounterId/discharge-summary", (req, res) =>
  ok(res, { encounterId: req.params.encounterId }, "Discharge summary retrieved")
);
router.patch("/discharge-summaries/:id", (req, res) =>
  ok(res, { id: req.params.id, ...req.body }, "Discharge summary updated")
);
router.post("/discharge-summaries/:id/sign", (req, res) =>
  ok(res, { id: req.params.id, status: "SIGNED" }, "Discharge summary signed")
);

router.get("/reports/:name", (req, res) => ok(res, { report: req.params.name, rows: [] }, "Report generated"));

export default router;
