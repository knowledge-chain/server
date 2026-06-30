import { Schema, model } from "mongoose";
import { ITier2Lesson } from "../interface/tier2Lesson.interface"

const Tier2LessonSchema: Schema<ITier2Lesson> = new Schema(
    { 
      section: {
        type: Schema.Types.ObjectId, ref: 'tier2Section',
        required: true,
      },
      course: {
        type: Schema.Types.ObjectId, ref: 'tier2Course',
        required: true,
      },
      title: {
        type: String,
        require: true,
      },
      order: {
        type: Number,
       
      },
      wordContent: {
        type: String,
      },
      videoUrl: {
        type: String,
      },
      muxPlaybackId: {
        type: String,
      },
      muxAssetId: {
        type: String
      },
      duration: {
        type: Number,
      },
      isPreview: {
        type: Boolean,
      },
      blockchainLessonId: {
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
  
  const Tier2LessonModel = model<ITier2Lesson>("tier2Lesson", Tier2LessonSchema);
  
  export default Tier2LessonModel;