import { BedrockAgentCoreClient, InvokeHarnessCommand } from "@aws-sdk/client-bedrock-agentcore";

const client = new BedrockAgentCoreClient({
  region: process.env.AGENTCORE_REGION || "eu-west-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

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

const pullRequests = [
  { repositoryId: 111, pullRequestId: 222, number: 5, title: "Fix login bug", body: "Fixes a null pointer in the login flow." },
];

// Deliberately terse comments — the point of this test is to see whether the
// annotation changes the interpretation of comment 335 from "curt approval"
// to "fast approval because of an in-person discussion", per the refined prompt.
const comments = [
  { repositoryId: 111, pullRequestId: 222, commentId: 333, body: "This null check looks fragile, consider using optional chaining.", authorLogin: "alice", path: "src/login.ts" },
  { repositoryId: 111, pullRequestId: 222, commentId: 334, body: "Can we add a unit test for the null case?", authorLogin: "bob", path: "src/login.ts" },
  { repositoryId: 111, pullRequestId: 222, commentId: 335, body: "LGTM", authorLogin: "alice", path: null },
];

const annotations = [
  { repositoryId: 111, commentId: 333, text: "Reviewer flagged this as a recurring pattern across the codebase." },
  { repositoryId: 111, commentId: 335, text: "Author and reviewer had already walked through this change together in person before this comment; the brief approval reflects that prior discussion, not a lack of scrutiny." },
];

const userPrompt = [
  `Perform a thematic analysis of the pull request review comments and annotations below, for analysis session "Test session".`,
  `Respond with ONLY valid JSON matching this exact shape, no markdown code fences, no commentary before or after, no thinking or reasoning tags:`,
  `{"summary": "string", "codes": [{"localId": number, "code": "string", "rationale": "string", "category": "collaboration" | "process" | "code_quality" | "responsiveness" | "knowledge_sharing" | "risk", "repositoryId": number, "pullRequestId": number, "commentId": number}], "themes": [{"theme": "string", "description": "string", "codes": [number]}]}`,
  `"category" must be one of: collaboration, process, code_quality, responsiveness, knowledge_sharing, risk — pick whichever best fits the underlying pattern, not just the surface topic of the comment.`,
  ``,
  `Pull requests:`,
  JSON.stringify(pullRequests),
  ``,
  `Comments:`,
  JSON.stringify(comments),
  ``,
  `Annotations (human-added context — use these to correct or deepen your interpretation of the comment they're attached to):`,
  JSON.stringify(annotations),
].join("\n");

const command = new InvokeHarnessCommand({
  harnessArn: process.env.AGENTCORE_HARNESS_ARN,
  runtimeSessionId: "pr-analysis-harness-refined-prompt-test-run-0001",
  systemPrompt: [{ text: SYSTEM_PROMPT }],
  messages: [{ role: "user", content: [{ text: userPrompt }] }],
  model: {
    bedrockModelConfig: {
      modelId: process.env.AGENTCORE_MODEL_ID || "eu.amazon.nova-pro-v1:0",
      maxTokens: 1500,
      temperature: 0.2,
    },
  },
  maxIterations: 6,
});

try {
  const response = await client.send(command);
  console.log("SUCCESS\n");

  let text = "";
  for await (const event of response.stream) {
    if (event.contentBlockDelta?.delta?.text) text += event.contentBlockDelta.delta.text;
    if (event.validationException) console.log("VALIDATION EXCEPTION:", JSON.stringify(event.validationException, null, 2));
    if (event.internalServerException) console.log("INTERNAL SERVER EXCEPTION:", JSON.stringify(event.internalServerException, null, 2));
    if (event.runtimeClientError) console.log("RUNTIME CLIENT ERROR:", JSON.stringify(event.runtimeClientError, null, 2));
  }

  const cleaned = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = (fenced ? fenced[1] : cleaned).trim();

  console.log("---RAW TEXT---\n", cleaned);

  try {
    const parsed = JSON.parse(jsonText);
    console.log("\n---PARSED JSON---\n", JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log("\n---JSON PARSE FAILED---", e.message);
  }
} catch (err) {
  console.log("ERROR:", err.name, err.message);
}
