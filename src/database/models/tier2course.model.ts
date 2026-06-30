import { Schema, model } from "mongoose";
import { FromWhoEnum, ITier2Course } from "../interface/tier2Course.interface"

const Tier2CourseSchema: Schema<ITier2Course> = new Schema(
    { 
      title: {
        type: String,
        require: true,
      },
      description: {
        type: String,
        require: true
      },
      thumbnail: {
        type: String,
      },
      tutor: {
        type: String,
      },
      price: {
        type: Number,
      },
      isPublished: {
        type: Boolean,
      },
      subscribeCourse: {
        type: Boolean,
        default: false
      },
      totalLessons: {
        type: Number,
        default: 0,
      },
      totalDuration: {
        type: Number,
        default: 0,
      },
      fromWho: {
        type: String,
        enum: FromWhoEnum
      },
      picture: {
        type: String,
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
  
  const Tier2CourseModel = model<ITier2Course>("tier2Course", Tier2CourseSchema);
  
  export default Tier2CourseModel;