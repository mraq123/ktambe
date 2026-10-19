
import express from "express";
import * as controller from "../controllers/roleController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", controller.getAll);
router.post("/", allowRoles("admin"), controller.create);

export default router;
