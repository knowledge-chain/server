import mongoose, { Document } from 'mongoose';

export interface ITier2Certificate
  extends Document {

  user: mongoose.Types.ObjectId;

  course: mongoose.Types.ObjectId;

  tokenId: number;

  txHash: string;

  metadataUrl: string;

  certificatePdfUrl: string;


  issuedAt: Date;
}