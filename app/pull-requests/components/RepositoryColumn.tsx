"use client";

import { useEffect, useState } from "react";
import Column from "./Column";

export type Repository = {
    id: number;
    name: string;
    full_name: string;
    owner: { login: string };
};

export default function RepositoryColumn({
    selectedRepository,
    onSelect,
}: {
    selectedRepository: Repository | null;
    onSelect: (repository: Repository) => void;
}) {
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getRepositories();
    }, []);

    async function getRepositories() {
        setIsLoading(true);
        setError(null);

        const res = await fetch("/api/repositories");
        const body = await res.json();

        if (!res.ok) {
            setError(body.error || "Failed to load repositories");
            setRepositories([]);
        } else {
            setRepositories(body.repositories);
        }

        setIsLoading(false);
    }

    return (
        <Column
            title="Repositories"
            isLoading={isLoading}
            isEmpty={!error && repositories.length === 0}
            emptyMessage="No repositories found."
        >
            {error ? (
                <p className="px-4 py-3 text-sm text-red-500">{error}</p>
            ) : (
                <ul>
                    {repositories.map((repository) => (
                        <li key={repository.id}>
                            <button
                                onClick={() => onSelect(repository)}
                                className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 hover:bg-white/5 ${selectedRepository?.id === repository.id
                                        ? "bg-white/10 dark:text-white text-black font-medium"
                                        : "dark:text-gray-300 text-gray-600"
                                    }`}
                            >
                                {repository.full_name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Column>
    );
}
