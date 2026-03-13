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
exports.checkIfUserHasTestLinkController = exports.userGetTestLinkController = exports.userRequestForTestQuestionController = void 0;
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const test_model_1 = __importDefault(require("../../database/models/test.model"));
const userTest_model_1 = __importDefault(require("../../database/models/userTest.model"));
const userRequestForTestQuestionController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, } = req.body;
        const user = yield user_model_1.default.findOne({ walletAddress: walletAddress });
        if (!user) {
            return res
                .status(401)
                .json({ message: "please connect your wallet" });
        }
        if (!user.email || user.email == null || user.email == '') {
            return res
                .status(401)
                .json({ message: "please verify your profile" });
        }
        if (!user.emailOtp.verified) {
            return res
                .status(401)
                .json({ message: "please verify your profile" });
        }
        const checkUserTest = yield userTest_model_1.default.findOne({ user: user._id });
        if (checkUserTest) {
            return res
                .status(401)
                .json({ message: "You have the test link Already" });
        }
        const randomQuestion = yield test_model_1.default.aggregate([
            { $sample: { size: 1 } }
        ]);
        const userTest = new userTest_model_1.default({
            user: user._id,
            test: randomQuestion[0]._id
        });
        const savedUserTest = yield userTest.save();
        return res.status(200).json({ data: randomQuestion });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.userRequestForTestQuestionController = userRequestForTestQuestionController;
const userGetTestLinkController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, } = req.query;
        const user = yield user_model_1.default.findOne({ walletAddress: walletAddress });
        if (!user) {
            return res
                .status(401)
                .json({ message: "please connect your wallet" });
        }
        if (!user.email || user.email == null || user.email == '') {
            return res
                .status(401)
                .json({ message: "please verify your profile" });
        }
        if (!user.emailOtp.verified) {
            return res
                .status(401)
                .json({ message: "please verify your profile" });
        }
        const checkUserTest = yield userTest_model_1.default.findOne({ user: user._id });
        if (!checkUserTest) {
            return res
                .status(401)
                .json({ message: "Unable to get Test link" });
        }
        const question = yield test_model_1.default.findOne({ _id: checkUserTest.test });
        return res.status(200).json({ data: question });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.userGetTestLinkController = userGetTestLinkController;
const checkIfUserHasTestLinkController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, } = req.query;
        const user = yield user_model_1.default.findOne({ walletAddress: walletAddress });
        if (!user) {
            return res
                .status(401)
                .json({ message: "please connect your wallet" });
        }
        const checkUserTest = yield userTest_model_1.default.findOne({ user: user._id });
        if (checkUserTest) {
            res.json({
                status: true,
                message: "Test link available",
            });
        }
        else {
            res.json({
                status: false,
                message: "Test link not available",
            });
        }
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.checkIfUserHasTestLinkController = checkIfUserHasTestLinkController;
