import PRAnalysisSession, { AgentRunStatus, IPRAnalysisSession } from "../models/PRAnalysisSession";
import { getMongoDB } from "../MongoDB";

export async function createPRAnalysisSession(
  sessionId: string,
  name: string,
  date: string,
  accountId: string
): Promise<IPRAnalysisSession> {
  await getMongoDB();
  return await PRAnalysisSession.create({
    sessionId,
    name,
    date: new Date(date),
    complete: false,
    agentStatus: "pending",
    accountId,
  });
}

export async function completePRAnalysisSession(
  sessionId: string,
  accountId: string
): Promise<IPRAnalysisSession | null> {
  await getMongoDB();
  return await PRAnalysisSession.findOneAndUpdate(
    { sessionId, accountId },
    { complete: true },
    { new: true }
  );
}

export async function updateAgentStatus(
  sessionId: string,
  accountId: string,
  agentStatus: AgentRunStatus
): Promise<IPRAnalysisSession | null> {
  await getMongoDB();
  return await PRAnalysisSession.findOneAndUpdate(
    { sessionId, accountId },
    { agentStatus },
    { new: true }
  );
}

export async function listPRAnalysisSessionsForAccount(accountId: string): Promise<IPRAnalysisSession[]> {
  await getMongoDB();
  return await PRAnalysisSession.find({ accountId }).sort({ date: -1 });
}

export async function getPRAnalysisSessionForAccount(
  sessionId: string,
  accountId: string
): Promise<IPRAnalysisSession | null> {
  await getMongoDB();
  return await PRAnalysisSession.findOne({ sessionId, accountId });
}

export async function isAnalysisSessionOwnedByAccount(
  sessionId: string,
  accountId: string
): Promise<boolean> {
  await getMongoDB();
  const session = await PRAnalysisSession.findOne({ sessionId, accountId });
  return Boolean(session);
}
