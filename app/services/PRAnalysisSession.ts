import { apiGet, apiPost, apiPatch } from "./apiClient";
import { PRAnalysisSession } from "@/types/PRAnalysisSession";

export async function createPRAnalysisSession(name: string): Promise<PRAnalysisSession> {
    return apiPost<PRAnalysisSession>("/api/pr-analysis-session", { name });
}

export async function completePRAnalysisSession(session: PRAnalysisSession): Promise<PRAnalysisSession> {
    return apiPatch<PRAnalysisSession>("/api/pr-analysis-session", session);
}

export async function getPRAnalysisSession(sessionId: string): Promise<PRAnalysisSession> {
    return apiGet<PRAnalysisSession>(`/api/pr-analysis-session/${sessionId}`);
}
