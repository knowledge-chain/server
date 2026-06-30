import { Document, Types, ObjectId } from "mongoose";

export enum TierTypeAmount{
  Tier1 = 'tier1',
  Tier2 = 'tier2',
  Tier3 = 'tier3',
  Tier4 = 'tier4'
}


export interface IAmount extends Document {
  _id: ObjectId;
  amount:  number;
  tier: string;
  createdAt: Date;
  updatedAt: Date;
}