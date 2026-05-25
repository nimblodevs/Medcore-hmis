import { Router } from "express";
import { debtorSchemeController } from "../controllers/debtor-scheme.controller.js";

const router = Router();

/**
 * @route   GET /api/debtor-schemes
 * @desc    Get all schemes with filtering and pagination
 * @access  Private
 */
router.get("/", (req, res) => debtorSchemeController.findAll(req, res));

/**
 * @route   POST /api/debtor-schemes
 * @desc    Create a new debtor scheme
 * @access  Private
 */
router.post("/", (req, res) => debtorSchemeController.create(req, res));

/**
 * @route   GET /api/debtor-schemes/debtor-account/:debtorAccountId
 * @desc    Get all schemes for a specific debtor account
 * @access  Private
 */
router.get("/debtor-account/:debtorAccountId", (req, res) => 
  debtorSchemeController.findByDebtorAccount(req, res)
);

/**
 * @route   GET /api/debtor-schemes/:id
 * @desc    Get a specific scheme by ID
 * @access  Private
 */
router.get("/:id", (req, res) => debtorSchemeController.findById(req, res));

/**
 * @route   PATCH /api/debtor-schemes/:id
 * @desc    Update a debtor scheme
 * @access  Private
 */
router.patch("/:id", (req, res) => debtorSchemeController.update(req, res));

/**
 * @route   POST /api/debtor-schemes/:id/activate
 * @desc    Activate a debtor scheme
 * @access  Private
 */
router.post("/:id/activate", (req, res) => debtorSchemeController.activate(req, res));

/**
 * @route   POST /api/debtor-schemes/:id/deactivate
 * @desc    Deactivate a debtor scheme
 * @access  Private
 */
router.post("/:id/deactivate", (req, res) => debtorSchemeController.deactivate(req, res));

/**
 * @route   POST /api/debtor-schemes/:id/suspend
 * @desc    Suspend a debtor scheme
 * @access  Private
 */
router.post("/:id/suspend", (req, res) => debtorSchemeController.suspend(req, res));

/**
 * @route   POST /api/debtor-schemes/:id/archive
 * @desc    Archive a debtor scheme
 * @access  Private
 */
router.post("/:id/archive", (req, res) => debtorSchemeController.archive(req, res));

export default router;
