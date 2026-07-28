"use client";

import { useState } from "react";
import { usePRAnalysisSession } from "../providers/PRAnalysisSessionProvider";
import { createAnnotation } from "@/app/services/annotations";

export default function AnnotationPanel({
    repositoryId,
    commentId,
}: {
    repositoryId: number;
    commentId: number;
}) {
    const { session } = usePRAnalysisSession();
    const hasActiveSession = Boolean(session && !session.complete);

    const [annotations, setAnnotations] = useState<string[]>([]);
    const [value, setValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function addAnnotation() {
        const trimmed = value.trim();
        if (!trimmed || !session || session.complete) {
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const annotation = await createAnnotation(trimmed, commentId, repositoryId, session.sessionId);
            setAnnotations((previous) => [...previous, annotation.text]);
            setValue("");
        } catch (err: any) {
            setError(err.message || "Failed to save annotation");
        }

        setIsSaving(false);
    }

    const disabled = !hasActiveSession || isSaving;

    return (
        <div>
            <h3 className="text-xs font-semibold text-black">Annotations</h3>
            {!hasActiveSession ? (
                <p className="mt-2 text-xs text-gray-400">Start an analysis to add annotations.</p>
            ) : annotations.length === 0 ? (
                <p className="mt-2 text-xs text-gray-400">No annotations yet.</p>
            ) : (
                <ul className="mt-2 space-y-1">
                    {annotations.map((annotation, index) => (
                        <li key={index} className="text-xs text-gray-600">
                            {annotation}
                        </li>
                    ))}
                </ul>
            )}
            {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
            <form
                className="mt-2 flex gap-1"
                onSubmit={(e) => {
                    e.preventDefault();
                    addAnnotation();
                }}
            >
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. Check this handles null"
                    disabled={disabled}
                    className="w-full min-w-0 text-xs rounded border border-gray-300 px-2 py-1 text-black disabled:opacity-50 disabled:bg-gray-100"
                />
                <button
                    type="submit"
                    disabled={disabled}
                    className="shrink-0 text-xs rounded bg-gray-900 text-white px-2 py-1 hover:bg-gray-700 disabled:opacity-50"
                >
                    Enter
                </button>
            </form>
        </div>
    );
}
