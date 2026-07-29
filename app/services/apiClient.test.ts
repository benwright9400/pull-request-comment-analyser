import { describe, expect, it, vi, beforeEach } from "vitest";
import { apiGet, apiPost, apiPatch } from "./apiClient";

function mockFetchOnce(ok: boolean, body: unknown) {
    global.fetch = vi.fn().mockResolvedValue({
        ok,
        json: async () => body,
    }) as unknown as typeof fetch;
}

describe("apiGet", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("returns the response body with keys converted to camelCase", async () => {
        mockFetchOnce(true, { pull_request_id: 1, repository_id: 2 });

        const result = await apiGet<{ pullRequestId: number; repositoryId: number }>("/api/thing");

        expect(result).toEqual({ pullRequestId: 1, repositoryId: 2 });
    });

    it("converts nested object keys too", async () => {
        mockFetchOnce(true, { author_login: "alice", inner: { comment_id: 5 } });

        const result = await apiGet<any>("/api/thing");

        expect(result).toEqual({ authorLogin: "alice", inner: { commentId: 5 } });
    });

    it("throws using the response's error message when not ok", async () => {
        mockFetchOnce(false, { error: "Unauthorised" });

        await expect(apiGet("/api/thing")).rejects.toThrow("Unauthorised");
    });

    it("falls back to a generic message when the error body has no error field", async () => {
        mockFetchOnce(false, {});

        await expect(apiGet("/api/thing")).rejects.toThrow("Request to /api/thing failed");
    });
});

describe("apiPost", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("sends a POST with a JSON body and returns the camelCased response", async () => {
        mockFetchOnce(true, { session_id: "abc" });

        const result = await apiPost<{ sessionId: string }>("/api/thing", { name: "test" });

        expect(fetch).toHaveBeenCalledWith(
            "/api/thing",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "test" }),
            })
        );
        expect(result).toEqual({ sessionId: "abc" });
    });

    it("throws using the response's error message when not ok", async () => {
        mockFetchOnce(false, { error: "name is required" });

        await expect(apiPost("/api/thing", {})).rejects.toThrow("name is required");
    });
});

describe("apiPatch", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("sends a PATCH with a JSON body and returns the camelCased response", async () => {
        mockFetchOnce(true, { agent_status: "complete" });

        const result = await apiPatch<{ agentStatus: string }>("/api/thing", { sessionId: "abc" });

        expect(fetch).toHaveBeenCalledWith(
            "/api/thing",
            expect.objectContaining({ method: "PATCH" })
        );
        expect(result).toEqual({ agentStatus: "complete" });
    });
});
