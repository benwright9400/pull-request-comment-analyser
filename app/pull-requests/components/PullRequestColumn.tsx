"use client";

import { useEffect, useState } from "react";
import Column from "./Column";
import { Repository } from "./RepositoryColumn";
import { listPullRequests, PullRequest } from "@/app/services/pullRequests";
import { usePRAnalysisSession } from "../providers/PRAnalysisSessionProvider";

export type { PullRequest };

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
}

export default function PullRequestColumn({
    repository,
    selectedPullRequest,
    onSelect,
}: {
    repository: Repository | null;
    selectedPullRequest: PullRequest | null;
    onSelect: (pullRequest: PullRequest) => void;
}) {
    const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { session, isPullRequestIncluded, togglePullRequestInclusion, registerPullRequests } = usePRAnalysisSession();
    const hasActiveSession = Boolean(session && !session.complete);

    useEffect(() => {
        if (!repository) {
            setPullRequests([]);
            return;
        }
        getPullRequests(repository);
    }, [repository]);

    async function getPullRequests(repository: Repository) {
        setIsLoading(true);
        setError(null);

        try {
            const fetchedPullRequests = await listPullRequests(repository.owner.login, repository.name);
            setPullRequests(fetchedPullRequests);
            registerPullRequests(fetchedPullRequests);
        } catch (err: any) {
            setError(err.message || "Failed to load pull requests");
            setPullRequests([]);
        }

        setIsLoading(false);
    }

    return (
        <Column
            title="Pull Requests"
            isLoading={isLoading}
            isEmpty={!error && pullRequests.length === 0}
            emptyMessage={repository ? "No pull requests found." : "Select a repository."}
        >
            {error ? (
                <p className="px-4 py-3 text-sm text-red-500">{error}</p>
            ) : (
                <ul>
                    {pullRequests.map((pullRequest) => (
                        <li
                            key={pullRequest.id}
                            className={`flex items-center gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/5 ${selectedPullRequest?.id === pullRequest.id ? "bg-white/10" : ""
                                }`}
                        >
                            {repository && hasActiveSession ? (
                                <input
                                    type="checkbox"
                                    title="Include"
                                    checked={isPullRequestIncluded(repository.id, pullRequest.id)}
                                    onChange={() => togglePullRequestInclusion(repository.id, pullRequest.id)}
                                    className="shrink-0"
                                />
                            ) : null}
                            <button
                                onClick={() => onSelect(pullRequest)}
                                className={`flex-1 min-w-0 text-left text-sm ${selectedPullRequest?.id === pullRequest.id
                                        ? "dark:text-white text-black font-medium"
                                        : "dark:text-gray-300 text-gray-600"
                                    }`}
                            >
                                <div>#{pullRequest.number} {pullRequest.title}</div>
                                <div className="text-xs text-gray-400">
                                    {pullRequest.state} · created {formatDate(pullRequest.createdAt)} · updated {formatDate(pullRequest.updatedAt)}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Column>
    );
}
