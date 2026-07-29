import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const {
  createPRAnalysisSession,
  isAnalysisSessionOwnedByAccount,
  completePRAnalysisSession,
  getPRAnalysisSessionForAccount,
} = await import("./PRAnalysisSessionRepository");

describe("PRAnalysisSessionRepository ownership", () => {
  it("reports a session as owned by the account that created it", async () => {
    const session = await createPRAnalysisSession("session-1", "Test", new Date().toISOString(), "owner-account");

    expect(await isAnalysisSessionOwnedByAccount(session.sessionId, "owner-account")).toBe(true);
  });

  it("does not report a session as owned by a different account", async () => {
    const session = await createPRAnalysisSession("session-2", "Test", new Date().toISOString(), "owner-account");

    expect(await isAnalysisSessionOwnedByAccount(session.sessionId, "someone-else")).toBe(false);
  });

  it("returns false for a sessionId that doesn't exist at all", async () => {
    expect(await isAnalysisSessionOwnedByAccount("does-not-exist", "owner-account")).toBe(false);
  });

  it("does not complete a session when the accountId doesn't match its owner", async () => {
    const session = await createPRAnalysisSession("session-3", "Test", new Date().toISOString(), "owner-account");

    const result = await completePRAnalysisSession(session.sessionId, "someone-else");

    expect(result).toBeNull();
    const stillIncomplete = await getPRAnalysisSessionForAccount(session.sessionId, "owner-account");
    expect(stillIncomplete?.complete).toBe(false);
  });

  it("completes a session when the accountId matches its owner", async () => {
    const session = await createPRAnalysisSession("session-4", "Test", new Date().toISOString(), "owner-account");

    const result = await completePRAnalysisSession(session.sessionId, "owner-account");

    expect(result?.complete).toBe(true);
  });
});
