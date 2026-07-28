"use client";

import { useEffect, useState } from "react";
import Column from "./Column";
import CodeSnippet from "./CodeSnippet";
import { Repository } from "./RepositoryColumn";
import { PullRequest } from "./PullRequestColumn";
import { listComments, Comment } from "@/app/services/comments";

export default function CommentsColumn({
    repository,
    pullRequest,
}: {
    repository: Repository | null;
    pullRequest: PullRequest | null;
}) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!repository || !pullRequest) {
            setComments([]);
            return;
        }
        getComments(repository, pullRequest);
    }, [repository, pullRequest]);

    async function getComments(repository: Repository, pullRequest: PullRequest) {
        setIsLoading(true);
        setError(null);

        try {
            const { reviewComments, issueComments } = await listComments(
                repository.owner.login,
                repository.name,
                pullRequest.number
            );
            setComments([...reviewComments, ...issueComments]);
        } catch (err: any) {
            setError(err.message || "Failed to load comments");
            setComments([]);
        }

        setIsLoading(false);
    }

    return (
        <Column
            title="Comments"
            isLoading={isLoading}
            isEmpty={!error && comments.length === 0}
            emptyMessage={pullRequest ? "No comments found." : "Select a pull request."}
        >
            {error ? (
                <p className="px-4 py-3 text-sm text-red-500">{error}</p>
            ) : (
                <ul>
                    {comments.map((comment) => (
                        <li key={comment.id} className="px-4 py-3 border-b border-white/5">
                            <div className="text-xs font-medium dark:text-white text-black">
                                {comment.user?.login}
                                {comment.path ? <span className="text-gray-400"> · {comment.path}</span> : null}
                            </div>
                            {comment.diffHunk ? (
                                <div className="mt-2">
                                    <CodeSnippet diffHunk={comment.diffHunk} />
                                </div>
                            ) : null}
                            <p className="mt-2 text-sm dark:text-gray-300 text-gray-600 whitespace-pre-wrap">
                                {comment.body}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </Column>
    );
}
