import { Router } from "express";
import {
  getAdminDashboard,
  listBookings,
  listUsers,
  listWorkerApplications,
  reviewWorkerApplication
} from "../controllers/admin.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRoles("admin"));
router.get("/dashboard", getAdminDashboard);
router.get("/users", listUsers);
router.get("/workers/applications", listWorkerApplications);
router.patch("/workers/applications/:id/review", reviewWorkerApplication);
router.get("/bookings", listBookings);

export default router;
