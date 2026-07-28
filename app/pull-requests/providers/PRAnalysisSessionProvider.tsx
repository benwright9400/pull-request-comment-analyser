"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { createPRAnalysisSession, completePRAnalysisSession } from "@/app/services/PRAnalysisSession";
import { createAnalysedRepository } from "@/app/services/analysedRepositories";
import { createAnalysedPullRequest } from "@/app/services/analysedPullRequests";
import { createAnalysedComment } from "@/app/services/analysedComments";
import { listComments } from "@/app/services/comments";
import { PRAnalysisSession } from "@/types/PRAnalysisSession";
import { Repository } from "@/app/services/repositories";
import { PullRequest } from "@/app/services/pullRequests";

export type RepoSelection = {
    pullRequestIds: number[];
    annotationIds: string[];
};

export type PRAnalysisSessionContextType = {
    session: PRAnalysisSession | null;
    isStarting: boolean;
    isEnding: boolean;
    error: string | null;
    startAnalysis: (name: string) => Promise<void>;
    endAnalysis: () => Promise<void>;
    selectionsByRepoId: Record<number, RepoSelection>;
    isPullRequestIncluded: (repoId: number, pullRequestId: number) => boolean;
    togglePullRequestInclusion: (repoId: number, pullRequestId: number) => void;
    registerRepositories: (repositories: Repository[]) => void;
    registerPullRequests: (pullRequests: PullRequest[]) => void;
};

const PRAnalysisSessionContext = createContext<PRAnalysisSessionContextType | undefined>(undefined);

export function PRAnalysisSessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<PRAnalysisSession | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectionsByRepoId, setSelectionsByRepoId] = useState<Record<number, RepoSelection>>({});
    const [repositoriesById, setRepositoriesById] = useState<Record<number, Repository>>({});
    const [pullRequestsById, setPullRequestsById] = useState<Record<number, PullRequest>>({});

    async function startAnalysis(name: string) {
        setIsStarting(true);
        setError(null);

        try {
            setSession(await createPRAnalysisSession(name));
        } catch (err: any) {
            setError(err.message || "Failed to start analysis");
        }

        setIsStarting(false);
    }

    async function persistSelections(analysisId: string) {
        for (const [repoIdKey, selection] of Object.entries(selectionsByRepoId)) {
            const repositoryId = Number(repoIdKey);
            const repository = repositoriesById[repositoryId];

            if (!repository || selection.pullRequestIds.length === 0) {
                continue;
            }

            await createAnalysedRepository(analysisId, repository);

            for (const pullRequestId of selection.pullRequestIds) {
                const pullRequest = pullRequestsById[pullRequestId];

                if (!pullRequest) {
                    continue;
                }

                await createAnalysedPullRequest(analysisId, repository.id, pullRequest);

                const { reviewComments, issueComments } = await listComments(
                    repository.owner.login,
                    repository.name,
                    pullRequest.number
                );

                for (const comment of [...reviewComments, ...issueComments]) {
                    await createAnalysedComment(analysisId, repository.id, pullRequest.id, comment);
                }
            }
        }
    }

    async function endAnalysis() {
        if (!session) {
            return;
        }

        setIsEnding(true);
        setError(null);

        try {
            await persistSelections(session.sessionId);
            setSession(await completePRAnalysisSession(session));
        } catch (err: any) {
            setError(err.message || "Failed to end analysis");
        }

        setIsEnding(false);
    }

    function isPullRequestIncluded(repoId: number, pullRequestId: number) {
        return Boolean(selectionsByRepoId[repoId]?.pullRequestIds.includes(pullRequestId));
    }

    function togglePullRequestInclusion(repoId: number, pullRequestId: number) {
        setSelectionsByRepoId((previous) => {
            const existing = previous[repoId] || { pullRequestIds: [], annotationIds: [] };
            const pullRequestIds = existing.pullRequestIds.includes(pullRequestId)
                ? existing.pullRequestIds.filter((id) => id !== pullRequestId)
                : [...existing.pullRequestIds, pullRequestId];

            return {
                ...previous,
                [repoId]: { ...existing, pullRequestIds },
            };
        });
    }

    function registerRepositories(repositories: Repository[]) {
        setRepositoriesById((previous) => {
            const next = { ...previous };
            for (const repository of repositories) {
                next[repository.id] = repository;
            }
            return next;
        });
    }

    function registerPullRequests(pullRequests: PullRequest[]) {
        setPullRequestsById((previous) => {
            const next = { ...previous };
            for (const pullRequest of pullRequests) {
                next[pullRequest.id] = pullRequest;
            }
            return next;
        });
    }

    return (
        <PRAnalysisSessionContext.Provider
            value={{
                session,
                isStarting,
                isEnding,
                error,
                startAnalysis,
                endAnalysis,
                selectionsByRepoId,
                isPullRequestIncluded,
                togglePullRequestInclusion,
                registerRepositories,
                registerPullRequests,
            }}
        >
            {children}
        </PRAnalysisSessionContext.Provider>
    );
}

export function usePRAnalysisSession() {
    const context = useContext(PRAnalysisSessionContext);

    if (!context) {
        throw new Error("PRAnalysisSessionProvider not detected; please check it is in a parent component");
    }

    return context;
}
