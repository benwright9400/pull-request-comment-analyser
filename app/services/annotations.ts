import { apiPost } from "./apiClient";

export type Annotation = {
    id: string;
    text: string;
    commentId: number;
    repositoryId: number;
    analysisId: string;
    createdAt: string;
};

export async function createAnnotation(
    text: string,
    commentId: number,
    repositoryId: number,
    analysisId: string
): Promise<Annotation> {
    return apiPost<Annotation>("/api/annotations", { text, commentId, repositoryId, analysisId });
}
