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
exports.sendUserMessageEmail = exports.sendUserAccountVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailVerification_template_1 = require("../templates/emailVerification.template");
let transporter;
const transporterInit = () => {
    // Define the nodemailer transporter
    transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        secure: true,
        secureConnection: false,
        port: 465,
        auth: {
            user: process.env.GMAIL_USERNAME,
            pass: process.env.GMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: true,
        },
    });
};
const sendUserAccountVerificationEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ emailTo, subject, otp, firstName, }) {
    // Init the nodemailer transporter
    transporterInit();
    try {
        let response = yield transporter.sendMail({
            from: "Knowledge Chain",
            to: emailTo,
            subject: subject,
            html: (0, emailVerification_template_1.accountVerifyTemplate)(otp, firstName),
        });
        return response;
    }
    catch (error) {
        throw error;
    }
});
exports.sendUserAccountVerificationEmail = sendUserAccountVerificationEmail;
const sendUserMessageEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ emailTo, subject, message, firstName, }) {
    // Init the nodemailer transporter
    transporterInit();
    try {
        let response = yield transporter.sendMail({
            from: "Knowledge Chain",
            to: emailTo,
            subject: subject,
            html: (0, emailVerification_template_1.messageTemplate)(message, firstName),
        });
        return response;
    }
    catch (error) {
        throw error;
    }
});
exports.sendUserMessageEmail = sendUserMessageEmail;
