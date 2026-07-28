import mongoose, { Document, Schema } from "mongoose";

export interface IAnnotation extends Document {
  text?: string;
  commentId?: number;
  repositoryId?: number;
  analysisId?: string;
  accountId?: string;
  createdAt?: Date;
}

const AnnotationSchema: Schema<IAnnotation> = new Schema<IAnnotation>(
  {
    text: { type: String, required: true },
    commentId: { type: Number, required: true },
    repositoryId: { type: Number, required: true },
    analysisId: { type: String, required: true },
    accountId: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Annotation ||
  mongoose.model<IAnnotation>("Annotation", AnnotationSchema);
