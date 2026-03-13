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
exports.getTestResultControllerTre = exports.getTestResultControllerTwo = exports.getTestResultController = exports.getAllTestController = exports.adminAddTestController = void 0;
const express_validator_1 = require("express-validator");
const test_model_1 = __importDefault(require("../../database/models/test.model"));
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const google_auth_1 = require("./../../utils/google/google.auth");
const adminAddTestController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, testUrl, spreadsheetUrl } = req.body;
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const checkTest = yield test_model_1.default.findOne({ name });
        // check if user exists
        if (checkTest) {
            return res
                .status(401)
                .json({ message: "Test exists already" });
        }
        const test = new test_model_1.default({
            name,
            url: testUrl,
            spreadSheetUrl: spreadsheetUrl
        });
        let testSaved = yield test.save();
        res.json({
            message: "Test added successfully",
            test: {
                id: testSaved._id,
                name: testSaved.name,
            },
        });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.adminAddTestController = adminAddTestController;
const getAllTestController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, } = req.query;
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pageCheck = parseInt(page) || 1; // or get from query params
        const limitCheck = parseInt(limit) || 50;
        const skip = (pageCheck - 1) * limitCheck;
        const Questions = yield test_model_1.default.find().skip(skip).limit(limitCheck).sort({ createdAt: -1 });
        const total = yield test_model_1.default.countDocuments();
        res.json({
            totalPages: Math.ceil(total / limitCheck),
            currentPage: pageCheck,
            total,
            Questions
        });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.getAllTestController = getAllTestController;
// export const getTestResultController = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const {
//       page,
//       limit,
//       spreadsheetsId
//     } = req.query;
//     // Check for validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const pageCheck: number = parseInt(page as string) || 1; // or get from query params
//     const limitCheck: number = parseInt(limit as string) || 50;
//     const skip = (pageCheck - 1) * limitCheck;
//     const question = await TestModel.findOne({spreadSheetUrl: spreadsheetsId})
//      if (!question) {
//      return res
//        .status(401)
//        .json({ message: "Question not found" });
//     }
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetsId,
//       range: "Form Responses 1", // default sheet name
//     });
//     const rows = response.data.values;
//     if (!rows || rows.length === 0) {
//       return res
//        .status(401)
//        .json({ message: "No Result found Yet" });
//     }
//     const total = rows.length - 1
//     const headers = rows[0];
//     // Remaining rows = user responses
//     const data = rows.slice(1).map(row => {
//       let obj = {};
//       headers.forEach((header, index) => {
//         obj[header] = row[index] || "";
//       });
//       return obj;
//     });
//     res.json({
//       totalPages: Math.ceil(total / limitCheck),
//       currentPage: pageCheck,
//       total,
//       data
//     });
//   } catch (err: any) {
//     // signup error
//     res.status(500).json({ message: err.message });
//   }
// }
const getTestResultController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, spreadsheetsId } = req.query;
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pageCheck = parseInt(page) || 1;
        const limitCheck = parseInt(limit) || 50;
        const skip = (pageCheck - 1) * limitCheck;
        // Check if test exists
        const question = yield test_model_1.default.findOne({
            spreadSheetUrl: spreadsheetsId,
        });
        if (!question) {
            return res.status(401).json({
                message: "Question not found",
            });
        }
        // Fetch Google Sheet data
        const response = yield google_auth_1.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetsId,
            range: "Form Responses 1",
        });
        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(401).json({
                message: "No Result found Yet",
            });
        }
        const headers = rows[0];
        const values = rows.slice(1);
        const total = values.length;
        // Pagination on sheet data
        const paginatedRows = values.slice(skip, skip + limitCheck);
        // Map rows to objects
        const data = paginatedRows.map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
                var _a;
                obj[header] = (_a = row[index]) !== null && _a !== void 0 ? _a : "";
            });
            return obj;
        });
        return res.status(200).json({
            totalPages: Math.ceil(total / limitCheck),
            currentPage: pageCheck,
            total,
            data,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message,
        });
    }
});
exports.getTestResultController = getTestResultController;
const getTestResultControllerTwo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, spreadsheetsId } = req.query;
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pageCheck = parseInt(page) || 1;
        const limitCheck = parseInt(limit) || 50;
        const skip = (pageCheck - 1) * limitCheck;
        // Check if test exists
        const question = yield test_model_1.default.findOne({
            spreadSheetUrl: spreadsheetsId,
        });
        if (!question) {
            return res.status(401).json({
                message: "Question not found",
            });
        }
        // Fetch Google Sheet data
        const response = yield google_auth_1.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetsId,
            range: "Form Responses 1",
        });
        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(401).json({
                message: "No Result found Yet",
            });
        }
        const headers = rows[0];
        const values = rows.slice(1);
        // Convert sheet rows → objects
        const mappedResults = values.map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
                var _a;
                obj[header] = (_a = row[index]) !== null && _a !== void 0 ? _a : "";
            });
            return obj;
        });
        // 🔍 Extract emails from sheet (adjust key if needed)
        const emailsFromSheet = mappedResults
            .map(item => { var _a; return (_a = item["Email Address"]) === null || _a === void 0 ? void 0 : _a.toLowerCase(); })
            .filter(Boolean);
        // Find users with matching emails
        const users = yield user_model_1.default.find({
            email: { $in: emailsFromSheet },
        }).select("email");
        const userEmailSet = new Set(users.map(u => u.email.toLowerCase()));
        // ✅ Keep only sheet responses with email in DB
        // const filteredResults = mappedResults.filter((item) =>{
        //   console.log("item",item)
        //   userEmailSet.has(item["Email Address"]?.toLowerCase())
        // });
        const filteredResults = mappedResults.filter(item => {
            var _a;
            const email = (_a = item["Email Address"]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            console.log("checking email:", email);
            return userEmailSet.has(email);
        });
        const total = filteredResults.length;
        // Pagination AFTER filtering
        const paginatedData = filteredResults.slice(skip, skip + limitCheck);
        return res.status(200).json({
            totalPages: Math.ceil(total / limitCheck),
            currentPage: pageCheck,
            total,
            data: paginatedData,
            response: rows,
            mappedResults,
            emailsFromSheet,
            users,
            userEmailSet,
            filteredResults
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message,
        });
    }
});
exports.getTestResultControllerTwo = getTestResultControllerTwo;
const getTestResultControllerTre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, spreadsheetsId } = req.query;
        // ✅ Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pageCheck = parseInt(page) || 1;
        const limitCheck = parseInt(limit) || 50;
        const skip = (pageCheck - 1) * limitCheck;
        // ✅ Check test existence
        const question = yield test_model_1.default.findOne({
            spreadSheetUrl: spreadsheetsId,
        });
        if (!question) {
            return res.status(404).json({
                message: "Question not found",
            });
        }
        // ✅ Fetch Google Sheet
        const response = yield google_auth_1.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetsId,
            range: "Form Responses 1",
        });
        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(404).json({
                message: "No Result found yet",
            });
        }
        // ✅ Separate headers and values
        const headers = rows[0];
        const values = rows.slice(1);
        // ✅ Find Email column index (robust)
        const emailColumnIndex = headers.findIndex(h => h.toLowerCase().includes("email"));
        if (emailColumnIndex === -1) {
            return res.status(400).json({
                message: "Email column not found in sheet",
            });
        }
        // ✅ Extract emails from sheet
        const emailsFromSheet = values
            .map(row => { var _a; return (_a = row[emailColumnIndex]) === null || _a === void 0 ? void 0 : _a.toLowerCase(); })
            .filter(Boolean);
        // ✅ Fetch users with matching emails
        const users = yield user_model_1.default.find({
            email: { $in: emailsFromSheet },
        }).select("email");
        const userEmailSet = new Set(users.map(u => u.email.toLowerCase()));
        // ✅ Filter sheet rows by DB users
        const filteredRows = values.filter(row => {
            var _a;
            const email = (_a = row[emailColumnIndex]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            return userEmailSet.has(email);
        });
        // ✅ Pagination AFTER filtering
        const paginatedRows = filteredRows.slice(skip, skip + limitCheck);
        // ✅ FINAL RESPONSE (Google Sheet format)
        return res.status(200).json({
            totalPages: Math.ceil(filteredRows.length / limitCheck),
            currentPage: pageCheck,
            total: filteredRows.length,
            data: [
                headers, // 👈 header row
                ...paginatedRows // 👈 filtered user rows
            ],
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || "Server error",
        });
    }
});
exports.getTestResultControllerTre = getTestResultControllerTre;
