import { apiGet } from "./apiClient";
import { PRThematicAnalysisResult } from "@/types/prThematicAnalysis";

export type PRThematicAnalysis = PRThematicAnalysisResult & {
    analysisId: string;
};

export async function getPRThematicAnalysis(sessionId: string): Promise<PRThematicAnalysis> {
    return apiGet<PRThematicAnalysis>(`/api/pr-analysis-session/${sessionId}/thematic-analysis`);
}
