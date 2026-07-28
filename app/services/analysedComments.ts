import { apiPost } from "./apiClient";
import { Comment } from "./comments";

export async function createAnalysedComment(
    analysisId: string,
    repositoryId: number,
    pullRequestId: number,
    comment: Comment
) {
    return apiPost("/api/analysed-comments", {
        analysisId,
        repositoryId,
        pullRequestId,
        commentId: comment.id,
        body: comment.body,
        authorLogin: comment.user?.login,
        diffHunk: comment.diffHunk,
        path: comment.path,
        inReplyToId: comment.inReplyToId,
        githubCreatedAt: comment.createdAt,
    });
}
