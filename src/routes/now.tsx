import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, ExternalLink, GitBranch, Trophy, Code2, Flame, Globe, MapPin } from "lucide-react";
import { codingStatsQueryKey, getCodingStats, type AllStats } from "@/lib/coding-stats.functions";
import { SOCIALS } from "@/data/socials";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { SiteFooter } from "@/components/portfolio/SiteFooter";

const presenceQuery = queryOptions({
  queryKey: ["presence"],
  queryFn: async () => {
    const { data } = await supabase
      .from("presence")
      .select("city, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  },
  refetchInterval: 60_000,
  staleTime: 30_000,
});

const statsQuery = queryOptions({
  queryKey: codingStatsQueryKey,
  queryFn: () => getCodingStats({ data: {} }),
  staleTime: 60_000,
});

export const Route = createFileRoute("/now")({
  head: () => ({
    meta: [
      { title: "Now — What Amish is doing, live" },
      {
        name: "description",
        content:
          "Live activity across Amish Kumar's coding profiles — GitHub commits, LeetCode solves, Codeforces rating, CodeChef, GeeksforGeeks — refreshed every few minutes.",
      },
      { property: "og:title", content: "Now — Amish Kumar, live" },
      { property: "og:description", content: "Real-time coding activity across GitHub, LeetCode, Codeforces and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  component: NowPage,
});

const ONLINE_WINDOW = 15 * 60 * 1000;

function timeAgo(ts: number | string | null | undefined): string {
  if (!ts) return "—";
  const t = typeof ts === "string" ? Date.parse(ts) : ts;
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function NowPage() {
  const { data } = useSuspenseQuery(statsQuery);
  const stats = data as AllStats;

  const lastActivity = Math.max(
    stats.github?.lastActiveAt ? Date.parse(stats.github.lastActiveAt) : 0,
    stats.codeforces?.lastOnlineAt ?? 0,
    stats.leetcode?.recent?.[0]?.at ?? 0,
  );
  const online = lastActivity > 0 && Date.now() - lastActivity < ONLINE_WINDOW;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 md:px-10 pt-28 pb-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">live presence</div>
            <h1 className="serif italic text-5xl md:text-6xl mt-2">
              What I'm doing <span className="text-accent">now</span>
            </h1>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-widest ${
              online ? "border-emerald-400/40 text-emerald-500" : "border-border text-muted-foreground"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50"}`} />
            {online ? "online now" : `last active ${timeAgo(lastActivity)}`}
          </div>
        </header>

        <p className="mt-4 text-sm text-muted-foreground max-w-xl">
          Pulled live from my public profiles, refreshed every few minutes. LinkedIn and Instagram don't
          offer public live data, so those are links — everything else below is real activity.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <LocationCard />
          <GithubCard stats={stats} />
          <LeetCodeCard stats={stats} />
          <CodeforcesCard stats={stats} />
          <CodeChefCard stats={stats} />
          <GfgCard stats={stats} />
          <ProfileLinksCard />
        </div>

        <div className="mt-8 text-[11px] uppercase tracking-widest text-muted-foreground">
          fetched {timeAgo(stats.fetchedAt)} · cached 5 min
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Card({
  title,
  icon,
  url,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  url?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 24 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          {icon}
          {title}
        </div>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition">
            <ExternalLink size={13} />
          </a>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-2xl font-semibold">{value ?? "—"}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function RecentList({ items }: { items: { title: string; url: string; at: number | string }[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4 border-t border-border pt-3 space-y-1.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">recent</div>
      {items.slice(0, 4).map((e, i) => (
        <a
          key={i}
          href={e.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-baseline justify-between gap-3 text-[13px] hover:text-accent transition"
        >
          <span className="truncate">{e.title}</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(e.at)}</span>
        </a>
      ))}
    </div>
  );
}

function GithubCard({ stats }: { stats: AllStats }) {
  const g = stats.github;
  return (
    <Card title="GitHub" icon={<GitBranch size={13} />} url={g?.url} delay={0}>
      {g ? (
        <>
          <div className="flex items-center gap-3">
            {g.avatarUrl && <img src={g.avatarUrl} alt="" className="w-11 h-11 rounded-full border border-border" />}
            <div>
              <div className="font-semibold">{g.name ?? g.username}</div>
              <div className="text-[12px] text-muted-foreground">@{g.username}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="repos" value={g.publicRepos} />
            <Stat label="followers" value={g.followers} />
            <Stat label="stars" value={g.topRepos.reduce((s, r) => s + r.stars, 0)} />
          </div>
          <RecentList items={g.events.map((e) => ({ title: `${e.type} · ${e.repo}`, url: e.repoUrl, at: e.at }))} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">GitHub is rate-limited right now — check back in a few minutes.</p>
      )}
    </Card>
  );
}

function LeetCodeCard({ stats }: { stats: AllStats }) {
  const l = stats.leetcode;
  return (
    <Card title="LeetCode" icon={<Code2 size={13} />} url={l?.url} delay={0.05}>
      {l ? (
        <>
          <div className="grid grid-cols-4 gap-3">
            <Stat label="solved" value={l.totalSolved} />
            <Stat label="easy" value={l.easy} />
            <Stat label="med" value={l.medium} />
            <Stat label="hard" value={l.hard} />
          </div>
          <RecentList items={l.recent} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">LeetCode stats unavailable right now.</p>
      )}
    </Card>
  );
}

function CodeforcesCard({ stats }: { stats: AllStats }) {
  const c = stats.codeforces;
  return (
    <Card title="Codeforces" icon={<Trophy size={13} />} url={c?.url} delay={0.1}>
      {c ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="rating" value={c.rating} />
            <Stat label="rank" value={c.rank ?? "—"} />
            <Stat label="max" value={c.maxRating} />
          </div>
          <RecentList items={c.recent} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Codeforces stats unavailable right now.</p>
      )}
    </Card>
  );
}

function CodeChefCard({ stats }: { stats: AllStats }) {
  const c = stats.codechef;
  return (
    <Card title="CodeChef" icon={<Flame size={13} />} url={c?.url} delay={0.15}>
      {c ? (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="rating" value={c.rating} />
          <Stat label="stars" value={c.stars} />
          <Stat label="country rank" value={c.countryRank} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">CodeChef stats unavailable right now.</p>
      )}
    </Card>
  );
}

function GfgCard({ stats }: { stats: AllStats }) {
  const g = stats.gfg;
  return (
    <Card title="GeeksforGeeks" icon={<Activity size={13} />} url={g?.url} delay={0.2}>
      {g ? (
        <div className="grid grid-cols-2 gap-3">
          <Stat label="score" value={g.score} />
          <Stat label="problems" value={g.problems} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">GFG stats unavailable right now.</p>
      )}
    </Card>
  );
}

function ProfileLinksCard() {
  const links = SOCIALS.filter((s) => ["LinkedIn", "HackerRank", "Code360"].includes(s.name));
  return (
    <Card title="More profiles" icon={<Globe size={13} />} delay={0.25}>
      <div className="space-y-2">
        {links.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-accent/10 transition"
          >
            <span>{s.name}</span>
            <span className="text-[11px] text-muted-foreground">{s.handle} ↗</span>
          </a>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        These platforms don't expose public live feeds — links only.
      </p>
      <Link to="/links" className="mt-3 inline-block text-[11px] uppercase tracking-widest text-accent hover:underline">
        all links →
      </Link>
    </Card>
  );
}
