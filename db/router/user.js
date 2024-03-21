import express from "express";
import {} from "express-async-errors";
import { body } from "express-validator";
import { validate } from "../middleware/validator.js";
import * as userController from "../controller/user.js";
import { isAuth } from "../middleware/user.js";

const router = express.Router();

const validateCredential = [
  body("userID").trim().notEmpty(),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("password should be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!#%*?&]+$/
    )
    .withMessage(
      "Please use uppercase and lowercase letters and special characters."
    ),
  validate,
];

const validateSignup = [
  ...validateCredential,
  body("username").notEmpty().withMessage("name is missing"),
  body("email").isEmail().normalizeEmail().withMessage("invalid email"),
  validate,
];

router.post("/signup", validateSignup, userController.signup);

router.post("/login", validateCredential, userController.login);

router.post("/basicScore", userController.basicScore);

router.get("/basicScore/:id", userController.getScores);

router.get("/me", isAuth, userController.me);

export default router;
