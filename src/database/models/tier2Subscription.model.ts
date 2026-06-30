import { Schema, model, Model } from "mongoose";
import { ITier2Subscription, Tier2SubcriptionDuration, Tier2SubcriptionStatus } from "../interface/tier2Subscription.interface";

const Tier2SubcriptionSchema: Schema<ITier2Subscription> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId, ref: 'User',
      required: true,
    },
    plan: {
      type: Schema.Types.ObjectId, ref: 'Tier2Plan',
      required: true,
    },
    subStartDate: {
        type: Date,
    },
    nextBillingDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: Tier2SubcriptionStatus,
    },
    duration: {
        type: String,
        enum: Tier2SubcriptionDuration,
        default: Tier2SubcriptionDuration.MONTHLY
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Tier2Subcription: Model<ITier2Subscription> = model<ITier2Subscription>('Tier2Subcription', Tier2SubcriptionSchema);

export default Tier2Subcription;