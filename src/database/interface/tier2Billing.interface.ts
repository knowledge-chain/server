import mongoose, { Document } from 'mongoose';

export enum Tier2BillingStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PROCESSING = 'processing',
  IGNORE = 'ignore'
}

export interface ITier2Billing extends Document {
  user: mongoose.Types.ObjectId;
  sub: mongoose.Types.ObjectId;
  amount: number;
  dueDate:  Date;
  reference: string;
  status: string;
}