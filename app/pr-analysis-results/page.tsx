"use client";

import { useState } from "react";
import SessionListColumn from "./components/SessionListColumn";
import ThematicAnalysisDetail from "./components/ThematicAnalysisDetail";
import { PRAnalysisSession } from "@/types/PRAnalysisSession";

export default function PRAnalysisResultsPage() {
    const [selectedSession, setSelectedSession] = useState<PRAnalysisSession | null>(null);

    return (
        <div className="px-4 flex flex-col h-[calc(100vh-8rem)]">
            <h1 className="text-base font-semibold dark:text-white mt-4 mb-4 shrink-0">Analysis Results</h1>
            <div className="flex flex-1 min-h-0 border border-white/10 rounded-lg overflow-hidden">
                <SessionListColumn
                    selectedSessionId={selectedSession?.sessionId ?? null}
                    onSelect={setSelectedSession}
                />
                <ThematicAnalysisDetail session={selectedSession} />
            </div>
        </div>
    );
}
