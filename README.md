# PR Thematic Analyser

A prototype tool that performs LLM-assisted thematic analysis on GitHub pull request review discussions, with human-added context (annotations) used to fill in what comments alone can't capture (in-person discussions, out-of-band changes, etc.). Intended to surface team/engineer characteristics — collaboration style, process patterns, recurring error trends — to inform personal development plans and team-level interventions.

**This project is intended for local, single-instance use** — see [Limitations](#limitations) before considering any shared or production deployment.

## Architecture

Built on Next.js (App Router) with a consistent layered structure:

```
UI component (app/**/components)
   ↓
Client service (app/services/*.ts)         — fetch wrappers, snake_case → camelCase conversion
   ↓ HTTP
API route (app/api/**/route.ts)             — auth (withAuth) + validation only
   ↓
Business orchestration (lib/business/**)   — multi-step workflows
   ↓
Repository (lib/data/database/repositories/**)   — Mongoose CRUD, one file per collection
   +
External service client (lib/data/services/**)   — AWS / GitHub SDK wrappers
```

- **Auth**: NextAuth (GitHub OAuth only — see limitations). `lib/auth/withAuth.ts` wraps every API route, injecting a typed, non-null `session.user.githubId`. `middleware.ts` provides a coarse gate in front of that (JSON `401` for unauthenticated API calls, redirect for pages).
- **Data model** (MongoDB via Mongoose), all scoped by `accountId` (the GitHub user id):
  - `PRAnalysisSession` — an analysis "run" (name, date, `complete`, `agentStatus`).
  - `AnalysedRepository` / `AnalysedPullRequest` / `AnalysedComment` — point-in-time snapshots of GitHub data, captured when a session ends, so later analysis isn't affected by upstream PR edits.
  - `Annotation` — user-added context tied to a specific comment.
  - `PRThematicAnalysis` — the LLM's output (summary, codes with a `category`, themes).
  - Every write route checks `isAnalysisSessionOwnedByAccount` before persisting.
- **The end-to-end flow**:
  1. `/pull-requests` — browse Repository → Pull Request → Comments (live GitHub API calls via `lib/data/services/github/*`, not cached).
  2. Start a session, select PRs via checkboxes (client-side state until the session ends), optionally add annotations to specific comments.
  3. "End Analysis" persists the selected repos/PRs/**all** their comments as snapshots, then marks the session complete and kicks off the agent run.
  4. `lib/business/pr-analysis/RunPRAgentAnalysis.ts` reads the snapshots back, calls `lib/data/services/AgentCoreService.ts` (AWS Bedrock AgentCore Harness), parses the streamed response, and saves a `PRThematicAnalysis`.
  5. `/pr-analysis-results` lists past sessions and their results once `agentStatus` reaches `complete`.

## Limitations

- **Agent calls run in-process, in the background, on the same server that serves the app.** When a session ends, the API route returns immediately and fires the agent-analysis job unawaited (`void runPRAgentAnalysis(...)`) so the request isn't blocked on a slow LLM call. This is only safe because the app is expected to run as a **persistent, long-lived Node process** — the fire-and-forget promise keeps running after the response returns because the process itself doesn't get torn down between requests. **This would not be safe on a serverless platform** (Vercel functions, AWS Lambda), where the execution environment can be frozen or killed immediately after a response is sent, silently truncating the agent run.
- Running the agent inline like this also means a failure or slow run in the agent pipeline shares the same process (and therefore fate) as the rest of the app. This is an accepted risk for local/single-user use. **In a real deployment, this would likely be split into its own artefact running in its own container**, isolated from the main application so a failure there can't take down the app serving normal requests.
- If the server process restarts while a session's `agentStatus` is `running`, that job is silently abandoned — there's no resume-on-boot logic.
- The request/response contract with the AgentCore Harness (prompt shape, expected JSON output) is this project's own design, not a platform-guaranteed schema — model or prompt changes can require re-validating it (see `scripts/test-agentcore-harness.mjs` for a live diagnostic script used to do exactly that during development).
- No end-to-end or integration test coverage — only unit tests for pure logic and authorization-critical code (see [Testing](#testing)).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test
```

Runs the Vitest suite: pure-function tests for the AgentCore response parsing (`lib/data/services/AgentCoreService.test.ts`), the auth wrapper (`lib/auth/withAuth.test.ts`), the client fetch wrappers (`app/services/apiClient.test.ts`), and session-ownership checks against an in-memory MongoDB (`lib/data/database/repositories/PRAnalysisSessionRepository.test.ts`).

## Setup

You'll need accounts/access for: GitHub (OAuth App), MongoDB (a connection string, e.g. from Atlas), and AWS (Bedrock AgentCore).

Create a `.env` file in the project root with:

```bash
NEXTAUTH_SECRET=            # any random string, e.g. `openssl rand -base64 32`
NEXTAUTH_URL=http://localhost:3000

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

MONGODB_URI=

AGENTCORE_REGION=
AGENTCORE_HARNESS_ARN=

ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
```

### GitHub OAuth App
Create one at GitHub → Settings → Developer settings → OAuth Apps, with callback URL `http://localhost:3000/api/auth/callback/github`. Requests `read:user repo` scope.

### AWS: access keys with permission to invoke a Harness

The app calls `InvokeHarnessCommand` against an AWS Bedrock AgentCore Harness that must already exist (`AGENTCORE_HARNESS_ARN`) — this project doesn't provision one for you. To get credentials that can call it:

1. **Have a Harness already created** in your AWS account (via the Bedrock AgentCore console or the control-plane API) — you need its ARN, in the form `arn:aws:bedrock-agentcore:<region>:<account-id>:harness/<name>-<id>`.
2. **Create or reuse an IAM user/role** for this app's server-side AWS calls, and attach a policy granting at minimum:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["bedrock-agentcore:InvokeHarness"],
         "Resource": "arn:aws:bedrock-agentcore:<region>:<account-id>:harness/*"
       }
     ]
   }
   ```
   Scope the `Resource` down to the specific harness ARN rather than a wildcard where possible.
3. **Generate an access key** for that IAM user (IAM → Users → your user → Security credentials → Create access key) and put the key ID/secret in `.env` as `ACCESS_KEY_ID`/`SECRET_ACCESS_KEY`.
4. **Confirm model access** for whichever foundation model the Harness is configured to use, in the same region as the Harness — under Bedrock → Model access. A Harness invocation can succeed at the transport level but still fail downstream if the underlying model isn't enabled for the account in that region (this surfaces as an error inside the response stream, not as a rejected request).
5. Set `AGENTCORE_REGION` to the Harness's region — AgentCore's regional availability doesn't necessarily match where your other AWS resources (or this app's other integrations) live, so don't assume it matches a region you're already using elsewhere.
