"use client";

import { useEffect, useState } from "react";
import Column from "./Column";
import CodeSnippet from "./CodeSnippet";
import CommentBody from "./CommentBody";
import AnnotationPanel from "./AnnotationPanel";
import { Repository } from "./RepositoryColumn";
import { PullRequest } from "./PullRequestColumn";
import { listComments, Comment } from "@/app/services/comments";

function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString();
}

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

    const topLevelComments = comments.filter((comment) => !comment.inReplyToId);
    const repliesByParentId = comments.reduce<Record<number, Comment[]>>((acc, comment) => {
        if (comment.inReplyToId) {
            (acc[comment.inReplyToId] ??= []).push(comment);
        }
        return acc;
    }, {});

    return (
        <Column
            title="Comments"
            isLoading={isLoading}
            isEmpty={!error && comments.length === 0}
            emptyMessage={pullRequest ? "No comments found." : "Select a pull request."}
            widthClassName="flex-[2]"
        >
            {error ? (
                <p className="px-4 py-3 text-sm text-red-500">{error}</p>
            ) : (
                <ul className="p-4 space-y-4">
                    {topLevelComments.map((comment) => {
                        const replies = repliesByParentId[comment.id] || [];
                        return (
                            <li key={comment.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-black">
                                        {comment.user?.login}
                                        {comment.path ? <span className="text-gray-400"> · {comment.path}</span> : null}
                                    </div>
                                    {comment.diffHunk ? (
                                        <div className="mt-2">
                                            <CodeSnippet diffHunk={comment.diffHunk} />
                                        </div>
                                    ) : null}
                                    <CommentBody body={comment.body} />
                                    {replies.length > 0 ? (
                                        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                                            {replies.map((reply) => (
                                                <div key={reply.id} className="pl-3 border-l-2 border-gray-200">
                                                    <div className="text-xs font-medium text-black">
                                                        {reply.user?.login}
                                                        <span className="text-gray-400 font-normal"> · {formatDateTime(reply.createdAt)}</span>
                                                    </div>
                                                    <CommentBody body={reply.body} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex-1 min-w-0 border-l border-gray-200 pl-4">
                                    <AnnotationPanel />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Column>
    );
}
