import { Schema, model, Model } from "mongoose";
import { ITier2PaymentHistory, Tier2PaymentMethodEnum } from "../interface/tier2PaymentHistory.interface";

const Tier2PaymentHistorySchema: Schema<ITier2PaymentHistory> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId, ref: 'Privates',
      required: true,
    },
    billing: {
      type: Schema.Types.ObjectId, ref: 'PrivateCompanyPlan',
      required: true,
    },
    amountPaid: {
        type: Number,
        required: true,
    },
    reference: {
        type: String,
        required: true
    },
     paymentMethod: {
        type: String,
        enum: Tier2PaymentMethodEnum,
       required: true
    }
  },
  {
    timestamps: true,
  },
);

const Tier2PaymentHistory: Model<ITier2PaymentHistory> = model<ITier2PaymentHistory>('TierPaymentHistory', Tier2PaymentHistorySchema);
export default Tier2PaymentHistory;