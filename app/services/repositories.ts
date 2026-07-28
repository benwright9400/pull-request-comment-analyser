import { apiGet } from "./apiClient";

export type Repository = {
    id: number;
    name: string;
    fullName: string;
    owner: { login: string };
};

export async function listRepositories(): Promise<Repository[]> {
    const { repositories } = await apiGet<{ repositories: Repository[] }>("/api/repositories");
    return repositories;
}
