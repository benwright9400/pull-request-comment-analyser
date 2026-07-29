import { describe, expect, it } from "vitest";
import {
  stripThinkingTags,
  extractJson,
  backfillPullRequestIds,
  buildUserPrompt,
  ThematicAnalysisInput,
} from "./AgentCoreService";
import { PRThematicAnalysisResult } from "@/types/prThematicAnalysis";

describe("stripThinkingTags", () => {
  it("removes a thinking block and trims surrounding whitespace", () => {
    const input = ' <thinking>\nsome internal reasoning\n</thinking>\n\n{"summary": "ok"}';
    expect(stripThinkingTags(input)).toBe('{"summary": "ok"}');
  });

  it("removes multiple thinking blocks, case-insensitively", () => {
    const input = "<THINKING>one</THINKING>before<thinking>two</thinking>after";
    expect(stripThinkingTags(input)).toBe("beforeafter");
  });

  it("leaves text with no thinking tags unchanged (aside from trimming)", () => {
    expect(stripThinkingTags('  {"summary": "ok"}  ')).toBe('{"summary": "ok"}');
  });
});

describe("extractJson", () => {
  it("extracts JSON from a ```json fenced block", () => {
    const input = 'Here you go:\n```json\n{"a": 1}\n```';
    expect(extractJson(input)).toBe('{"a": 1}');
  });

  it("extracts JSON from a bare ``` fenced block with no language tag", () => {
    const input = '```\n{"a": 1}\n```';
    expect(extractJson(input)).toBe('{"a": 1}');
  });

  it("returns the trimmed input unchanged when there is no code fence", () => {
    expect(extractJson('  {"a": 1}  ')).toBe('{"a": 1}');
  });
});

describe("backfillPullRequestIds", () => {
  const comments: ThematicAnalysisInput["comments"] = [
    { repositoryId: 111, pullRequestId: 222, commentId: 333, body: "a comment" },
  ];

  function resultWithCode(code: Partial<PRThematicAnalysisResult["codes"][number]>): PRThematicAnalysisResult {
    return {
      summary: "summary",
      codes: [{ localId: 1, code: "example", ...code }],
      themes: [],
    };
  }

  it("leaves an existing pullRequestId untouched", () => {
    const result = resultWithCode({ commentId: 333, pullRequestId: 999 });
    const backfilled = backfillPullRequestIds(result, comments);
    expect(backfilled.codes[0].pullRequestId).toBe(999);
  });

  it("backfills a missing pullRequestId from the matching comment", () => {
    const result = resultWithCode({ commentId: 333 });
    const backfilled = backfillPullRequestIds(result, comments);
    expect(backfilled.codes[0].pullRequestId).toBe(222);
  });

  it("leaves pullRequestId undefined when the commentId doesn't match any comment", () => {
    const result = resultWithCode({ commentId: 999 });
    const backfilled = backfillPullRequestIds(result, comments);
    expect(backfilled.codes[0].pullRequestId).toBeUndefined();
  });

  it("leaves pullRequestId undefined when the code has no commentId at all", () => {
    const result = resultWithCode({});
    const backfilled = backfillPullRequestIds(result, comments);
    expect(backfilled.codes[0].pullRequestId).toBeUndefined();
  });
});

describe("buildUserPrompt", () => {
  const input: ThematicAnalysisInput = {
    analysisId: "abc123",
    name: "Test session",
    pullRequests: [{ repositoryId: 111, pullRequestId: 222, number: 5, title: "Fix bug", body: "fixes it" }],
    comments: [{ repositoryId: 111, pullRequestId: 222, commentId: 333, body: "looks fragile" }],
    annotations: [{ repositoryId: 111, commentId: 333, text: "discussed in person" }],
  };

  it("includes the session name and the required category enum", () => {
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain('"Test session"');
    expect(prompt).toContain("collaboration");
    expect(prompt).toContain("knowledge_sharing");
  });

  it("embeds the pull requests, comments and annotations as JSON", () => {
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain(JSON.stringify(input.pullRequests));
    expect(prompt).toContain(JSON.stringify(input.comments));
    expect(prompt).toContain(JSON.stringify(input.annotations));
  });

  it("instructs the model to let annotations shape comment interpretation", () => {
    expect(buildUserPrompt(input)).toMatch(/annotations.*use these to correct or deepen/i);
  });
});
