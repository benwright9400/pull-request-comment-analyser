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
  process.env.AGENTCORE_HARNESS_ARN ||
  "arn:aws:bedrock-agentcore:eu-west-1:558099092121:harness/harness_jybmj-HY6CKXLpL2";

// eu-west-1 requires the region-prefixed cross-region inference profile id,
// not the bare model id.
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

function buildUserPrompt(input: ThematicAnalysisInput): string {
  return [
    `Perform a thematic analysis of the pull request review comments and annotations below, for analysis session "${input.name}".`,
    `Respond with ONLY valid JSON matching this exact shape, no markdown code fences, no commentary before or after, no thinking or reasoning tags:`,
    `{"summary": "string", "codes": [{"localId": number, "code": "string", "rationale": "string", "repositoryId": number, "pullRequestId": number, "commentId": number}], "themes": [{"theme": "string", "description": "string", "codes": [number]}]}`,
    ``,
    `Pull requests:`,
    JSON.stringify(input.pullRequests),
    ``,
    `Comments:`,
    JSON.stringify(input.comments),
    ``,
    `Annotations (human-added context):`,
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
    // AgentCore requires a runtimeSessionId of a minimum length; analysisId
    // alone (a cuid2) may be too short, so it's padded with a stable prefix.
    runtimeSessionId: `pr-analysis-session-${input.analysisId}`,
    systemPrompt: [
      {
        text: "You are a qualitative research assistant that performs thematic analysis on software pull request review discussions. Always respond with strictly valid JSON only.",
      },
    ],
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
    // A single iteration isn't enough: the harness runs an internal
    // tool_use/tool_result cycle before producing the final text.
    maxIterations: 6,
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
