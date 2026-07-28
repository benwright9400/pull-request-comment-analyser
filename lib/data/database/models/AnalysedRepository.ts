import mongoose, { Document, Schema } from "mongoose";

export interface IAnalysedRepository extends Document {
  analysisId?: string;
  repositoryId?: number;
  name?: string;
  fullName?: string;
  ownerLogin?: string;
  accountId?: string;
  createdAt?: Date;
}

const AnalysedRepositorySchema: Schema<IAnalysedRepository> = new Schema<IAnalysedRepository>(
  {
    analysisId: { type: String, required: true },
    repositoryId: { type: Number, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    ownerLogin: { type: String, required: true },
    accountId: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.AnalysedRepository ||
  mongoose.model<IAnalysedRepository>("AnalysedRepository", AnalysedRepositorySchema);
