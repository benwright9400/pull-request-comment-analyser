"use client";

import { useState } from "react";
import RepositoryColumn, { Repository } from "./components/RepositoryColumn";
import PullRequestColumn, { PullRequest } from "./components/PullRequestColumn";
import CommentsColumn from "./components/CommentsColumn";
import AnalysisToolbar from "./components/AnalysisToolbar";

export default function PullRequestsPage() {
    const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
    const [selectedPullRequest, setSelectedPullRequest] = useState<PullRequest | null>(null);

    return (
        <div className="px-4 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mt-4 mb-4 shrink-0">
                <h1 className="text-base font-semibold dark:text-white">Pull Requests</h1>
                <AnalysisToolbar />
            </div>
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
            </div>
        </div>
    );
}
