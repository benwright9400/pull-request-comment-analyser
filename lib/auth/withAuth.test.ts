import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { getServerSession } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}));

vi.mock("next-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-auth")>();
  return { ...actual, getServerSession };
});

const { withAuth } = await import("./withAuth");

function makeRequest() {
  return new NextRequest("http://localhost/api/test");
}

describe("withAuth", () => {
  beforeEach(() => {
    getServerSession.mockReset();
  });

  it("returns 401 and never calls the handler when there is no session", async () => {
    getServerSession.mockResolvedValue(null);
    const handler = vi.fn();

    const response = await withAuth(handler)(makeRequest(), undefined);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorised" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 401 when the session has no githubId", async () => {
    getServerSession.mockResolvedValue({ user: { name: "Ben" } });
    const handler = vi.fn();

    const response = await withAuth(handler)(makeRequest(), undefined);

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls the handler with the session when githubId is present", async () => {
    const session = { user: { name: "Ben", githubId: "12345" } };
    getServerSession.mockResolvedValue(session);
    const handler = vi.fn().mockResolvedValue(new Response("ok"));

    const req = makeRequest();
    const context = { params: Promise.resolve({ id: "1" }) };
    const response = await withAuth(handler)(req, context);

    expect(handler).toHaveBeenCalledWith(req, session, context);
    expect(await response.text()).toBe("ok");
  });
});
