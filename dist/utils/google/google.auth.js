"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheets = void 0;
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const auth = new google.auth.GoogleAuth({
//     keyFile: "google-sheet-credential.json",
//     scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
//     // scopes: "https://www.googleapis.com/auth/spreadsheets",
// });
// export const sheets = google.sheets({ version: "v4", auth });
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: {
        project_id: process.env.GOOGLE_PROJECT_ID,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
exports.sheets = googleapis_1.google.sheets({ version: "v4", auth });
