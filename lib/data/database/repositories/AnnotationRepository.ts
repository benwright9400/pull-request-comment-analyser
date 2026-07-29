import Annotation, { IAnnotation } from "../models/Annotation";
import { getMongoDB } from "../MongoDB";

export async function createAnnotation(
  text: string,
  commentId: number,
  repositoryId: number,
  analysisId: string,
  accountId: string
): Promise<IAnnotation> {
  await getMongoDB();
  return await Annotation.create({
    text,
    commentId,
    repositoryId,
    analysisId,
    accountId,
  });
}

export async function getAnnotationsByAnalysisId(analysisId: string): Promise<IAnnotation[]> {
  await getMongoDB();
  return await Annotation.find({ analysisId });
}
