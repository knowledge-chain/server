import { Schema, model, Model } from "mongoose";
import { ITier2Plan, Tier2PlanStatus } from "../interface/tier2Plan.interface";

const Tier2PlanSchema: Schema<ITier2Plan> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    monthlyPrice: {
      type: Number,
      required: false,
    },
    discription: {
      type: String,
      required: true,
    },
    status: {
        type: String,
        enum: Tier2PlanStatus,
        default: Tier2PlanStatus.Pending
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
  },
);

const Tier2Plan: Model<ITier2Plan> = model<ITier2Plan>('Tier2Plan', Tier2PlanSchema);
export default Tier2Plan;