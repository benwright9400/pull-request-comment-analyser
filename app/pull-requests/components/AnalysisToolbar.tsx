"use client";

import { useState } from "react";
import { usePRAnalysisSession } from "../providers/PRAnalysisSessionProvider";

export default function AnalysisToolbar() {
    const { session, isStarting, isEnding, error, startAnalysis, endAnalysis } = usePRAnalysisSession();
    const [name, setName] = useState("");

    const inProgress = Boolean(session && !session.complete);

    async function handleStart() {
        const trimmed = name.trim();
        if (!trimmed) {
            return;
        }
        await startAnalysis(trimmed);
        setName("");
    }

    function handleClick() {
        if (inProgress) {
            endAnalysis();
        } else {
            handleStart();
        }
    }

    return (
        <div className="flex items-center gap-2">
            {error ? <span className="text-xs text-red-500">{error}</span> : null}
            {session ? (
                <span className="text-xs dark:text-gray-300 text-gray-500">
                    {inProgress ? "Running: " : "Completed: "}
                    {session.name}
                    {session.complete ? ` (agent: ${session.agentStatus})` : null}
                </span>
            ) : null}
            {!inProgress ? (
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Analysis name"
                    className="text-sm rounded border border-gray-300 px-2 py-1.5 text-black"
                />
            ) : null}
            <button
                onClick={handleClick}
                disabled={isStarting || isEnding}
                className="text-sm rounded bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-700 disabled:opacity-50"
            >
                {inProgress ? (isEnding ? "Ending..." : "End Analysis") : (isStarting ? "Starting..." : "Start Analysis")}
            </button>
        </div>
    );
}
