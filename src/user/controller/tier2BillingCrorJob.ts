import cron from 'node-cron';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


import Tier2SubscriptionModel from "../../database/models/tier2Subscription.model";
import { Tier2SubcriptionStatus } from "../../database/interface/tier2Subscription.interface";
import UserModel from "../../database/models/user.model";
import Tier2BillingModel from "../../database/models/tier2Billing.model";
import { Tier2BillingStatus } from "../../database/interface/tier2Billing.interface";


export const Tier2SubscriptionBillingCron = () => {
  // runs every day at 12:00 AM
  cron.schedule('0 0 * * *', async () => {
    // cron.schedule('*/30 * * * * *', async () => {
    // cron.schedule('*/10 * * * *', async () => {
    console.log('Running subscription renewal cron...');

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const now = new Date();

      // 1. Find expired or due subscriptions
      const subscriptions = await Tier2SubscriptionModel.find({
        status: Tier2SubcriptionStatus.Running,
        nextBillingDate: { $lte: now },
      })
      .populate('plan')
      .session(session);

      for (const sub of subscriptions) {
         const user = await UserModel.findById(sub.user).session(session);

        if (!user) continue;

        const plan: any = sub.plan;

        // 2. Calculate amount again
        let amount = plan.monthlyPrice;

        // 4. Create invoice
        const invoice = await Tier2BillingModel.create(
          [
            {
              user: sub.user,
              sub: sub._id,
              amount,
              dueDate: sub.nextBillingDate,
              status: Tier2BillingStatus.UNPAID,
            },
          ],
          { session },
        );
        
        sub.status = Tier2SubcriptionStatus.Expired;
        await sub.save({ session });

        user.tier2SubscriptionExpired = true
        await user.save({ session });
      }

      await session.commitTransaction();
      console.log('Billing completed');
    } catch (error) {
      await session.abortTransaction();
      console.error('Cron error:', error);
    } finally {
      session.endSession();
    }
  });
};