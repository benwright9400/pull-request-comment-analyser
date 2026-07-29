import mongoose, { Document, Schema } from "mongoose";

export type AgentRunStatus = "pending" | "running" | "complete" | "failed";

export interface IPRAnalysisSession extends Document {
  sessionId: string;
  name: string;
  date: Date;
  complete: boolean;
  agentStatus: AgentRunStatus;
  accountId: string;
}

const PRAnalysisSessionSchema: Schema<IPRAnalysisSession> = new Schema<IPRAnalysisSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    complete: { type: Boolean, required: true, default: false },
    agentStatus: {
      type: String,
      enum: ["pending", "running", "complete", "failed"],
      required: true,
      default: "pending",
    },
    accountId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.PRAnalysisSession ||
  mongoose.model<IPRAnalysisSession>("PRAnalysisSession", PRAnalysisSessionSchema);
