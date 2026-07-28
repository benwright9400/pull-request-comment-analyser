import mongoose, { Document, Schema } from "mongoose";

export interface IAnalysedComment extends Document {
  analysisId?: string;
  repositoryId?: number;
  pullRequestId?: number;
  commentId?: number;
  body?: string;
  authorLogin?: string;
  diffHunk?: string;
  path?: string;
  inReplyToId?: number;
  githubCreatedAt?: Date;
  accountId?: string;
  createdAt?: Date;
}

const AnalysedCommentSchema: Schema<IAnalysedComment> = new Schema<IAnalysedComment>(
  {
    analysisId: { type: String, required: true },
    repositoryId: { type: Number, required: true },
    pullRequestId: { type: Number, required: true },
    commentId: { type: Number, required: true },
    body: { type: String, required: false },
    authorLogin: { type: String, required: false },
    diffHunk: { type: String, required: false },
    path: { type: String, required: false },
    inReplyToId: { type: Number, required: false },
    githubCreatedAt: { type: Date, required: false },
    accountId: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.AnalysedComment ||
  mongoose.model<IAnalysedComment>("AnalysedComment", AnalysedCommentSchema);
