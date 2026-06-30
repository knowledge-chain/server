import { Request, Response } from "express";
import Tier2PlanModel from "../../database/models/tier2Plan.model";
import Tier2SubscriptionModel from "../../database/models/tier2Subscription.model";
import Tier2BillingModel from "../../database/models/tier2Billing.model";
import Tier2PaymentHistoryModel from "../../database/models/tier2PaymentHistory.model";
import UserModel from "../../database/models/user.model";
import mongoose from "mongoose";
import { Tier2PlanStatus } from "../../database/interface/tier2Plan.interface";
import { v4 as uuidv4 } from 'uuid';
import { Tier2BillingStatus } from "../../database/interface/tier2Billing.interface";
import { Tier2SubcriptionDuration, Tier2SubcriptionStatus } from "../../database/interface/tier2Subscription.interface";
import { PaystackService } from "../../utils/paystack/paystack.payment";
import { Tier2PaymentMethodEnum } from "../../database/interface/tier2PaymentHistory.interface";


export const fetchTier2PlansController = async (
  req: Request,
  res: Response,
) => {
  try {
    const plans = await Tier2PlanModel.find({status: Tier2PlanStatus.Avialable}).sort({ createdAt: -1 });

    return res.status(200).json({
      data: plans,
    });
  } catch (err: any) {
    console.log("err", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

export const subcribeToTier2Controller = async (
  req: Request,
  res: Response,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { planId, callbackUrl } = req.body;
    const userId = req.user?._id;

    const user = await UserModel.findOne({
      _id: userId,
    }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    const plan = await Tier2PlanModel.findOne({
      _id: planId,
      status: Tier2PlanStatus.Avialable,
    }).session(session);

    if (!plan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Plan not found.' });
    }

    const startDate = new Date();

    let amount = plan.monthlyPrice;

    if (user.subscribeToTier2) {
      const checkSubscription =
        await Tier2SubscriptionModel.findOne({
          plan: plan._id,
          user: user._id,
        }).session(session);

      if (checkSubscription) {
        const checkOutstandingBill = await  Tier2BillingModel.findOne({
          user: user._id,
          sub: checkSubscription._id,
          status: Tier2BillingStatus.UNPAID
        }).session(session);

        if (checkOutstandingBill) {
          await session.abortTransaction();
          session.endSession();

          return res.status(401).json({
            message:
              'You already have outstanding bill for this subscription.',
          });
        }

        if (checkSubscription.status === Tier2SubcriptionStatus.Running) {
          await session.abortTransaction();
          session.endSession();

          return res.status(401).json({
            message:
              'You already subscribe to this plan and is currently active.',
          });
        } else {
          const paystackService = new PaystackService();
      
          const initPayment = await paystackService.initTransaction(user.userEmail, amount, user._id, callbackUrl)

          if (!initPayment.status) {
            await session.abortTransaction();
            session.endSession();

            return res
              .status(401)
              .json({ message: initPayment.message });
          }

          const billing =
            await Tier2BillingModel.create(
              [
                {
                  user: user._id,
                  sub: checkSubscription._id,
                  amount: amount,
                  dueDate: startDate,
                  reference: initPayment.data.reference,
                  status: Tier2BillingStatus.PARTIAL,
                },
              ],
              { session },
            );


          checkSubscription.status = Tier2SubcriptionStatus.Pending;
          await checkSubscription.save({ session });

          await session.commitTransaction();
          session.endSession();

          return res.status(200).json({
            data: initPayment,
            billing
          });
        }
      }
    }

     const paystackService = new PaystackService();
      
      const initPayment = await paystackService.initTransaction(user.userEmail, amount, user._id, callbackUrl)

      if (!initPayment.status) {
        await session.abortTransaction();
        session.endSession();

        return res
          .status(401)
          .json({ message: initPayment.message });
      }

    const subscription = await Tier2SubscriptionModel.create(
      [
        {
          user: userId,
          plan: plan._id,
          subStartDate: startDate,
          status: Tier2SubcriptionStatus.Pending,
          duration: Tier2SubcriptionDuration.MONTHLY
        },
      ],
      { session },
    );

    const billing = await Tier2BillingModel.create(
      [
        {
          user: user._id,
          sub: subscription[0]._id,
          amount: amount,
          dueDate: startDate,
          reference: initPayment.data.reference,
          status: Tier2BillingStatus.PARTIAL,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      data: initPayment,
      billing
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};


export const verifyTier2Subscription = async (
  req: Request,
  res: Response,
) => {
  const { billingId, reference } = req.body;

  const userId = req.user?._id;

  const paystackService = new PaystackService();

  const verifyPayment = await paystackService.verifyTransaction(reference)

  if (!verifyPayment.status) {
    return res
      .status(401)
      .json({ message: verifyPayment.message });
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await UserModel.findOne({
      _id: userId,
    }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    const billing = await Tier2BillingModel.findOneAndUpdate(
      {
          _id: billingId,
          reference: reference,
          user: user._id,
          status: Tier2BillingStatus.PARTIAL
      },
      {
          $set: { status: Tier2BillingStatus.PROCESSING },
      },
      {
          new: true,
          session,
      },
    );


    if (!billing) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(404).json({
        message: 'Bill not found',
      });
    }

    const subscription = await Tier2SubscriptionModel.findOne({
      _id: billing.sub,
      user: billing.user,
    }).session(session);

    if (!subscription) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(404).json({
        message: 'Subscription not found',
      });
    }

    const newStartDate = new Date();
    const newEndDate = new Date();
    
    newEndDate.setMinutes(newEndDate.getMinutes() + 3);

    // if (sub.duration === 'yearly') {
    //   newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    // } else {
    //   newEndDate.setDate(newEndDate.getDate() + 30);
    // }

    billing.status = Tier2BillingStatus.PAID;
    await billing.save({ session });

    subscription.status = Tier2SubcriptionStatus.Running;
    subscription.nextBillingDate = newEndDate
    await subscription.save({ session });

  
    user.subscribeToTier2 = true;
    user.tier2SubscriptionExpired = false;
    user.currentTier2Sub = subscription._id;
    await user.save({ session });

    await Tier2PaymentHistoryModel.create(
      [
        {
          user: billing.user,
          billing: billing._id,
          amountPaid: billing.amount,
          reference: billing.reference,
          paymentMethod: Tier2PaymentMethodEnum.CARD,
        },
      ],
      { session },
    );

    await Tier2BillingModel.updateMany(
      {
        user: user._id,
        status:  Tier2BillingStatus.UNPAID,
      },
      {
        $set: { status:  Tier2BillingStatus.IGNORE },
      },
      {
        session,
      }
    );

    await session.commitTransaction();
    await session.endSession();

    return res.status(200).json({
      message: 'payment Request completed successfully',
      data: billing,
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    console.error(error);

    return res.status(500).json({
      message: 'Failed to fetch payment request',
    });
  }
};


export const getOutstandingBillController = async (
  req: Request,
  res: Response,
) => {
  try {
    
    const userId = req.user?._id;

    const bills = await Tier2BillingModel.find({
      status: Tier2BillingStatus.UNPAID,
      user: userId
    })
    .populate({
      path: 'sub',
      populate: [
      {
        path: 'plan',
      },
      ],
    })

    return res.status(200).json({
      bills
    });
  } catch (error) {
  
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};


export const payTier2BillController = async (
  req: Request,
  res: Response,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { billId, callbackUrl } = req.body;
    const userId = req.user?._id;

    const user = await UserModel.findOne({
      _id: userId,
    }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    const bill = await Tier2BillingModel.findOne({
      _id: billId,
      status: Tier2BillingStatus.UNPAID,
      user: user._id
    }).session(session);

    if (!bill) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Bill not found.' });
    }

    let amount = bill.amount;

    const paystackService = new PaystackService();
    
    const initPayment = await paystackService.initTransaction(user.userEmail, amount, user._id, callbackUrl)

    if (!initPayment.status) {
      await session.abortTransaction();
      session.endSession();

      return res
        .status(401)
        .json({ message: initPayment.message });
    }

    bill.reference =  initPayment.data.reference,
    bill.status = Tier2BillingStatus.PARTIAL
    await bill.save({session})

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      data: initPayment,
      bill
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const tier2Plan = {
  fetchTier2PlansController,
  subcribeToTier2Controller,
  verifyTier2Subscription,
  getOutstandingBillController,
  payTier2Controller: payTier2BillController
}