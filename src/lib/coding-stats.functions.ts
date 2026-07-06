import { createServerFn } from "@tanstack/react-start";
import { HANDLES } from "@/data/socials";

/**
 * Live coding profile stats. Public read-only fetches to third-party APIs.
 * Each source is wrapped so one failure doesn't take the page down.
 *
 * Cached in-memory per Worker instance for 5 minutes.
 */

export type Repo = {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  url: string;
  language: string | null;
  updatedAt: string;
};

export type GithubStats = {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  url: string;
  topRepos: Repo[];
} | null;

export type LeetCodeStats = {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  ranking: number | null;
  url: string;
} | null;

export type CodeforcesStats = {
  handle: string;
  rating: number | null;
  rank: string | null;
  maxRating: number | null;
  maxRank: string | null;
  url: string;
} | null;

export type CodeChefStats = {
  username: string;
  rating: number | null;
  stars: string | null;
  globalRank: number | null;
  countryRank: number | null;
  url: string;
} | null;

export type GfgStats = {
  username: string;
  score: number | null;
  problems: number | null;
  url: string;
} | null;

export type AllStats = {
  github: GithubStats;
  leetcode: LeetCodeStats;
  codeforces: CodeforcesStats;
  codechef: CodeChefStats;
  gfg: GfgStats;
  fetchedAt: number;
};

const CACHE_TTL = 5 * 60 * 1000;
let CACHE: { at: number; data: AllStats } | null = null;

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "User-Agent": "amish-portfolio",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  }
}

async function fetchGithub(user: string): Promise<GithubStats> {
  const [uRes, rRes] = await Promise.all([
    safeFetch(`https://api.github.com/users/${user}`),
    safeFetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=100`),
  ]);
  if (!uRes) return null;
  const u = await uRes.json() as any;
  const repos = rRes ? (await rRes.json() as any[]) : [];
  const topRepos: Repo[] = repos
    .filter((r) => !r.fork)
    .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (Date.parse(b.updated_at) - Date.parse(a.updated_at)))
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      url: r.html_url,
      language: r.language,
      updatedAt: r.updated_at,
    }));
  return {
    username: u.login,
    name: u.name,
    avatarUrl: u.avatar_url,
    bio: u.bio,
    publicRepos: u.public_repos,
    followers: u.followers,
    following: u.following,
    url: u.html_url,
    topRepos,
  };
}

async function fetchLeetCode(user: string): Promise<LeetCodeStats> {
  // Try alfa-leetcode-api first, then leetcode-stats-api as fallback.
  const a = await safeFetch(`https://alfa-leetcode-api.onrender.com/${user}/solved`);
  if (a) {
    const j = await a.json() as any;
    if (typeof j?.solvedProblem === "number") {
      return {
        totalSolved: j.solvedProblem,
        easy: j.easySolved ?? 0,
        medium: j.mediumSolved ?? 0,
        hard: j.hardSolved ?? 0,
        ranking: null,
        url: `https://leetcode.com/u/${user}`,
      };
    }
  }
  const b = await safeFetch(`https://leetcode-stats-api.herokuapp.com/${user}`);
  if (b) {
    const j = await b.json() as any;
    if (j?.status === "success") {
      return {
        totalSolved: j.totalSolved,
        easy: j.easySolved,
        medium: j.mediumSolved,
        hard: j.hardSolved,
        ranking: j.ranking ?? null,
        url: `https://leetcode.com/u/${user}`,
      };
    }
  }
  return null;
}

async function fetchCodeforces(user: string): Promise<CodeforcesStats> {
  const res = await safeFetch(`https://codeforces.com/api/user.info?handles=${user}`);
  if (!res) return null;
  const j = await res.json() as any;
  if (j?.status !== "OK" || !j.result?.[0]) return null;
  const u = j.result[0];
  return {
    handle: u.handle,
    rating: u.rating ?? null,
    rank: u.rank ?? null,
    maxRating: u.maxRating ?? null,
    maxRank: u.maxRank ?? null,
    url: `https://codeforces.com/profile/${user}`,
  };
}

async function fetchCodeChef(user: string): Promise<CodeChefStats> {
  const res = await safeFetch(`https://codechef-api.vercel.app/handle/${user}`);
  if (!res) return null;
  const j = await res.json() as any;
  if (!j?.success && !j?.currentRating) return null;
  return {
    username: user,
    rating: j.currentRating ?? null,
    stars: j.stars ?? null,
    globalRank: j.globalRank ?? null,
    countryRank: j.countryRank ?? null,
    url: `https://www.codechef.com/users/${user}`,
  };
}

async function fetchGfg(user: string): Promise<GfgStats> {
  const res = await safeFetch(`https://geeks-for-geeks-api.vercel.app/${user}`);
  if (!res) return null;
  const j = await res.json() as any;
  const info = j?.info;
  if (!info) return null;
  return {
    username: user,
    score: info.codingScore ?? null,
    problems: info.totalProblemsSolved ?? null,
    url: `https://www.geeksforgeeks.org/user/${user}`,
  };
}

export const getCodingStats = createServerFn({ method: "GET" }).handler(async () => {
  if (CACHE && Date.now() - CACHE.at < CACHE_TTL) return CACHE.data;
  const [github, leetcode, codeforces, codechef, gfg] = await Promise.all([
    fetchGithub(HANDLES.github),
    fetchLeetCode(HANDLES.leetcode),
    fetchCodeforces(HANDLES.codeforces),
    fetchCodeChef(HANDLES.codechef),
    fetchGfg(HANDLES.gfg),
  ]);
  const data: AllStats = { github, leetcode, codeforces, codechef, gfg, fetchedAt: Date.now() };
  CACHE = { at: Date.now(), data };
  return data;
});
