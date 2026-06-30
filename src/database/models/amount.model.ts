import { Schema, model } from "mongoose";
import { IAmount, TierTypeAmount } from "../interface/amount.interface"

const AmountSchema: Schema<IAmount> = new Schema(
    { 
      amount: {
        type: Number,
      },
      tier: {
        type: String,
        default: TierTypeAmount.Tier1
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      }, 
    },
    {
      timestamps: true,
    }
  );
  
  const AmountModel = model<IAmount>("Amounts", AmountSchema);
  
  export default AmountModel;