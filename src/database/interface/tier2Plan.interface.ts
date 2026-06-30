import mongoose, { Document } from 'mongoose';

export enum Tier2PlanStatus {
  Avialable = 'Avialable',
  Remove = 'Remove',
  Pending = 'Pending',
}

export interface ITier2Plan extends Document {
  name: string;
  monthlyPrice: number;
  discription: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
