import {
  BedrockAgentCoreClient,
  InvokeHarnessCommand,
} from "@aws-sdk/client-bedrock-agentcore";
import { PRThematicAnalysisResult } from "@/types/prThematicAnalysis";

const client = new BedrockAgentCoreClient({
  region: process.env.AGENTCORE_REGION || "eu-west-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

const HARNESS_ARN =
  process.env.AGENTCORE_HARNESS_ARN;

const MODEL_ID = process.env.AGENTCORE_MODEL_ID || "eu.amazon.nova-pro-v1:0";

export type ThematicAnalysisInput = {
  analysisId: string;
  name: string;
  pullRequests: {
    repositoryId: number;
    pullRequestId: number;
    number: number;
    title: string;
    body: string | null;
  }[];
  comments: {
    repositoryId: number;
    pullRequestId: number;
    commentId: number;
    body: string;
    authorLogin?: string;
    path?: string;
  }[];
  annotations: {
    repositoryId: number;
    commentId: number;
    text: string;
  }[];
};

const SYSTEM_PROMPT =
  "You are a qualitative research assistant performing thematic analysis on software pull request review discussions. " +
  "The purpose of this analysis is to surface engineer and team characteristics — collaboration style, review culture, " +
  "process patterns, and recurring error trends with likely causes — to inform personal development plans and " +
  "team-level interventions. Different team contexts (e.g. a small startup team versus a large enterprise team on a " +
  "mature codebase) can produce the same observable pattern for very different reasons, so describe what you observe " +
  "descriptively rather than grading it as good or bad practice, unless the evidence given clearly supports a judgement. " +
  "PR comments alone often miss context that happened outside the PR (in-person discussions, related changes to other " +
  "artefacts, operational constraints) — annotations are human-added context specifically meant to fill that gap. " +
  "When a comment has an associated annotation, let the annotation meaningfully shape the code and rationale you " +
  "produce for it, not just sit alongside it as another data point. Prefer codes that represent a pattern recurring " +
  "across multiple comments over one-off remarks, and only state a likely cause for an error or friction pattern when " +
  "the comments and annotations actually support it — stay evidence-bound rather than speculating about team dynamics " +
  "you can't see. Always respond with strictly valid JSON only.";

function buildUserPrompt(input: ThematicAnalysisInput): string {
  return [
    `Perform a thematic analysis of the pull request review comments and annotations below, for analysis session "${input.name}".`,
    `Respond with ONLY valid JSON matching this exact shape, no markdown code fences, no commentary before or after, no thinking or reasoning tags:`,
    `{"summary": "string", "codes": [{"localId": number, "code": "string", "rationale": "string", "category": "collaboration" | "process" | "code_quality" | "responsiveness" | "knowledge_sharing" | "risk", "repositoryId": number, "pullRequestId": number, "commentId": number}], "themes": [{"theme": "string", "description": "string", "codes": [number]}]}`,
    `"category" must be one of: collaboration, process, code_quality, responsiveness, knowledge_sharing, risk — pick whichever best fits the underlying pattern, not just the surface topic of the comment.`,
    ``,
    `Pull requests:`,
    JSON.stringify(input.pullRequests),
    ``,
    `Comments:`,
    JSON.stringify(input.comments),
    ``,
    `Annotations (human-added context — use these to correct or deepen your interpretation of the comment they're attached to):`,
    JSON.stringify(input.annotations),
  ].join("\n");
}

function stripThinkingTags(text: string): string {
  return text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

// Annotations aren't tied to a specific PR in our data model (only to a
// comment), so the model sometimes omits pullRequestId on annotation-derived
// codes. Backfill it from the comment it's linked to rather than trust the
// model to carry it through correctly.
function backfillPullRequestIds(
  result: PRThematicAnalysisResult,
  comments: ThematicAnalysisInput["comments"]
): PRThematicAnalysisResult {
  const pullRequestIdByCommentId = new Map(comments.map((comment) => [comment.commentId, comment.pullRequestId]));

  return {
    ...result,
    codes: result.codes.map((code) => ({
      ...code,
      pullRequestId:
        code.pullRequestId ?? (code.commentId !== undefined ? pullRequestIdByCommentId.get(code.commentId) : undefined),
    })),
  };
}

export async function invokeThematicAnalysisAgent(
  input: ThematicAnalysisInput
): Promise<PRThematicAnalysisResult> {
  const command = new InvokeHarnessCommand({
    harnessArn: HARNESS_ARN,
    runtimeSessionId: `pr-analysis-session-${input.analysisId}`,
    systemPrompt: [{ text: SYSTEM_PROMPT }],
    messages: [
      {
        role: "user",
        content: [{ text: buildUserPrompt(input) }],
      },
    ],
    model: {
      bedrockModelConfig: {
        modelId: MODEL_ID,
        maxTokens: 1500,
        temperature: 0.2,
      },
    },
    maxIterations: 8,
  });

  const response = await client.send(command);

  if (!response.stream) {
    throw new Error("AgentCore harness returned no response stream");
  }

  let text = "";
  for await (const event of response.stream) {
    if (event.contentBlockDelta?.delta?.text) {
      text += event.contentBlockDelta.delta.text;
    }
    if (event.validationException) {
      throw new Error(`AgentCore harness validation error: ${event.validationException.message}`);
    }
    if (event.internalServerException) {
      throw new Error(`AgentCore harness internal error: ${event.internalServerException.message}`);
    }
    if (event.runtimeClientError) {
      throw new Error(`AgentCore harness runtime error: ${event.runtimeClientError.message}`);
    }
  }

  const cleaned = stripThinkingTags(text);
  const jsonText = extractJson(cleaned);

  let parsed: PRThematicAnalysisResult;
  try {
    parsed = JSON.parse(jsonText) as PRThematicAnalysisResult;
  } catch {
    throw new Error(`Could not parse AgentCore harness response as JSON: ${cleaned}`);
  }

  return backfillPullRequestIds(parsed, input.comments);
}
