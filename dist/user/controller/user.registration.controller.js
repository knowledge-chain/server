"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserEmailVerifiedController = exports.userVerifyEmailController = exports.userProvideEmailController = exports.checkUserWalletAddressController = exports.userCreateAccountController = void 0;
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const otpGenerator_1 = require("../../utils/otpGenerator");
const send_email_util_1 = require("../../utils/send-email.util");
const userCreateAccountController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, } = req.body;
        const user = new user_model_1.default({
            walletAddress: walletAddress
        });
        let userSaved = yield user.save();
        res.json({
            status: true,
            message: "wallet address captured successfully",
            user: {
                id: userSaved._id,
                walletAddress: userSaved.walletAddress,
            },
        });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.userCreateAccountController = userCreateAccountController;
const checkUserWalletAddressController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, } = req.query;
        const userWalletExists = yield user_model_1.default.findOne({ walletAddress: walletAddress });
        if (userWalletExists) {
            res.json({
                status: true,
                message: "user wallet exist",
                user: {
                    id: userWalletExists._id,
                    walletAddress: userWalletExists.walletAddress,
                },
            });
        }
        else {
            res.json({
                status: false,
                message: "user wallet do not exist",
            });
        }
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.checkUserWalletAddressController = checkUserWalletAddressController;
const userProvideEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, email, name, phoneNumber } = req.body;
        const userWalletExists = yield user_model_1.default.findOne({ walletAddress: walletAddress });
        if (!userWalletExists) {
            return res
                .status(401)
                .json({ message: "please connect your wallet and buy a token" });
        }
        const user = yield user_model_1.default.findOne({ email });
        if (user) {
            if (user.emailOtp.verified) {
                return res
                    .status(401)
                    .json({ message: "email already verified" });
            }
            else {
                const otp = (0, otpGenerator_1.generateOTP)();
                const createdTime = new Date();
                user.emailOtp = {
                    otp,
                    createdTime,
                    verified: false
                };
                yield (user === null || user === void 0 ? void 0 : user.save());
                let emailData = {
                    emailTo: email,
                    subject: "Knowledge Chain email verification",
                    otp,
                    firstName: user.name,
                };
                (0, send_email_util_1.sendUserAccountVerificationEmail)(emailData);
                return res.status(200).json({ message: "OTP sent successfully to your email." });
            }
        }
        const otp = (0, otpGenerator_1.generateOTP)();
        const createdTime = new Date();
        userWalletExists.name = name;
        userWalletExists.email = email;
        userWalletExists.phoneNumber = phoneNumber;
        userWalletExists.emailOtp = {
            otp,
            createdTime,
            verified: false
        };
        yield (userWalletExists === null || userWalletExists === void 0 ? void 0 : userWalletExists.save());
        let emailData = {
            emailTo: email,
            subject: "Knowledge Chain email verification",
            otp,
            firstName: name,
        };
        (0, send_email_util_1.sendUserAccountVerificationEmail)(emailData);
        return res.status(200).json({ message: "OTP sent successfully to your email." });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.userProvideEmailController = userProvideEmailController;
const userVerifyEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        // check if user exists
        if (!user) {
            return res
                .status(401)
                .json({ message: "invalid email" });
        }
        if (user.emailOtp.otp != otp) {
            return res
                .status(401)
                .json({ message: "invalid otp" });
        }
        if (user.emailOtp.verified) {
            return res
                .status(401)
                .json({ message: "email already verified" });
        }
        const timeDiff = new Date().getTime() - user.emailOtp.createdTime.getTime();
        if (timeDiff > otpGenerator_1.OTP_EXPIRY_TIME) {
            return res.status(400).json({ message: "otp expired" });
        }
        user.emailOtp.verified = true;
        yield user.save();
        return res.json({ message: "email verified successfully" });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.userVerifyEmailController = userVerifyEmailController;
const checkUserEmailVerifiedController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, } = req.query;
        const user = yield user_model_1.default.findOne({ walletAddress: walletAddress });
        if (!user) {
            return res
                .status(401)
                .json({ message: "invalid email" });
        }
        if (!user.email || user.email == null) {
            return res
                .status(401)
                .json({ message: "please verify your profile" });
        }
        if (user.emailOtp.verified) {
            res.json({
                status: true,
                message: "email verified",
                user: {
                    id: user._id,
                    walletAddress: user.walletAddress,
                    email: user.email,
                    emailStatus: user.emailOtp.verified
                },
            });
        }
        else {
            res.json({
                status: false,
                message: "email not verified",
                user: {
                    id: user._id,
                    walletAddress: user.walletAddress,
                    email: user.email,
                    emailStatus: user.emailOtp.verified
                },
            });
        }
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.checkUserEmailVerifiedController = checkUserEmailVerifiedController;
