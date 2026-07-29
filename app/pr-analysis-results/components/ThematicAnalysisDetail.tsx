"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";
import { getPRThematicAnalysis, PRThematicAnalysis } from "@/app/services/prThematicAnalysis";
import { PRAnalysisSession } from "@/types/PRAnalysisSession";

export default function ThematicAnalysisDetail({ session }: { session: PRAnalysisSession | null }) {
    const [result, setResult] = useState<PRThematicAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setResult(null);
        setError(null);

        if (!session || session.agentStatus !== "complete") {
            return;
        }

        getResult(session.sessionId);
    }, [session?.sessionId, session?.agentStatus]);

    async function getResult(sessionId: string) {
        setIsLoading(true);
        setError(null);

        try {
            setResult(await getPRThematicAnalysis(sessionId));
        } catch (err: any) {
            setError(err.message || "Failed to load thematic analysis");
        }

        setIsLoading(false);
    }

    if (!session) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm dark:text-gray-300 text-gray-600">Select an analysis to view its results.</p>
            </div>
        );
    }

    if (session.agentStatus === "pending" || session.agentStatus === "running") {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm dark:text-gray-300 text-gray-600">
                    Agent analysis is {session.agentStatus}. Check back shortly.
                </p>
            </div>
        );
    }

    if (session.agentStatus === "failed") {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-red-500">The agent analysis for this session failed.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-red-500">{error}</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm dark:text-gray-300 text-gray-600">No results found for this analysis.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
                <h2 className="text-base font-semibold dark:text-white text-black">{session.name}</h2>
                {result.summary ? (
                    <p className="mt-2 text-sm dark:text-gray-300 text-gray-600">{result.summary}</p>
                ) : null}
            </div>

            <div>
                <h3 className="text-sm font-semibold dark:text-white text-black mb-2">
                    Themes ({result.themes.length})
                </h3>
                <div className="space-y-3">
                    {result.themes.map((theme, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <div className="text-sm font-medium text-black">{theme.theme}</div>
                            {theme.description ? (
                                <p className="mt-1 text-sm text-gray-600">{theme.description}</p>
                            ) : null}
                            <div className="mt-2 flex flex-wrap gap-1">
                                {theme.codes.map((codeId) => {
                                    const code = result.codes.find((c) => c.localId === codeId);
                                    return (
                                        <span
                                            key={codeId}
                                            className="text-xs rounded-full bg-gray-100 text-gray-700 px-2 py-0.5"
                                        >
                                            {code ? code.code : `#${codeId}`}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold dark:text-white text-black mb-2">
                    Codes ({result.codes.length})
                </h3>
                <div className="space-y-2">
                    {result.codes.map((code) => (
                        <div key={code.localId} className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-black">{code.code}</div>
                                {code.category ? (
                                    <span className="text-xs rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5">
                                        {code.category}
                                    </span>
                                ) : null}
                            </div>
                            {code.rationale ? <p className="mt-1 text-xs text-gray-600">{code.rationale}</p> : null}
                            {code.repositoryId || code.pullRequestId || code.commentId ? (
                                <div className="mt-1 text-xs text-gray-400">
                                    {code.repositoryId ? `repo ${code.repositoryId}` : null}
                                    {code.pullRequestId ? ` · PR ${code.pullRequestId}` : null}
                                    {code.commentId ? ` · comment ${code.commentId}` : null}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
