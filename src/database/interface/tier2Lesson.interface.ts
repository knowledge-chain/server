import { Document, Types, ObjectId } from "mongoose";
import { ITier2Section } from "./tier2Section.interface";
import { ITier2Course } from "./tier2Course.interface";

export interface ITier2Lesson extends Document {
  _id: ObjectId;
  section: ITier2Section['_id'];
  course: ITier2Course['_id'];
  title: string;
  order: number;
  wordContent: string;
  videoUrl: string;
  muxAssetId: string;
  muxPlaybackId: string;
  duration: number;
  isPreview: boolean;
  blockchainLessonId: string;
  createdAt: Date;
  updatedAt: Date;
}