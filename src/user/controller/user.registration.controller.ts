import { validationResult } from "express-validator";
import { Request, Response } from "express";
import UserModel from "../../database/models/user.model";
import { OTP_EXPIRY_TIME, generateOTP } from "../../utils/otpGenerator";
import { sendUserAccountVerificationEmail } from "../../utils/send-email.util";
import { UserAccountTypeEnum } from "../../database/interface/user.interface";
import { generateUserToken } from "../../utils/jwt.util";


export const userCreateAccountController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      walletAddress,
    } = req.body;

    // const walletModify = (walletAddress as string).toLowerCase().trim();

    const checkWallet = await UserModel.findOne({walletAddress: walletAddress})
    if (checkWallet) {
      const token = generateUserToken({ userId: checkWallet._id, walletAddress: checkWallet.walletAddress });
      res.json({
        status: true,
        token,
        message: "wallet address captured successfully",
        user: {
          id: checkWallet._id,
          walletAddress: checkWallet.walletAddress,
          userType: checkWallet.userType
        },

      });
    }else{
      const user = new UserModel({
        walletAddress: walletAddress,
        userType: UserAccountTypeEnum.Web3
      });

      let userSaved = await user.save();

      const token = generateUserToken({ userId: userSaved._id, walletAddress: userSaved.walletAddress });

      res.json({
        status: true,
        message: "wallet address captured successfully",
        token,
        user: {
          id: userSaved._id,
          walletAddress: userSaved.walletAddress,
          userType: userSaved.userType
        },

      });
    }

  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }

}

export const checkUserWalletAddressController = async (
  req: Request,
  res: Response,
) => {

  try {
    const {
      walletAddress,
    } = req.query;
  
    // const userWalletExists = await UserModel.findOne({ walletAddress: walletAddress!.toString().toLowerCase() });
     const userWalletExists = await UserModel.findOne({ walletAddress: walletAddress });
  
    if (userWalletExists) {
      res.json({
        status: true,
        message: "user wallet exist",
        user: {
          id: userWalletExists._id,
          walletAddress: userWalletExists.walletAddress,
        },
  
      });
    }else{

      res.json({
        status: false,
        message: "user wallet do not exist",
      });

    }
    
  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }

}

export const userProvideEmailController = async (
  req: Request,
  res: Response,
) => {

  try {
    const {
      walletAddress,
      email,
      name,
      phoneNumber
    } = req.body;
  
    const userWalletExists = await UserModel.findOne({ walletAddress: walletAddress });
  
    if (!userWalletExists) {
      return res
        .status(401)
        .json({ message: "please connect your wallet and buy a token" });
    }

    const user = await UserModel.findOne({ userEmail: email });

    if (user) {
      if (user.isEmailVerified) {
        return res
            .status(401)
            .json({ message: "email already verified" });
      }else{

        const otp = parseInt(Math.floor(1000 + Math.random() * 9000).toString(),10,)

        const emailVerificationCodeExpires = new Date()
        emailVerificationCodeExpires.setMinutes(
        emailVerificationCodeExpires.getMinutes() + 15,
        )

        user.emailVerificationCode = otp,
        user.emailVerificationCodeExpires =emailVerificationCodeExpires

        await user?.save();

        let emailData = {
            emailTo: email,
            subject: "Knowledge Chain email verification",
            otp: otp.toString(),
            firstName: user.name,
        };

        sendUserAccountVerificationEmail(emailData);
        return res.status(200).json({ message: "OTP sent successfully to your email." });

      }
    }

    const otp = parseInt(Math.floor(1000 + Math.random() * 9000).toString(),10,)

    const emailVerificationCodeExpires = new Date()
    emailVerificationCodeExpires.setMinutes(
    emailVerificationCodeExpires.getMinutes() + 15,
    )

    userWalletExists.name = name
    userWalletExists.userEmail = email
    userWalletExists.phoneNumber = phoneNumber
    userWalletExists.emailVerificationCode = otp,
    userWalletExists.emailVerificationCodeExpires =emailVerificationCodeExpires

    await userWalletExists?.save();

    let emailData = {
        emailTo: email,
        subject: "Knowledge Chain email verification",
        otp: otp.toString(),
        firstName: name,
    };

    sendUserAccountVerificationEmail(emailData);
    return res.status(200).json({ message: "OTP sent successfully to your email." });
    
  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }

}


// export const userVerifyEmailController = async (
//   req: Request,
//   res: Response,
// ) => {

//   try {
//     const {
//       email,
//       otp
//     } = req.body;
  
//     const user = await UserModel.findOne({ userEmail: email });
    
//     // check if user exists
//     if (!user) {
//      return res
//        .status(401)
//        .json({ message: "invalid email" });
//    }

//    if (user.emailOtp.otp != otp) {
//        return res
//        .status(401)
//        .json({ message: "invalid otp" });
//    }

//    if (user.emailOtp.verified) {
//        return res
//        .status(401)
//        .json({ message: "email already verified" });
//    }

//    const timeDiff = new Date().getTime() - user.emailOtp.createdTime.getTime();
//    if (timeDiff > OTP_EXPIRY_TIME) {
//        return res.status(400).json({ message: "otp expired" });
//    }

//    user.emailOtp.verified = true;

//    await user.save();

//    return res.json({ message: "email verified successfully" });
    
//   } catch (err: any) {
//     // signup error
//     res.status(500).json({ message: err.message });
//   }

// }


export const checkUserEmailVerifiedController = async (
  req: Request,
  res: Response,
) => {

  try {
    const {
      walletAddress,
    } = req.query;
  
    const user = await UserModel.findOne({ walletAddress: walletAddress });
 
    if (!user) {
     return res
       .status(401)
       .json({ message: "invalid email" });
    }

    if (!user.userEmail || user.userEmail == null) {
      return res
        .status(401)
        .json({ message: "please verify your profile" });
    }

   if (user.isEmailVerified) {
    res.json({
      status: true,
      message: "email verified",
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        email: user.userEmail,
        emailStatus: user.isEmailVerified
      },

    });
   }else{
    res.json({
      status: false,
      message: "email not verified",
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        email: user.userEmail,
        emailStatus: user.isEmailVerified
      },

    });
   }
    
  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }

}


