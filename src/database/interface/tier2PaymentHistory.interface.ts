import mongoose, { Document } from 'mongoose';

export enum Tier2PaymentMethodEnum {
  CARD = 'card',
  TRANSFER = 'transfer',
}

export interface ITier2PaymentHistory extends Document {
  user: mongoose.Types.ObjectId;
  billing: mongoose.Types.ObjectId;
  amountPaid: number;
  reference: string;
  paymentMethod: string;
}