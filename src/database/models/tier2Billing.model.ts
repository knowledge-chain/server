import { Schema, model, Model } from "mongoose";
import { ITier2Billing, Tier2BillingStatus } from "../interface/tier2Billing.interface";

const Tier2BillingSchema: Schema<ITier2Billing> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId, ref: 'User',
      required: true,
    },
    sub: {
      type: Schema.Types.ObjectId, ref: 'Tier2Subcription',
      required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    reference: {
        type: String,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: Tier2BillingStatus,
        default: Tier2BillingStatus.UNPAID
    }
  },
  {
    timestamps: true,
  },
);

const Tier2Billing: Model<ITier2Billing> = model<ITier2Billing>('Tier2Billing', Tier2BillingSchema);
export default Tier2Billing;