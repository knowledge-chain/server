import { Document, Types, ObjectId } from "mongoose";
import { ITier2Course } from "./tier2Course.interface";

export interface ITier2Section extends Document {
  _id: ObjectId;
  course: ITier2Course['_id'];
  title: string,
  order: number;
  totalLessons: number;
  createdAt: Date;
  updatedAt: Date;
}