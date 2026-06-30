import { body, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateFormData = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

export const validateCreateAccountParams = [
  body("walletAddress").notEmpty(),
];

export const validateCheckWalletParams = [
  query("walletAddress").notEmpty(),
];

export const validateProfileParams = [
  body("walletAddress").notEmpty(),
  body("email").isEmail(),
  body("name").notEmpty(),
  body("phoneNumber").notEmpty(),
];

export const validateSignupParams = [
  body("email").isEmail(),
  body("password").notEmpty(),
];

export const validateResendEmailParams = [
  body("email").isEmail(),
];

export const validateResetPasswordEmailParams = [
  body("email").isEmail(),
  body("otp").notEmpty(),
  body("password").notEmpty(),
];

export const validateVerifyEmailParams = [
  body("email").isEmail(),
  body("otp").notEmpty(),
];

export const validateCheckEmailParams = [
  query("walletAddress").notEmpty(),
];

export const validateInitPaymentParams = [
  body("walletAddress").notEmpty(),
  body("callback").notEmpty(),
  body("tier").notEmpty(),
];

export const validateVerifyPaymentParams = [
  body("walletAddress").notEmpty(),
  body("reference").notEmpty(),
  body("img").notEmpty(),
];

export const validateCompletTier2LessontParams = [
  body("courseId").notEmpty(),
  body("lessonId").notEmpty(),
];

export const validateMintTier2CourseCertificateParams = [
  body("courseId").notEmpty()
];

export const validateSubscribeTier2PlanParams = [
  body("planId").notEmpty(),
  body("callbackUrl").notEmpty(),
];

export const validateVerifyTier2PaymentParams = [
  body("billingId").notEmpty(),
  body("reference").notEmpty(),
];

export const validatePayTier2BillParams = [
  body("billId").notEmpty(),
  body("callbackUrl").notEmpty(),
];

export const validateEditProfileParams = [
  body("name").notEmpty(),
];


export const requestValidation = {
  validateFormData,
  validateCreateAccountParams,
  validateSignupParams,
  validateResendEmailParams,
  validateResetPasswordEmailParams,
  validateCheckWalletParams,
  validateProfileParams,
  validateVerifyEmailParams,
  validateCheckEmailParams,
  validateInitPaymentParams,
  validateVerifyPaymentParams,
  validateCompletTier2LessontParams,
  validateSubscribeTier2PlanParams,
  validateVerifyTier2PaymentParams,
  validatePayTier2BillParams,
  validateMintTier2CourseCertificateParams,
  validateEditProfileParams
}