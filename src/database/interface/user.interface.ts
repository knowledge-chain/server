import mongoose, { Document, Types, ObjectId } from "mongoose";

export enum UserAccountTypeEnum {
    Web3 = 'web3',
    Web2 = 'web2',
}

export interface IUser extends Document {
  _id: ObjectId;
  walletAddress: string;
  privateKey: string;
  name: string;
  userEmail: string;
  password: string;
  phoneNumber: string;
  isEmailVerified?: boolean;
  emailVerificationCode?: number;
  emailVerificationCodeExpires: Date;
  paid: boolean;
  hasTier2NFT: boolean;
  subscribeToTier2: boolean;
  tier2SubscriptionExpired: boolean;
  currentTier2Sub: mongoose.Types.ObjectId;
  resetPasswordOtp?: number;
  resetPasswordExpires?: Date;
  resetPasswordRequest: boolean;
  userType: string;
  createdAt: Date;
  updatedAt: Date;
}