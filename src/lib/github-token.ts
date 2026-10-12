/** Visitor-supplied GitHub token, kept only in this browser. Call from effects/handlers only. */
const KEY = "aether:gh-token";

export function readGithubToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(KEY) || undefined;
}

export function writeGithubToken(token: string | null) {
  if (token) window.localStorage.setItem(KEY, token.trim());
  else window.localStorage.removeItem(KEY);
}
