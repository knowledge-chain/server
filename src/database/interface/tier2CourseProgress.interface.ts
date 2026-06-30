import mongoose, { Document, Schema, model } from "mongoose";

export interface IBlockchainCompletion {
  lesson: mongoose.Types.ObjectId;
  txHash: string;
  completedAt: Date;
}

export interface ITier2UserCourseProgress extends Document {
  user: mongoose.Types.ObjectId;

  course: mongoose.Types.ObjectId;

  completedLessons: mongoose.Types.ObjectId[];

  completedSections: mongoose.Types.ObjectId[];

  currentLesson?: mongoose.Types.ObjectId;

  lastWatchedLesson?: mongoose.Types.ObjectId;

  progressPercentage: number;

  completedCourse: boolean;

  blockchainCompletions: IBlockchainCompletion[];

  createdAt: Date;

  updatedAt: Date;
}