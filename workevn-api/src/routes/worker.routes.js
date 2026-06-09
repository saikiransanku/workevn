import { Router } from "express";
import {
  applyAsWorker,
  findNearbyWorkers,
  getWorkerDashboard,
  getWorkerProfile,
  updateWorkerAvailability,
  findAllWorkers,
} from "../controllers/worker.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  nearbyWorkersValidator,
  workerApplicationValidator,
} from "../validators/worker.validators.js";

const router = Router();

router.get("/nearby", nearbyWorkersValidator, validate, findNearbyWorkers);
router.get("/all", requireAuth, findAllWorkers);
router.use(requireAuth);
router.post("/apply", workerApplicationValidator, validate, applyAsWorker);
router.get("/me", requireRoles("worker"), getWorkerProfile);
router.patch("/availability", requireRoles("worker"), updateWorkerAvailability);
router.get("/dashboard", requireRoles("worker"), getWorkerDashboard);

export default router;
