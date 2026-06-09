import { body, query } from "express-validator";
import { WORKER_SKILLS } from "../models/WorkerProfile.js";

export const workerApplicationValidator = [
  body("skills").isArray({ min: 1 }).withMessage("At least one skill is required"),
  body("skills.*").isIn(WORKER_SKILLS).withMessage("Invalid worker skill"),
  body("experienceYears").optional().isInt({ min: 0 }).withMessage("Invalid experience"),
  body("serviceRadiusKm")
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage("Service radius must be 1 to 100 km"),
  body("documents").optional().isArray().withMessage("Documents must be an array"),
  body("location.coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Location coordinates [longitude, latitude] are required")
];

export const nearbyWorkersValidator = [
  query("lng").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude is required"),
  query("lat").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude is required"),
  query("radiusKm").optional().isFloat({ min: 1, max: 100 }).withMessage("Invalid radius"),
  query("skill").optional().isIn(WORKER_SKILLS).withMessage("Invalid skill")
];
