"use client";

import { useState } from "react";

export default function AnnotationPanel() {
    const [annotations, setAnnotations] = useState<string[]>([]);
    const [value, setValue] = useState("");

    function addAnnotation() {
        const trimmed = value.trim();
        if (!trimmed) {
            return;
        }
        setAnnotations((previous) => [...previous, trimmed]);
        setValue("");
    }

    return (
        <div>
            <h3 className="text-xs font-semibold text-black">Annotations</h3>
            {annotations.length === 0 ? (
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
                    className="w-full min-w-0 text-xs rounded border border-gray-300 px-2 py-1 text-black"
                />
                <button
                    type="submit"
                    className="shrink-0 text-xs rounded bg-gray-900 text-white px-2 py-1 hover:bg-gray-700"
                >
                    Enter
                </button>
            </form>
        </div>
    );
}
