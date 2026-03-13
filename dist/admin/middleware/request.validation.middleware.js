"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestValidation = exports.validateTestResultDetailParams = exports.validateUserDetailParams = exports.validateMessageUsersParams = exports.validateMessageUserParams = exports.validateAddTestParams = exports.validateSignInParams = exports.validateFormData = void 0;
const express_validator_1 = require("express-validator");
const validateFormData = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};
exports.validateFormData = validateFormData;
exports.validateSignInParams = [
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)("password").isString(),
];
exports.validateAddTestParams = [
    (0, express_validator_1.body)("name").isString(),
    (0, express_validator_1.body)("testUrl").isString(),
    (0, express_validator_1.body)("spreadsheetUrl").isString(),
];
exports.validateMessageUserParams = [
    (0, express_validator_1.body)("userId").isString(),
    (0, express_validator_1.body)("message").isString(),
    (0, express_validator_1.body)("subject").isString(),
];
exports.validateMessageUsersParams = [
    (0, express_validator_1.body)("message").isString(),
    (0, express_validator_1.body)("subject").isString(),
];
exports.validateUserDetailParams = [
    (0, express_validator_1.query)("userId").isString(),
];
exports.validateTestResultDetailParams = [
    (0, express_validator_1.query)("spreadsheetsId").isString(),
];
exports.requestValidation = {
    validateFormData: exports.validateFormData,
    validateSignInParams: exports.validateSignInParams,
    validateAddTestParams: exports.validateAddTestParams,
    validateMessageUserParams: exports.validateMessageUserParams,
    validateMessageUsersParams: exports.validateMessageUsersParams,
    validateUserDetailParams: exports.validateUserDetailParams,
    validateTestResultDetailParams: exports.validateTestResultDetailParams
};
