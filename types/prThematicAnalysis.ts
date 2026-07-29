export interface PRThematicCode {
    localId: number;
    code: string;
    rationale?: string;
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
