import AnalysedPullRequest, { IAnalysedPullRequest } from "../models/AnalysedPullRequest";
import { getMongoDB } from "../MongoDB";

export async function createAnalysedPullRequest(
  analysisId: string,
  repositoryId: number,
  pullRequestId: number,
  number: number,
  title: string,
  state: string,
  body: string | null,
  githubCreatedAt: string,
  githubUpdatedAt: string,
  accountId: string
): Promise<IAnalysedPullRequest> {
  await getMongoDB();
  return await AnalysedPullRequest.create({
    analysisId,
    repositoryId,
    pullRequestId,
    number,
    title,
    state,
    body,
    githubCreatedAt: new Date(githubCreatedAt),
    githubUpdatedAt: new Date(githubUpdatedAt),
    accountId,
  });
}

export async function getAnalysedPullRequestsByAnalysisId(
  analysisId: string
): Promise<IAnalysedPullRequest[]> {
  await getMongoDB();
  return await AnalysedPullRequest.find({ analysisId });
}
