import { apiGet } from "./apiClient";

export type Comment = {
    id: number;
    body: string;
    user: { login: string } | null;
    diffHunk?: string;
    path?: string;
};

type CommentsResponse = {
    reviewComments: Comment[];
    issueComments: Comment[];
};

export async function listComments(
    owner: string,
    repo: string,
    pullNumber: number
): Promise<CommentsResponse> {
    return apiGet<CommentsResponse>(
        `/api/pull-requests/${pullNumber}/comments?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
    );
}
