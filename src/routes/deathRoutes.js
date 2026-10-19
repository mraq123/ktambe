
import express from "express";

import {
  getDeathRecords,
  getDeathRecordById,
  createDeathRecord,
  updateDeathRecord,
  deleteDeathRecord,
} from "../controllers/deathController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getDeathRecords);
router.get("/:id", getDeathRecordById);

router.post(
  "/",
  allowRoles("admin", "petugas"),
  createDeathRecord
);

router.put(
  "/:id",
  allowRoles("admin", "petugas"),
  updateDeathRecord
);

router.delete(
  "/:id",
  allowRoles("admin"),
  deleteDeathRecord
);

export default router;
