import AnalysedComment, { IAnalysedComment } from "../models/AnalysedComment";
import { getMongoDB } from "../MongoDB";

export async function createAnalysedComment(
  analysisId: string,
  repositoryId: number,
  pullRequestId: number,
  commentId: number,
  body: string,
  authorLogin: string | undefined,
  diffHunk: string | undefined,
  path: string | undefined,
  inReplyToId: number | undefined,
  githubCreatedAt: string,
  accountId: string
): Promise<IAnalysedComment> {
  await getMongoDB();
  return await AnalysedComment.create({
    analysisId,
    repositoryId,
    pullRequestId,
    commentId,
    body,
    authorLogin,
    diffHunk,
    path,
    inReplyToId,
    githubCreatedAt: new Date(githubCreatedAt),
    accountId,
  });
}

export async function getAnalysedCommentsByAnalysisId(analysisId: string): Promise<IAnalysedComment[]> {
  await getMongoDB();
  return await AnalysedComment.find({ analysisId });
}
