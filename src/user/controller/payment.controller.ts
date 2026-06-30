import { validationResult } from "express-validator";
import { Request, Response } from "express";
import UserModel from "../../database/models/user.model";
import TransactionModel from "../../database/models/transaction.model";
import UserTestModel from "../../database/models/userTest.model";
import { PaystackService } from "../../utils/paystack/paystack.payment";
import { TransactionStatus } from "../../database/interface/transaction.interface";
import AmountModel from "../../database/models/amount.model";
import { checkTierAccess, mint } from "../../BlockChain/contractFunctions";
import axios from 'axios'
import FormData from 'form-data'
import { TierTypeAmount } from "../../database/interface/amount.interface";

export const userGetAmountController = async (
    req: Request,
    res: Response,
  ) => {
  
  try {
    const {tier} = req.params
    const amount = await AmountModel.findOne({tier})
  
    res.json({
      amount,
    });
    
  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }
  
}


export const userInitNairaPaymentController = async (
    req: Request,
    res: Response,
  ) => {
  
    try {
      const {
        walletAddress,
        callback,
        tier
      } = req.body;
  
      // const user = await UserModel.findOne({ walletAddress: walletAddress.toString().toLowerCase() });

      const user = await UserModel.findOne({ walletAddress: walletAddress });

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

      // if (user.paid) {
      //   return res
      //     .status(401)
      //     .json({ message: "You have paid Already" });
      // }

      let price

      if (tier) {
        const checkTier2Access = await checkTierAccess(user?.walletAddress!, tier)
        
        // if (checkTier2Access.checkAccess) {
        //   return res.status(401).json({
        //     success: false,
        //     message: "You already mint this NFT",
        //   });
        // }

        if (tier == 1) {
          price = await AmountModel.findOne({tier: TierTypeAmount.Tier1})
          if (!price) {
            return res
              .status(401)
              .json({ message: "Price not set for this tier" });
          }
        }else if (tier == 2) {
          price = await AmountModel.findOne({tier: TierTypeAmount.Tier2})
          if (!price) {
            return res
              .status(401)
              .json({ message: "Price not set for this tier" });
          }
        }else{
          return res
            .status(401)
            .json({ message: "Price not set" });
        }
      }else{
        return res
          .status(401)
          .json({ message: "Price not set" });
      }


      const paystackService = new PaystackService();

      const callbackUrl = callback
      const amount = price.amount;

      const initPayment = await paystackService.initTransaction(user.userEmail, amount, user._id, callbackUrl)

      if (!initPayment.status) {
        return res
          .status(401)
          .json({ message: initPayment.message });
      }

      const transaction = new TransactionModel({
        user: user._id,
        amount: amount,
        tier: tier,
        status: TransactionStatus.Pending,
        reference: initPayment.data.reference
      });

      await transaction.save()

      return res.status(200).json({ data: initPayment});
      
    } catch (err: any) {
      // signup error
      res.status(500).json({ message: err.message });
    }
  
}


  export const userVerifyNairaPaymentController = async (
    req: Request,
    res: Response,
  ) => {
  
    try {
      const {
        walletAddress,
        reference,
        img
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

      const checkTransaction = await TransactionModel.findOne({ user: user._id, reference: reference });
      if (!checkTransaction) {
        return res
          .status(401)
          .json({ message: "Transaction not found" });
      }

      if (checkTransaction.status != TransactionStatus.Pending) {
        return res
          .status(401)
          .json({ message: "Transaction already verified or failed" });
      }

      const paystackService = new PaystackService();

      const verifyPayment = await paystackService.verifyTransaction(reference)

      if (!verifyPayment.status) {
        return res
          .status(401)
          .json({ message: verifyPayment.message });
      }

      const mintNft = await mint(walletAddress, img, checkTransaction.tier)
      if (!mintNft.status) {
        return res
          .status(401)
          .json({ message: mintNft.message });
      }

      const updatedTransaction = await TransactionModel.findOneAndUpdate(
        {user: user._id, reference: reference}, 
        {status: TransactionStatus.Completed},
        {new: true}
      )

     await UserModel.findOneAndUpdate(
        {_id: user._id}, 
        {paid: true},
        {new: true}
      )

      return res.status(200).json({ data: updatedTransaction});
      
    } catch (err: any) {
      // signup error
      res.status(500).json({ message: err.message });
    }
  
  }


  export const userChangePaymentStatusController = async (
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

      if (user.paid) {
        return res
          .status(401)
          .json({ message: "You have paid Already" });
      }


     await UserModel.findOneAndUpdate(
        {_id: user._id, paid: false}, 
        {paid: true},
        {new: true}
      )

      return res.status(200).json({ data: {
        message: "payment status change completely"
      }});
      
    } catch (err: any) {
      // signup error
      res.status(500).json({ message: err.message });
    }
  
  }



export const uploadImageToIPFS = async (req: Request, res: Response) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({ message: 'Image is required' })
    }

    const formData = new FormData()
    formData.append('file', file.buffer, file.originalname)

    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY!,
          pinata_secret_api_key: process.env.PINATA_API_SECRET!,
        },
      }
    )

    const cid = pinataRes.data.IpfsHash

    res.json({
      cid,
      url: `https://ipfs.io/ipfs/${cid}`,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'IPFS upload failed' })
  }
}