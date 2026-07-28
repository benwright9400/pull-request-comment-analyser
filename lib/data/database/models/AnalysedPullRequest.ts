import mongoose, { Document, Schema } from "mongoose";

export interface IAnalysedPullRequest extends Document {
  analysisId?: string;
  repositoryId?: number;
  pullRequestId?: number;
  number?: number;
  title?: string;
  state?: string;
  body?: string | null;
  githubCreatedAt?: Date;
  githubUpdatedAt?: Date;
  accountId?: string;
  createdAt?: Date;
}

const AnalysedPullRequestSchema: Schema<IAnalysedPullRequest> = new Schema<IAnalysedPullRequest>(
  {
    analysisId: { type: String, required: true },
    repositoryId: { type: Number, required: true },
    pullRequestId: { type: Number, required: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    state: { type: String, required: true },
    body: { type: String, required: false },
    githubCreatedAt: { type: Date, required: false },
    githubUpdatedAt: { type: Date, required: false },
    accountId: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.AnalysedPullRequest ||
  mongoose.model<IAnalysedPullRequest>("AnalysedPullRequest", AnalysedPullRequestSchema);
