import { validationResult } from "express-validator";
import { Request, Response } from "express";
import UserModel from "../../database/models/user.model";
import TestQuestionModel from "../../database/models/test.model";
import UserTestModel from "../../database/models/userTest.model";


export const userRequestForTestQuestionController = async (
    req: Request,
    res: Response,
  ) => {
  
    try {
      const {
        walletAddress,
      } = req.body;
  
      const user = await UserModel.findOne({ walletAddress: walletAddress.toString().toLowerCase() });

      if (!user) {
        return res
          .status(401)
          .json({ message: "please connect your wallet" });
      }

      if (!user.userEmail || user.userEmail == null || user.userEmail == '') {
        return res
          .status(401)
          .json({ message: "please verify your profile" });
      }

      if (!user.isEmailVerified) {
        return res
          .status(401)
          .json({ message: "please verify your profile" });
      }

      const checkUserTest = await UserTestModel.findOne({ user: user._id });
      if (checkUserTest) {
        return res
          .status(401)
          .json({ message: "You have the test link Already" });
      }

      const randomQuestion = await TestQuestionModel.aggregate([
        { $sample: { size: 1 } }
      ]);

      const userTest = new UserTestModel({
        user: user._id,
        test: randomQuestion[0]._id
      });

      const savedUserTest = await userTest.save()

      return res.status(200).json({ data: randomQuestion});
      
    } catch (err: any) {
      // signup error
      res.status(500).json({ message: err.message });
    }
  
  }


  export const userGetTestLinkController = async (
    req: Request,
    res: Response,
  ) => {
  
    try {
      const {
        walletAddress,
      } = req.query;
  
      const user = await UserModel.findOne({ walletAddress: walletAddress!.toString().toLowerCase() });

      if (!user) {
        return res
          .status(401)
          .json({ message: "please connect your wallet" });
      }

      if (!user.userEmail || user.userEmail == null || user.userEmail == '') {
        return res
          .status(401)
          .json({ message: "please verify your profile" });
      }

      if (!user.isEmailVerified) {
        return res
          .status(401)
          .json({ message: "please verify your profile" });
      }

      const checkUserTest = await UserTestModel.findOne({ user: user._id });
      if (!checkUserTest) {
        return res
          .status(401)
          .json({ message: "Unable to get Test link" });
      }

      const question = await TestQuestionModel.findOne({ _id: checkUserTest.test })

      return res.status(200).json({ data: question});
      
    } catch (err: any) {
      // signup error
      res.status(500).json({ message: err.message });
    }
  
  }


  export const checkIfUserHasTestLinkController = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const {
        walletAddress,
      } = req.query;
  
      const user = await UserModel.findOne({ walletAddress: walletAddress!.toString().toLowerCase() });

      if (!user) {
        return res
          .status(401)
          .json({ message: "please connect your wallet" });
      }

      const checkUserTest = await UserTestModel.findOne({ user: user._id });
      if (checkUserTest) {
        res.json({
          status: true,
          message: "Test link available",
        });
       }else{
        res.json({
          status: false,
          message: "Test link not available",
        });
       }
      
    } catch (err: any) {
      // signup error
      res.status(500).json({ message: err.message });
    }
  
  }