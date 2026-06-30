import { Document, Types, ObjectId } from "mongoose";

export enum FromWhoEnum {
  Admin = 'admin',
  ContetntCreator = 'contetntCreator',
  Organization = 'organization',
}

export interface ITier2Course extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  thumbnail: string;
  tutor: string;
  price: number;
  isPublished: boolean;
  subscribeCourse: boolean;
  totalLessons: number;
  totalDuration: number;
  fromWho: string;
  picture: string;
  createdAt: Date;
  updatedAt: Date;
}