"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import RepositoryColumn, { Repository } from "./components/RepositoryColumn";
import PullRequestColumn, { PullRequest } from "./components/PullRequestColumn";
import CommentsColumn from "./components/CommentsColumn";
import AnnotationColumn from "./components/AnnotationColumn";

export default function PullRequestsPage() {
    const session = useSession();
    const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
    const [selectedPullRequest, setSelectedPullRequest] = useState<PullRequest | null>(null);

    const githubConnected = Boolean(session.data?.user?.githubAccessToken);

    if (session.status !== "loading" && !githubConnected) {
        return (
            <div className="px-4">
                <h1 className="text-base font-semibold dark:text-white mt-4">Pull Requests</h1>
                <p className="mt-2 text-sm dark:text-gray-300 text-gray-600">
                    Connect your GitHub account to see your pull requests.
                </p>
                <button
                    className="shadow-md p-2 rounded-lg mt-4 cursor-pointer"
                    onClick={() => signIn("github")}
                >
                    Connect GitHub
                </button>
            </div>
        );
    }

    return (
        <div className="px-4 flex flex-col h-[calc(100vh-8rem)]">
            <h1 className="text-base font-semibold dark:text-white mt-4 mb-4 shrink-0">Pull Requests</h1>
            <div className="flex flex-1 min-h-0 border border-white/10 rounded-lg overflow-hidden">
                <RepositoryColumn
                    selectedRepository={selectedRepository}
                    onSelect={(repository) => {
                        setSelectedRepository(repository);
                        setSelectedPullRequest(null);
                    }}
                />
                <PullRequestColumn
                    repository={selectedRepository}
                    selectedPullRequest={selectedPullRequest}
                    onSelect={setSelectedPullRequest}
                />
                <CommentsColumn repository={selectedRepository} pullRequest={selectedPullRequest} />
                <AnnotationColumn />
            </div>
        </div>
    );
}
