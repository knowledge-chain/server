import mongoose, { Document } from 'mongoose';

export enum Tier2SubcriptionStatus {
  Pending = 'Pending',
  Running = 'Running',
  Suspended = 'Suspended',
  Expired = 'Expired',
}

export enum Tier2SubcriptionDuration {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface ITier2Subscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  subStartDate: Date;
  nextBillingDate: Date;
  status: string;
  duration: string;
  createdAt: Date;
}