import { Schema, model, Model } from "mongoose";
import { ITier2Certificate } from "../interface/tier2Certificate.interface";

const Tier2CertificateSchema = new Schema<ITier2Certificate>(
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

      tokenId: {
        type: Number,
      },

      txHash: {
        type: String,
      },

      metadataUrl: {
        type: String,
      },

      certificatePdfUrl: {
        type: String,
      },

      issuedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

//   Tier2CertificateSchema.index(
//     {
//         user: 1,
//         course: 1,
//     },
//     {
//         unique: true,
//     }
//  );

const TierCertificateModel: Model<ITier2Certificate> =  model<ITier2Certificate>("Tier2Certificate", Tier2CertificateSchema);
export default  TierCertificateModel