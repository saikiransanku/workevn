import { body } from "express-validator";
import { WORKER_SKILLS } from "../models/WorkerProfile.js";

export const createBookingValidator = [
  body("workerId").isMongoId().withMessage("Valid workerId is required"),
  body("skill").isIn(WORKER_SKILLS).withMessage("Invalid skill"),
  body("scheduledFor").isISO8601().withMessage("Valid scheduledFor date is required"),
  body("location.coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Location coordinates [longitude, latitude] are required"),
  body("address.line1").optional().trim().isLength({ max: 200 }),
  body("notes").optional().trim().isLength({ max: 1000 })
];
