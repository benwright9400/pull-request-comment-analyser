"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";
import { listPRAnalysisSessions } from "@/app/services/PRAnalysisSession";
import { PRAnalysisSession } from "@/types/PRAnalysisSession";

function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString();
}

export default function SessionListColumn({
    selectedSessionId,
    onSelect,
}: {
    selectedSessionId: string | null;
    onSelect: (session: PRAnalysisSession) => void;
}) {
    const [sessions, setSessions] = useState<PRAnalysisSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getSessions();
    }, []);

    async function getSessions() {
        setIsLoading(true);
        setError(null);

        try {
            setSessions(await listPRAnalysisSessions());
        } catch (err: any) {
            setError(err.message || "Failed to load analyses");
        }

        setIsLoading(false);
    }

    return (
        <div className="w-80 shrink-0 border-r border-white/10 flex flex-col">
            <h2 className="px-4 py-3 text-sm font-semibold dark:text-white text-black border-b border-white/10 shrink-0">
                Analyses
            </h2>
            <div className="overflow-y-auto flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader />
                    </div>
                ) : error ? (
                    <p className="px-4 py-3 text-sm text-red-500">{error}</p>
                ) : sessions.length === 0 ? (
                    <p className="px-4 py-3 text-sm dark:text-gray-300 text-gray-600">No analyses yet.</p>
                ) : (
                    <ul>
                        {sessions.map((session) => (
                            <li key={session.sessionId}>
                                <button
                                    onClick={() => onSelect(session)}
                                    className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 ${selectedSessionId === session.sessionId
                                            ? "bg-white/10 dark:text-white text-black"
                                            : "dark:text-gray-300 text-gray-600"
                                        }`}
                                >
                                    <div className="text-sm font-medium">{session.name}</div>
                                    <div className="text-xs text-gray-400">
                                        {formatDateTime(session.date)} · {session.agentStatus}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
