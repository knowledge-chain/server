"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP_EXPIRY_TIME = void 0;
exports.generateOTP = generateOTP;
// Generate a new OTP
function generateOTP() {
    let otp = "";
    //const allowedChars =
    //  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    const allowedChars = "0123456789";
    for (let i = 0; i < 4; i++) {
        otp += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
    }
    return otp;
}
exports.OTP_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
