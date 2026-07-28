import { getOctokit } from "./client";

export async function listPullRequests(
  accessToken: string,
  owner?: string,
  repo?: string
) {
  const octokit = getOctokit(accessToken);

  if (owner && repo) {
    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "all",
    });
    return data;
  }

  // No specific repo given: list pull requests across all repos the user is involved in.
  const { data } = await octokit.rest.search.issuesAndPullRequests({
    q: "is:pr involves:@me",
    sort: "updated",
    order: "desc",
  });
  return data.items;
}

export async function getPullRequest(
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });
  return data;
}
