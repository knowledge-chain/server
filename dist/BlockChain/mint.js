"use strict";
// import { ethers } from 'ethers'
// import { nftTokenAbi } from "./nftToken.abi";
// import dotenv from 'dotenv'
// dotenv.config()
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
exports.mint = void 0;
// const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
// const signer = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATEKEY!, provider);
// const contract = new ethers.Contract(process.env.NFT_TOKEN_CONTRACT_ADDRESS!, nftTokenAbi, provider) as any;
// export const mint = async (walletAddress: any, img: any) => {
//     try {
//         console.log(1)
//         const tx = await contract.connect(signer).mintOption(walletAddress, img,);
//         console.log(2)
//         console.log("Transaction sent:", tx.hash);
//         const receipt = await tx.wait();
//         console.log(3)
//         console.log("Transaction mined:", receipt);
//         console.log(4)
//         return {
//             status: true,
//             data: receipt
//         }
//     } catch (error) {
//         console.log('error', error)
//         return {
//             status: false,
//             message: "Unable to perform mint transaction"
//         }
//     }
// }
const ethers_1 = require("ethers");
const nftToken_abi_1 = require("./nftToken.abi");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.PROVIDER_URL);
const signer = new ethers_1.ethers.Wallet(process.env.ADMIN_WALLET_PRIVATEKEY, provider);
const contract = new ethers_1.ethers.Contract(process.env.NFT_TOKEN_CONTRACT_ADDRESS, nftToken_abi_1.nftTokenAbi, signer);
const mint = (walletAddress, img) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("walletAddress", walletAddress);
    try {
        console.log("Start minting...");
        const tx = yield contract.mintOption(walletAddress, img);
        console.log("Transaction sent:", tx.hash);
        const receipt = yield tx.wait();
        console.log("Transaction mined:", receipt);
        return {
            status: true,
            data: receipt,
        };
    }
    catch (error) {
        console.log("Mint error:", error);
        try {
            console.log("Decoded error:", contract.interface.parseError(error.data));
        }
        catch (_a) { }
        return {
            status: false,
            message: "Unable to perform mint transaction",
        };
    }
});
exports.mint = mint;
