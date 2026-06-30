import { body, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateFormData = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

export const validateSignInParams = [
  body("email").isEmail(),
  body("password").isString(),
];

export const validateAddTestParams = [
  body("name").isString(),
  body("testUrl").isString(),
  body("spreadsheetUrl").isString(),
];

export const validateMessageUserParams = [
  body("userId").isString(),
  body("message").isString(),
  body("subject").isString(),
];

export const validateMessageUsersParams = [
  body("message").isString(),
  body("subject").isString(),
];


export const validateUserDetailParams = [
  query("userId").isString(),
];

export const validateTestResultDetailParams = [
  query("spreadsheetsId").isString(),
];

export const validatChangeAmountParams = [
  body("amount").notEmpty().isNumeric(),
  body("tier").notEmpty()
];

export const validatAddCourseParams = [
  body("title").notEmpty(),
  body("description").notEmpty(),
  body("isSubscrible").notEmpty().isBoolean(),
];

export const validatAddSectionParams = [
  body("title").notEmpty(),
  body("course").notEmpty(),
];

export const validatAddLessonParams = [
  body("title").notEmpty(),
  body("course").notEmpty(),
  body("section").notEmpty(),
  body("wordContent").notEmpty(),
  body("duration").notEmpty(),
];

export const validatAddTier2PlanParams = [
  body("name").notEmpty(),
  body("monthlyPrice").notEmpty().isNumeric(),
  body("discription").notEmpty(),
];

export const validatChangeTierPriceParams = [
  body("tier").notEmpty(),
  body("amount").notEmpty(),
];



export const requestValidation = {
  validateFormData,
  validateSignInParams,
  validateAddTestParams,
  validateMessageUserParams,
  validateMessageUsersParams,
  validateUserDetailParams,
  validateTestResultDetailParams,
  validatChangeAmountParams,
  validatAddCourseParams,
  validatAddSectionParams,
  validatAddLessonParams,
  validatAddTier2PlanParams,
  validatChangeTierPriceParams
}