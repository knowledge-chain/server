import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import AmountModel from "../../database/models/amount.model";
import { changeTierPrice, tierPrice } from "../../BlockChain/contractFunctions";
import { formatEther, formatUnits } from "ethers";

export const changeAmountController = async (
    req: Request,
    res: Response,
  ) => {
  
  try {
    const {
      amount,
      tier
    } = req.body;

    const checkAmount = await AmountModel.findOne({tier})
    if (!checkAmount) {
        await AmountModel.create({tier, amount})
    }else{
        await AmountModel.findOneAndUpdate({tier}, {amount})
    }
  
    res.json({
      message: "Amount change sucessfully",
    });
    
  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }
  
}


export const getAmountController = async (
    req: Request,
    res: Response,
  ) => {
  
  try { 
    const { tier} = req.params
    const amount = await AmountModel.findOne({tier})
  
    res.json({
      amount,
    });
    
  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }
  
}


export const getAllTierAmountController = async (
    req: Request,
    res: Response,
  ) => {
  
  try {
    const amounts = await AmountModel.find()
  
    res.json({
      amounts,
    });
    
  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }
  
}


export const getTierPriceController = async (
    req: Request,
    res: Response,
  ) => {
  
  try { 
    const {tier} = req.params
    const price = await tierPrice(parseInt(tier))

    if (!price.status) {
      return res.status(400).json({
        message: price.message,
      });
    }
  
    res.json({
      price: parseFloat(formatUnits(price.price.toString(), 6)),
    });
    
  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }
  
}

export const setTierPriceController = async (
    req: Request,
    res: Response,
  ) => {
  
  try { 
    const { tier, amount} = req.body
    const setPrice = await changeTierPrice(parseInt(tier), amount)

    if (!setPrice.status) {
      return res.status(400).json({
        message: setPrice.message,
      });
    }
  
    res.json({
      message: "Tier price set successfully",
      data: setPrice.data,
    });
    
  } catch (err: any) {
    // signup error
    res.status(500).json({ message: err.message });
  }
  
}