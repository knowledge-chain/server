import { Request, Response } from 'express'
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from '../../utils/bcrypt.util'
import UserModel from "../../database/models/user.model";
import { sendForgotEmail, sendUserAccountVerificationEmail } from '../../utils/send-email.util';
import { generateUserToken } from '../../utils/jwt.util';
import { createWallet } from '../../BlockChain/wallet';
import { UserAccountTypeEnum } from '../../database/interface/user.interface';

export const userSignupController = async (
  req: Request,
  res: Response,
) => {
  try {
        const { email, password } = req.body 

        const trimEmail = (email as string).toLowerCase().trim()
        const checkEmail = await UserModel.findOne({userEmail: trimEmail})
        if (checkEmail) return res.status(401).send('Email already exist')

        const otp = parseInt(Math.floor(1000 + Math.random() * 9000).toString(),10,)

        const emailVerificationCodeExpires = new Date()
        emailVerificationCodeExpires.setMinutes(
        emailVerificationCodeExpires.getMinutes() + 15,
        )

        await sendUserAccountVerificationEmail({emailTo: trimEmail, subject: "Email verification", otp: otp.toString()})

        const hashedPassword = await hashPassword(password);

        const createAddress = createWallet()

        const privateKey = jwt.sign(
            { private: createAddress.privateKey },
            process.env.PRIVATE_KEY_SECRET!,
        );

        // create categories
        const newUser = new UserModel({ 
            userEmail: trimEmail,
            password: hashedPassword,
            walletAddress: createAddress.address,
            privateKey: privateKey,
            emailVerificationCode: otp,
            userType: UserAccountTypeEnum.Web2,
            emailVerificationCodeExpires: emailVerificationCodeExpires
        });

        const saveNewUser = await newUser.save()
      return res
      .status(200)
      .json({ message: 'Sign up successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
};


export const userResendEmailController = async (
  req: Request,
  res: Response,
) => {
  try {
        const { email } = req.body 

        const checkEmail = await UserModel.findOne({userEmail: email})
        if (!checkEmail) return res.status(401).send('Email do no exist')

        if (checkEmail.isEmailVerified) {
          return res.status(401).send('Email already verify')
        }

        const otp = parseInt(Math.floor(1000 + Math.random() * 9000).toString(),10,)

        const emailVerificationCodeExpires = new Date()
        emailVerificationCodeExpires.setMinutes(
        emailVerificationCodeExpires.getMinutes() + 15,
        )

        await sendUserAccountVerificationEmail({emailTo: email, subject: "Email verification", otp: otp.toString()})

        checkEmail.emailVerificationCode = otp,
        checkEmail.emailVerificationCodeExpires =emailVerificationCodeExpires
        await checkEmail.save()

      
      return res
      .status(200)
      .json({ message: 'OTP sent successfully', data: {email: checkEmail.userEmail} });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
};


export const userVerifyEmailController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, otp } = req.body 

    const user = await UserModel.findOne({userEmail: email})
    if (!user) return res.status(401).send('Email do no exist')

    if (user.isEmailVerified) {
      return res.status(401).send('Email already verified')
    }

    if (new Date() > user.emailVerificationCodeExpires) {
      return res.status(400).json({ message: 'Verification code has expired' })
    }

    // Verify code
    const emailVerificationCode = user.emailVerificationCode
    if (!emailVerificationCode) {
      return res
        .status(400)
        .json({ message: 'Email verification code is undefined' })
    }

    
    if (emailVerificationCode !== parseInt(otp.trim(), 10)) {
      return res.status(400).json({ message: 'Invalid otp' })
    }

    // Update user's isEmailVerified status to true
    user.isEmailVerified = true
    await user.save()

    return res.status(200).json({ message: 'Email verified successfully' })
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
};

export const userLoginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ userEmail: email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Email not verified.' })
    }

    const isPasswordValid = await comparePassword(password, user?.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateUserToken({ userId: user._id, walletAddress: user.walletAddress });
    res.json({ message: 'logged in successfully', data: { token, name: user.name, email: user.userEmail, walletAddress: user.walletAddress, userType: user.userType } });
  } catch (error) {
    console.log("error", error)
    res.status(500).send('Error logging in.');
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({userEmail:  email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email.' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    user.resetPasswordExpires = new Date(); // 30 minutes from now
    user.resetPasswordExpires.setMinutes(user.resetPasswordExpires.getMinutes() + 15);
    user.resetPasswordOtp = otp;
    user.resetPasswordRequest = true;

    await  user.save();

    sendForgotEmail({ emailTo: user.userEmail,  otp: otp.toString()})
    res.json({ message: 'OTP sent successfully', data: {email: user.userEmail} });
  } catch (error) {
    console.log("error", error)
    res.status(500).send('Error logging in.');
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, password, otp } = req.body;
    const user = await UserModel.findOne({ userEmail: email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email.' });
    }

    // Check if OTP is valid and not expired
    if (user.resetPasswordOtp !== parseInt(otp.trim(), 10)) {
        return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    if (!user.resetPasswordRequest) {
        return res.status(401).json({ message: 'Please request for password change' });
    }

    const hashedPassword = await hashPassword(password);

    user.resetPasswordRequest = false
    user.password = hashedPassword
    await user.save()
    res.json({ message: 'password successfully change', data: {email: user.userEmail} });
  } catch (error) {
    console.log("error", error)
    res.status(500).send('Error.');
  }
};

export const userProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await UserModel.findOne({ _id: userId }).select('-password -emailVerificationCode -resetPasswordOtp -resetPasswordExpires -resetPasswordRequest, -privateKey');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    res.json({user});
  } catch (error) {
    console.log("error", error)
    res.status(500).send('Error.');
  }
};

export const editProfileController = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user?._id;

    const user = await UserModel.findOne({ _id: userId }).select('-password -emailVerificationCode -resetPasswordOtp -resetPasswordExpires -resetPasswordRequest -privateKey');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    user.name = name
    await user.save()

    res.json({user});
  } catch (error) {
    console.log("error", error)
    res.status(500).send('Error.');
  }
};

export const userAuth = {
    userSignupController,
    userResendEmailController,
    userVerifyEmailController,
    userLoginController,
    forgotPasswordController,
    resetPasswordController,

    userProfileController,
    editProfileController,
}

