import { Router } from "express";
import { getDashboard, getProfile, updateProfile } from "../controllers/user.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/profile", requireRoles("customer", "worker", "admin"), getProfile);
router.patch("/profile", requireRoles("customer", "worker", "admin"), updateProfile);
router.get("/dashboard", requireRoles("customer"), getDashboard);

export default router;
