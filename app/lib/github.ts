/**
 * Minimal GitHub Contents API client — the site's "database" is the repo
 * itself. Saving from /admin commits content/site.json, which makes Vercel
 * rebuild and publish. No external database required.
 */

const API = "https://api.github.com";

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // "owner/name"
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  if (!repo || !repo.includes("/")) {
    throw new Error('GITHUB_REPO is not set (expected "owner/repository")');
  }
  return { token, repo, branch };
}

async function gh(path: string, init: RequestInit = {}) {
  const { token } = config();
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  return res;
}

export type RepoFile = { text: string; sha: string };

export async function readFile(path: string): Promise<RepoFile | null> {
  const { repo, branch } = config();
  const res = await gh(
    `/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { content: string; sha: string };
  return { text: Buffer.from(json.content, "base64").toString("utf8"), sha: json.sha };
}

/** Create or update a file. Pass the current `sha` when replacing an existing one. */
export async function writeFile(
  path: string,
  contentBase64: string,
  message: string,
  sha?: string
): Promise<{ commit: string }> {
  const { repo, branch } = config();
  const res = await gh(`/repos/${repo}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: contentBase64, branch, ...(sha ? { sha } : {}) }),
  });
  if (res.status === 409 || res.status === 422) {
    throw new Error("CONFLICT");
  }
  if (!res.ok) throw new Error(`GitHub write failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { commit: { sha: string } };
  return { commit: json.commit.sha };
}

export const CONTENT_PATH = "content/site.json";
