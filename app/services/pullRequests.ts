import { apiGet } from "./apiClient";

export type PullRequest = {
    id: number;
    number: number;
    title: string;
    state: string;
    body: string | null;
    createdAt: string;
    updatedAt: string;
};

export async function listPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
    const { pullRequests } = await apiGet<{ pullRequests: PullRequest[] }>(
        `/api/pull-requests?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
    );
    return pullRequests;
}
