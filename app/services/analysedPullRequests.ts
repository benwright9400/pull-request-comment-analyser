import { apiPost } from "./apiClient";
import { PullRequest } from "./pullRequests";

export async function createAnalysedPullRequest(
    analysisId: string,
    repositoryId: number,
    pullRequest: PullRequest
) {
    return apiPost("/api/analysed-pull-requests", {
        analysisId,
        repositoryId,
        pullRequestId: pullRequest.id,
        number: pullRequest.number,
        title: pullRequest.title,
        state: pullRequest.state,
        body: pullRequest.body,
        githubCreatedAt: pullRequest.createdAt,
        githubUpdatedAt: pullRequest.updatedAt,
    });
}
