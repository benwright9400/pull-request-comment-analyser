import { updateAgentStatus } from "@/lib/data/database/repositories/PRAnalysisSessionRepository";
import { getAnalysedPullRequestsByAnalysisId } from "@/lib/data/database/repositories/AnalysedPullRequestRepository";
import { getAnalysedCommentsByAnalysisId } from "@/lib/data/database/repositories/AnalysedCommentRepository";
import { getAnnotationsByAnalysisId } from "@/lib/data/database/repositories/AnnotationRepository";
import { savePRThematicAnalysis } from "@/lib/data/database/repositories/PRThematicAnalysisRepository";
import { invokeThematicAnalysisAgent } from "@/lib/data/services/AgentCoreService";

// Called fire-and-forget from the route that marks a session complete; the
// server stays alive to finish this after the response has already returned.
// Running this in-process accepts the risk that a failure here could affect
// the main application, which is acceptable for local/single-instance use.
// In real deployment this would likely be deployed separately, and isolated from the main application so failures here can't
// take it down.
export default async function runPRAgentAnalysis(sessionId: string, accountId: string, name: string) {
  try {
    await updateAgentStatus(sessionId, accountId, "running");

    const [pullRequests, comments, annotations] = await Promise.all([
      getAnalysedPullRequestsByAnalysisId(sessionId),
      getAnalysedCommentsByAnalysisId(sessionId),
      getAnnotationsByAnalysisId(sessionId),
    ]);

    const result = await invokeThematicAnalysisAgent({
      analysisId: sessionId,
      name,
      pullRequests: pullRequests.map((pullRequest) => ({
        repositoryId: pullRequest.repositoryId!,
        pullRequestId: pullRequest.pullRequestId!,
        number: pullRequest.number!,
        title: pullRequest.title!,
        body: pullRequest.body ?? null,
      })),
      comments: comments.map((comment) => ({
        repositoryId: comment.repositoryId!,
        pullRequestId: comment.pullRequestId!,
        commentId: comment.commentId!,
        body: comment.body!,
        authorLogin: comment.authorLogin,
        path: comment.path,
      })),
      annotations: annotations.map((annotation) => ({
        repositoryId: annotation.repositoryId!,
        commentId: annotation.commentId!,
        text: annotation.text!,
      })),
    });

    await savePRThematicAnalysis(sessionId, result.summary, result.codes, result.themes, accountId);
    await updateAgentStatus(sessionId, accountId, "complete");
  } catch (error) {
    console.error(`PR analysis agent run failed for session ${sessionId}:`, error);
    await updateAgentStatus(sessionId, accountId, "failed");
  }
}
