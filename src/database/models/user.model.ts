import { Schema, model } from "mongoose";
import { IUser, UserAccountTypeEnum } from "../interface/user.interface";

const UserSchema: Schema<IUser> = new Schema(
    { 
      walletAddress: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
      },
      privateKey: {
        type: String
      },
      name: {
        type: String,
      },
      userEmail: {
        type: String, 
        default: "",
        trim: true,
        lowercase: true,
      },
      password: { 
        type: String 
      },
      phoneNumber: {
        type: String,
      },
      paid: {
        type: Boolean,
        default: false
      },
      hasTier2NFT: {
        type: Boolean,
        default: false,
      },
      subscribeToTier2: {
        type: Boolean,
        default: false,
      },
      tier2SubscriptionExpired: {
        type: Boolean,
        default: true,
      },
      currentTier2Sub: {
        type: Schema.Types.ObjectId, ref: 'Tier2Subcription',
      },
      isEmailVerified: { type: Boolean, default: false },
      emailVerificationCode: { type: Number },
      emailVerificationCodeExpires: { type: Date },
      resetPasswordOtp: { type: Number },
      resetPasswordExpires: { type: Date },
      resetPasswordRequest: {type: Boolean, default: false},
      userType: {
        type: String,
        enum: UserAccountTypeEnum
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      }, 
    },
    {
      timestamps: true,
    }
  );
  
  const UserModel = model<IUser>("User", UserSchema);
  
  export default UserModel;