export type PRThematicCodeCategory =
    | "collaboration"
    | "process"
    | "code_quality"
    | "responsiveness"
    | "knowledge_sharing"
    | "risk";

export interface PRThematicCode {
    localId: number;
    code: string;
    rationale?: string;
    category?: PRThematicCodeCategory;
    repositoryId?: number;
    pullRequestId?: number;
    commentId?: number;
}

export interface PRThematicTheme {
    theme: string;
    description?: string;
    codes: number[];
}

export interface PRThematicAnalysisResult {
    summary?: string;
    codes: PRThematicCode[];
    themes: PRThematicTheme[];
}
