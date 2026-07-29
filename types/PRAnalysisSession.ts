export type AgentRunStatus = "pending" | "running" | "complete" | "failed";

export interface PRAnalysisSession {
    sessionId: string;
    name: string;
    date: string;
    complete: boolean;
    agentStatus: AgentRunStatus;
}
