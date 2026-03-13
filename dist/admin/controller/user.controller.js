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
exports.messageAllUsersController = exports.messageSingleUserController = exports.getAllUserNotPaidController = exports.getAllUserController = exports.getSingleUserController = void 0;
const express_validator_1 = require("express-validator");
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const send_email_util_1 = require("../../utils/send-email.util");
const google_auth_1 = require("./../../utils/google/google.auth");
const userTest_model_1 = __importDefault(require("../../database/models/userTest.model"));
const test_model_1 = __importDefault(require("../../database/models/test.model"));
// export const getSingleUserController = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const { userId } = req.query;
//     // Validate request
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     // 1️⃣ Get user
//     const user = await UserModel.findById(userId);
//     if (!user || !user.email) {
//       return res.status(401).json({
//         message: "User does not exist or has no email",
//       });
//     }
//     // 2️⃣ Check if user started test
//     const userTest = await UserTestModel.findOne({
//       user: user._id,
//     });
//     if (!userTest) {
//       return res.status(401).json({
//         message: "User has not started test",
//       });
//     }
//     // 3️⃣ Get test
//     const question = await TestModel.findById(userTest.test);
//     if (!question) {
//       return res.status(401).json({
//         message: "Test question not found",
//       });
//     }
//     // 4️⃣ Fetch Google Sheet
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: question.spreadSheetUrl,
//       range: "Form Responses 1",
//     });
//     const rows = response.data.values as string[][] | undefined;
//     if (!rows || rows.length <= 1) {
//       return res.status(401).json({
//         message: "No result found yet",
//       });
//     }
//     const headers: string[] = rows[0];
//     const values: string[][] = rows.slice(1);
//     // 5️⃣ Convert rows → objects
//     const results = values.map((row: string[]) => {
//       const obj: Record<string, string> = {};
//       headers.forEach((header: string, index: number) => {
//         obj[header] = row[index] ?? "";
//       });
//       return obj;
//     });
//     // 🔍 6️⃣ Find ONLY this user's result by email
//     // ⚠️ Change "Email" if your column name is different
//     const userResult = results.find(
//       (item )=>{
//         console.log("item", item)
//         return item["Email Address"]?.toLowerCase() === user.email!.toLowerCase()
//     });
//     if (!userResult) {
//       return res.status(404).json({
//         message: "No test result found for this user",
//       });
//     }
//     // 7️⃣ Return single user + his result
//     return res.status(200).json({
//       user,
//       testResult: userResult,
//     });
//   } catch (err: any) {
//     console.error(err);
//     return res.status(500).json({
//       message: err.message,
//     });
//   }
// };
const getSingleUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // 1️⃣ Get user
        const user = yield user_model_1.default.findById(userId);
        if (!user || !user.email) {
            return res.status(401).json({
                message: "User does not exist or has no email",
            });
        }
        // 2️⃣ Check if user started test
        const userTest = yield userTest_model_1.default.findOne({
            user: user._id,
        });
        if (!userTest) {
            return res.status(401).json({
                message: "User has not started test",
            });
        }
        // 3️⃣ Get test
        const question = yield test_model_1.default.findById(userTest.test);
        if (!question) {
            return res.status(401).json({
                message: "Test question not found",
            });
        }
        // 4️⃣ Fetch Google Sheet
        const response = yield google_auth_1.sheets.spreadsheets.values.get({
            spreadsheetId: question.spreadSheetUrl,
            range: "Form Responses 1",
        });
        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(401).json({
                message: "No result found yet",
            });
        }
        const headers = rows[0]; // header row
        const values = rows.slice(1); // actual responses
        // 5️⃣ Find email column index dynamically (SAFE)
        const emailColumnIndex = headers.findIndex(h => h.toLowerCase() === "email address");
        if (emailColumnIndex === -1) {
            return res.status(500).json({
                message: "Email column not found in sheet",
            });
        }
        // 6️⃣ Find THIS user's row
        const userRow = values.find(row => {
            var _a;
            return ((_a = row[emailColumnIndex]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) ===
                user.email.toLowerCase();
        });
        if (!userRow) {
            return res.status(404).json({
                message: "No test result found for this user",
            });
        }
        // 7️⃣ RETURN ARRAY FORMAT ✅
        return res.status(200).json({
            user,
            testResult: [
                headers,
                userRow,
            ],
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message,
        });
    }
});
exports.getSingleUserController = getSingleUserController;
const getAllUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, search } = req.query;
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pageCheck = parseInt(page) || 1; // or get from query params
        const limitCheck = parseInt(limit) || 50;
        const skip = (pageCheck - 1) * limitCheck;
        const query = {};
        if (search && typeof search === 'string') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ];
        }
        const users = yield user_model_1.default.find(query).skip(skip).limit(limitCheck).sort({ createdAt: -1 });
        const total = yield user_model_1.default.countDocuments(query);
        res.json({
            totalPages: Math.ceil(total / limitCheck),
            currentPage: pageCheck,
            total,
            users
        });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.getAllUserController = getAllUserController;
const getAllUserNotPaidController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, search } = req.query;
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pageCheck = parseInt(page) || 1; // or get from query params
        const limitCheck = parseInt(limit) || 50;
        const skip = (pageCheck - 1) * limitCheck;
        // 🔍 Build search query
        const query = { paid: false };
        if (search && typeof search === 'string') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ];
        }
        const users = yield user_model_1.default.find(query).skip(skip).limit(limitCheck).sort({ createdAt: -1 });
        const total = yield user_model_1.default.countDocuments(query);
        res.json({
            totalPages: Math.ceil(total / limitCheck),
            currentPage: pageCheck,
            total,
            users
        });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.getAllUserNotPaidController = getAllUserNotPaidController;
const messageSingleUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, message, subject } = req.body;
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = yield user_model_1.default.findOne({ _id: userId });
        if (!user) {
            return res
                .status(401)
                .json({ message: "User do not exist" });
        }
        if (!user.email || user.email == undefined) {
            return res
                .status(401)
                .json({ message: "User Profile not verify" });
        }
        let emailData = {
            emailTo: user.email,
            subject: subject,
            message,
            firstName: user.name,
        };
        (0, send_email_util_1.sendUserMessageEmail)(emailData);
        return res.status(200).json({ message: "email sent successfully" });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.messageSingleUserController = messageSingleUserController;
const messageAllUsersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message, subject } = req.body;
        // Validation
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Fetch users with emails
        const users = yield user_model_1.default.find({
            email: { $exists: true, $ne: null },
        }).select('email name');
        if (!users.length) {
            return res.status(404).json({
                message: 'No users with valid email found',
            });
        }
        let sentCount = 0;
        for (const user of users) {
            try {
                const emailData = {
                    emailTo: user.email,
                    subject,
                    message,
                    firstName: user.name,
                };
                yield (0, send_email_util_1.sendUserMessageEmail)(emailData);
                sentCount++;
            }
            catch (err) {
                console.error(`Failed to send to ${user.email}`, err);
                // continue sending to others
            }
        }
        return res.status(200).json({
            message: 'Bulk email sent successfully',
            totalUsers: users.length,
            emailsSent: sentCount,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.messageAllUsersController = messageAllUsersController;
