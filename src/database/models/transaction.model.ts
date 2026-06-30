import { Schema, model } from "mongoose";
import { ITransaction, TransactionStatus } from "../interface/transaction.interface";

const TransactionSchema: Schema<ITransaction> = new Schema(
    { 
      user: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      tier: {
        type: Number,
      },
      status: {
        type: String,  
        enum: Object.values(TransactionStatus),  
        required: true, 
      },
      reference: {
        type: String,  
        required: true, 
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
  
  const TransactionModel = model<ITransaction>("Transactions", TransactionSchema);
  
  export default TransactionModel;