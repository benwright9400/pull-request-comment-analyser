import mongoose, { Document, Schema } from "mongoose";

export interface IThematicCode {
  localId: number;
  code: string;
  rationale?: string;
  repositoryId?: number;
  pullRequestId?: number;
  commentId?: number;
}

export interface IThematicTheme {
  theme: string;
  description?: string;
  codes: number[];
}

export interface IPRThematicAnalysis extends Document {
  analysisId: string;
  summary?: string;
  codes: IThematicCode[];
  themes: IThematicTheme[];
  accountId: string;
  createdAt?: Date;
}

const ThematicCodeSchema = new Schema<IThematicCode>(
  {
    localId: { type: Number, required: true },
    code: { type: String, required: true },
    rationale: { type: String, required: false },
    repositoryId: { type: Number, required: false },
    pullRequestId: { type: Number, required: false },
    commentId: { type: Number, required: false },
  },
  { _id: false }
);

const ThematicThemeSchema = new Schema<IThematicTheme>(
  {
    theme: { type: String, required: true },
    description: { type: String, required: false },
    codes: [{ type: Number }],
  },
  { _id: false }
);

const PRThematicAnalysisSchema: Schema<IPRThematicAnalysis> = new Schema<IPRThematicAnalysis>(
  {
    analysisId: { type: String, required: true, unique: true },
    summary: { type: String, required: false },
    codes: [ThematicCodeSchema],
    themes: [ThematicThemeSchema],
    accountId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.PRThematicAnalysis ||
  mongoose.model<IPRThematicAnalysis>("PRThematicAnalysis", PRThematicAnalysisSchema);
