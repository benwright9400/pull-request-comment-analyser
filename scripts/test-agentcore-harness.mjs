import { BedrockAgentCoreClient, InvokeHarnessCommand } from "@aws-sdk/client-bedrock-agentcore";

const client = new BedrockAgentCoreClient({
  region: process.env.AGENTCORE_REGION || "eu-west-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const userPrompt = `Perform a thematic analysis of the following pull request review comments and annotations for analysis session "Test session".
Respond with ONLY valid JSON matching this exact shape, no markdown code fences, no commentary before or after, no thinking or reasoning tags:
{"summary": "string", "codes": [{"localId": 1, "code": "string", "rationale": "string", "repositoryId": 111, "pullRequestId": 222, "commentId": 333}], "themes": [{"theme": "string", "description": "string", "codes": [1]}]}

Pull requests:
[{"repositoryId":111,"pullRequestId":222,"number":5,"title":"Fix login bug","body":"Fixes a null pointer in the login flow."}]

Comments:
[{"repositoryId":111,"pullRequestId":222,"commentId":333,"body":"This null check looks fragile, consider using optional chaining.","authorLogin":"alice","path":"src/login.ts"},{"repositoryId":111,"pullRequestId":222,"commentId":334,"body":"Can we add a unit test for the null case?","authorLogin":"bob","path":"src/login.ts"},{"repositoryId":111,"pullRequestId":222,"commentId":335,"body":"LGTM once tests are added.","authorLogin":"alice","path":null}]

Annotations:
[{"repositoryId":111,"commentId":333,"text":"Reviewer flagged this as a recurring pattern across the codebase."}]`;

const command = new InvokeHarnessCommand({
  harnessArn: process.env.AGENTCORE_HARNESS_ARN,
  runtimeSessionId: "pr-analysis-harness-real-prompt-test-run-0001",
  systemPrompt: [
    {
      text: "You are a qualitative research assistant that performs thematic analysis on software pull request review discussions. Always respond with strictly valid JSON only.",
    },
  ],
  messages: [
    {
      role: "user",
      content: [{ text: userPrompt }],
    },
  ],
  model: {
    bedrockModelConfig: {
      modelId: "eu.amazon.nova-pro-v1:0",
      maxTokens: 1500,
      temperature: 0.2,
    },
  },
  maxIterations: 5,
});

try {
  const response = await client.send(command);
  console.log("SUCCESS\n");

  let text = "";
  for await (const event of response.stream) {
    if (event.contentBlockDelta?.delta?.text) {
      text += event.contentBlockDelta.delta.text;
    }
    if (event.messageStop) {
      console.log("STOP REASON:", event.messageStop.stopReason);
    }
    if (event.validationException) {
      console.log("VALIDATION EXCEPTION:", JSON.stringify(event.validationException, null, 2));
    }
    if (event.internalServerException) {
      console.log("INTERNAL SERVER EXCEPTION:", JSON.stringify(event.internalServerException, null, 2));
    }
    if (event.runtimeClientError) {
      console.log("RUNTIME CLIENT ERROR:", JSON.stringify(event.runtimeClientError, null, 2));
    }
    if (event.metadata) {
      console.log("USAGE:", JSON.stringify(event.metadata.usage));
    }
  }

  console.log("\n---RAW TEXT---\n", text);

  const stripped = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();
  const fenced = stripped.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = (fenced ? fenced[1] : stripped).trim();

  try {
    const parsed = JSON.parse(jsonText);
    console.log("\n---PARSED JSON---\n", JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log("\n---JSON PARSE FAILED---", e.message);
  }
} catch (err) {
  console.log("ERROR NAME:", err.name);
  console.log("ERROR MESSAGE:", err.message);
}
