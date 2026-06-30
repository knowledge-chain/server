import { Schema, model } from "mongoose";
import { ITier2UserCourseProgress } from "../interface/tier2CourseProgress.interface";

const Tier2UserCourseProgressSchema: Schema<ITier2UserCourseProgress> =
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      course: {
        type: Schema.Types.ObjectId,
        ref: "tier2Course",
        required: true,
      },

      completedLessons: [
        {
          type: Schema.Types.ObjectId,
          ref: "tier2Lesson",
        },
      ],

      completedSections: [
        {
          type: Schema.Types.ObjectId,
          ref: "tier2Section",
        },
      ],

      currentLesson: {
        type: Schema.Types.ObjectId,
        ref: "tier2Lesson",
      },

      lastWatchedLesson: {
        type: Schema.Types.ObjectId,
        ref: "tier2Lesson",
      },

      progressPercentage: {
        type: Number,
        default: 0,
      },

      completedCourse: {
        type: Boolean,
        default: false,
      },

      blockchainCompletions: [
        {
          lesson: {
            type: Schema.Types.ObjectId,
            ref: "tier2Lesson",
          },

          txHash: {
            type: String,
          },

          completedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  );

const Tier2UserCourseProgressModel = model<ITier2UserCourseProgress>(
  "tier2UserCourseProgress",
  Tier2UserCourseProgressSchema
);

export default Tier2UserCourseProgressModel;