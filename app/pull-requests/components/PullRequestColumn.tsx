"use client";

import { useEffect, useState } from "react";
import Column from "./Column";
import { Repository } from "./RepositoryColumn";

export type PullRequest = {
    id: number;
    number: number;
    title: string;
    state: string;
};

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

        const res = await fetch(
            `/api/pull-requests?owner=${repository.owner.login}&repo=${repository.name}`
        );
        const body = await res.json();

        if (!res.ok) {
            setError(body.error || "Failed to load pull requests");
            setPullRequests([]);
        } else {
            setPullRequests(body.pullRequests);
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
                        <li key={pullRequest.id}>
                            <button
                                onClick={() => onSelect(pullRequest)}
                                className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 hover:bg-white/5 ${selectedPullRequest?.id === pullRequest.id
                                        ? "bg-white/10 dark:text-white text-black font-medium"
                                        : "dark:text-gray-300 text-gray-600"
                                    }`}
                            >
                                <div>#{pullRequest.number} {pullRequest.title}</div>
                                <div className="text-xs text-gray-400">{pullRequest.state}</div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Column>
    );
}
