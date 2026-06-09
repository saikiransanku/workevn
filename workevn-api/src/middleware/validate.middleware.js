import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export function validate(req, _res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  const error = new ApiError(422, "Validation failed");
  error.errors = result.array().map((item) => ({
    field: item.path,
    message: item.msg
  }));
  next(error);
}
