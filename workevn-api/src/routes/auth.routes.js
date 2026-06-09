import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/auth.validators.js";

const router = Router();
console.log("Auth routes loaded");
router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", requireAuth, me);

export default router;
