import { getOctokit } from "./client";

export async function listComments(
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const octokit = getOctokit(accessToken);
  const [reviewComments, issueComments] = await Promise.all([
    octokit.rest.pulls.listReviewComments({
      owner,
      repo,
      pull_number: pullNumber,
    }),
    octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pullNumber,
    }),
  ]);
  return {
    reviewComments: reviewComments.data,
    issueComments: issueComments.data,
  };
}
