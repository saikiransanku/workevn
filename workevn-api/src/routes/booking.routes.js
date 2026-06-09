import { Router } from "express";
import {
  acceptBooking,
  createBooking,
  listMyBookings,
  rejectBooking,
  updateBookingStatus
} from "../controllers/booking.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createBookingValidator } from "../validators/booking.validators.js";

const router = Router();

router.use(requireAuth);
router.post("/", requireRoles("customer"), createBookingValidator, validate, createBooking);
router.get("/my", requireRoles("customer", "worker"), listMyBookings);
router.patch("/:id/accept", requireRoles("worker"), acceptBooking);
router.patch("/:id/reject", requireRoles("worker"), rejectBooking);
router.patch("/:id/status", requireRoles("customer", "worker", "admin"), updateBookingStatus);

export default router;
