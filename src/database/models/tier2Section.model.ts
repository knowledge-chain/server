import { Schema, model } from "mongoose";
import { ITier2Section } from "../interface/tier2Section.interface"

const Tier2SectionSchema: Schema<ITier2Section> = new Schema(
    { 
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
      totalLessons: {
        type: Number,
        default: 0,
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
  
  const Tier2SectionModel = model<ITier2Section>("tier2Section", Tier2SectionSchema);
  
  export default Tier2SectionModel;