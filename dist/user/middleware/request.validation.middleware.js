"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestValidation = exports.validateVerifyPaymentParams = exports.validateInitPaymentParams = exports.validateCheckEmailParams = exports.validateVerifyEmailParams = exports.validateProfileParams = exports.validateCheckWalletParams = exports.validateCreateAccountParams = exports.validateFormData = void 0;
const express_validator_1 = require("express-validator");
const validateFormData = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};
exports.validateFormData = validateFormData;
exports.validateCreateAccountParams = [
    (0, express_validator_1.body)("walletAddress").notEmpty(),
];
exports.validateCheckWalletParams = [
    (0, express_validator_1.query)("walletAddress").notEmpty(),
];
exports.validateProfileParams = [
    (0, express_validator_1.body)("walletAddress").notEmpty(),
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)("name").notEmpty(),
    (0, express_validator_1.body)("phoneNumber").notEmpty(),
];
exports.validateVerifyEmailParams = [
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)("otp").notEmpty(),
];
exports.validateCheckEmailParams = [
    (0, express_validator_1.query)("walletAddress").notEmpty(),
];
exports.validateInitPaymentParams = [
    (0, express_validator_1.body)("walletAddress").notEmpty(),
    (0, express_validator_1.body)("callback").notEmpty(),
];
exports.validateVerifyPaymentParams = [
    (0, express_validator_1.body)("walletAddress").notEmpty(),
    (0, express_validator_1.body)("reference").notEmpty(),
    (0, express_validator_1.body)("img").notEmpty(),
];
exports.requestValidation = {
    validateFormData: exports.validateFormData,
    validateCreateAccountParams: exports.validateCreateAccountParams,
    validateCheckWalletParams: exports.validateCheckWalletParams,
    validateProfileParams: exports.validateProfileParams,
    validateVerifyEmailParams: exports.validateVerifyEmailParams,
    validateCheckEmailParams: exports.validateCheckEmailParams,
    validateInitPaymentParams: exports.validateInitPaymentParams,
    validateVerifyPaymentParams: exports.validateVerifyPaymentParams
};
