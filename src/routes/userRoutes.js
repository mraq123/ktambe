
import express from "express";
import * as controller from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authenticateToken, allowRoles("admin"));

router.get("/", controller.getAll);
router.post("/", controller.create);
router.patch("/:id/active", controller.setActive);

export default router;
