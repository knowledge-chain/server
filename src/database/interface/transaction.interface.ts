import { Document, Types, ObjectId } from "mongoose";
import { IUser } from "./user.interface";

export enum TransactionStatus {
    Pending = 'Pending',
    Completed = 'Completed',
    Failed = 'Failed'
}


export interface ITransaction extends Document {
  _id: ObjectId;
  user:  IUser['_id'];
  amount:  number;
  tier:  number;
  status: TransactionStatus;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
}