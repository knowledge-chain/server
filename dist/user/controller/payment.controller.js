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
exports.uploadImageToIPFS = exports.userChangePaymentStatusController = exports.userVerifyNairaPaymentController = exports.userInitNairaPaymentController = void 0;
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const transaction_model_1 = __importDefault(require("../../database/models/transaction.model"));
const paystack_payment_1 = require("../../utils/paystack/paystack.payment");
const transaction_interface_1 = require("../../database/interface/transaction.interface");
const mint_1 = require("../../BlockChain/mint");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const userInitNairaPaymentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, callback } = req.body;
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
        // if (user.paid) {
        //   return res
        //     .status(401)
        //     .json({ message: "You have paid Already" });
        // }
        const paystackService = new paystack_payment_1.PaystackService();
        const callbackUrl = callback;
        const amount = 2000;
        const initPayment = yield paystackService.initTransaction(user.email, amount, user._id, callbackUrl);
        if (!initPayment.status) {
            return res
                .status(401)
                .json({ message: initPayment.message });
        }
        const transaction = new transaction_model_1.default({
            user: user._id,
            amount: amount,
            status: transaction_interface_1.TransactionStatus.Pending,
            reference: initPayment.data.reference
        });
        yield transaction.save();
        return res.status(200).json({ data: initPayment });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.userInitNairaPaymentController = userInitNairaPaymentController;
const userVerifyNairaPaymentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, reference, img } = req.body;
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
        const checkTransaction = yield transaction_model_1.default.findOne({ user: user._id, reference: reference });
        if (!checkTransaction) {
            return res
                .status(401)
                .json({ message: "Transaction not found" });
        }
        if (checkTransaction.status != transaction_interface_1.TransactionStatus.Pending) {
            return res
                .status(401)
                .json({ message: "Transaction already verified or failed" });
        }
        const paystackService = new paystack_payment_1.PaystackService();
        const verifyPayment = yield paystackService.verifyTransaction(reference);
        if (!verifyPayment.status) {
            return res
                .status(401)
                .json({ message: verifyPayment.message });
        }
        const mintNft = yield (0, mint_1.mint)(walletAddress, img);
        if (!mintNft.status) {
            return res
                .status(401)
                .json({ message: mintNft.message });
        }
        const updatedTransaction = yield transaction_model_1.default.findOneAndUpdate({ user: user._id, reference: reference }, { status: transaction_interface_1.TransactionStatus.Completed }, { new: true });
        yield user_model_1.default.findOneAndUpdate({ _id: user._id }, { paid: true }, { new: true });
        return res.status(200).json({ data: updatedTransaction });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.userVerifyNairaPaymentController = userVerifyNairaPaymentController;
const userChangePaymentStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (user.paid) {
            return res
                .status(401)
                .json({ message: "You have paid Already" });
        }
        yield user_model_1.default.findOneAndUpdate({ _id: user._id, paid: false }, { paid: true }, { new: true });
        return res.status(200).json({ data: {
                message: "payment status change completely"
            } });
    }
    catch (err) {
        // signup error
        res.status(500).json({ message: err.message });
    }
});
exports.userChangePaymentStatusController = userChangePaymentStatusController;
const uploadImageToIPFS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'Image is required' });
        }
        const formData = new form_data_1.default();
        formData.append('file', file.buffer, file.originalname);
        const pinataRes = yield axios_1.default.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: Object.assign(Object.assign({}, formData.getHeaders()), { pinata_api_key: process.env.PINATA_API_KEY, pinata_secret_api_key: process.env.PINATA_API_SECRET }),
        });
        const cid = pinataRes.data.IpfsHash;
        res.json({
            cid,
            url: `https://ipfs.io/ipfs/${cid}`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'IPFS upload failed' });
    }
});
exports.uploadImageToIPFS = uploadImageToIPFS;
