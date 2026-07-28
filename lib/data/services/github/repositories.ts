import { getOctokit } from "./client";

export async function listRepositories(accessToken: string) {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
  });
  return data;
}
