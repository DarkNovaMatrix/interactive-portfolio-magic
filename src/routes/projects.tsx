import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { codingStatsQueryKey, getCodingStats, type AllStats } from "@/lib/coding-stats.functions";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { SiteFooter } from "@/components/portfolio/SiteFooter";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Amish Kumar" },
      { name: "description", content: "Dravik, Nirbhay AI, SmartAid, OptiTask — a closer look at the work." },
      { property: "og:title", content: "Projects — Amish Kumar" },
      { property: "og:description", content: "AI travel, emergency response AI, medical triage, and productivity tools." },
      { property: "og:url", content: "/projects" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsStatsQuery),
  component: ProjectsPage,
});

const projectsStatsQuery = queryOptions({
  queryKey: codingStatsQueryKey,
  queryFn: (): Promise<AllStats> => getCodingStats({ data: {} }),
  staleTime: 5 * 60 * 1000,
});

const PROJECTS = [
  {
    id: "01",
    title: "Dravik",
    tag: "AI Travel Platform · 2025 — Now",
    role: "Founder / Design / Engineering",
    summary:
      "Not a booking app — an intelligent travel ecosystem. AI itineraries, budget planning, personalised recommendations, and a travel assistant that learns how you move.",
    highlights: [
      "AI-generated multi-day itineraries with budget guardrails",
      "Modular architecture for future travel modules (visa, food, safety)",
      "Flutter mobile client, Node backend, ML services",
    ],
    stack: ["Flutter", "Node.js", "AI/ML", "Figma"],
    tint: "from-[#c9805a] to-[#8a4a2a]",
  },
  {
    id: "02",
    title: "Nirbhay AI",
    tag: "Emergency Response · 2025",
    role: "Concept / Engineering",
    summary:
      "A government-focused AI emergency call assistant designed for Indian police. The long game: deploy nationally, cutting distress-call response times in half.",
    highlights: [
      "Voice-first NLP tuned for regional Indian languages",
      "Auto location extraction & nearest-unit routing",
      "Designed for pilot with a state police department",
    ],
    stack: ["Python", "NLP", "Realtime", "Voice"],
    tint: "from-[#2d2d2d] to-[#0d0d0d]",
  },
  {
    id: "03",
    title: "SmartAid",
    tag: "Medical Triage · 2024",
    role: "Engineering / Product",
    summary:
      "AI-driven medical emergency reporting for hospitals and first responders. Turns a chaotic call into a structured, prioritised intake before the ambulance arrives.",
    highlights: [
      "Severity classification with a lightweight ML model",
      "Auto-notification to nearest hospitals",
      "Pre-fills ER intake forms from the call",
    ],
    stack: ["Python", "Java", "APIs"],
    tint: "from-[#6b7a4a] to-[#3a4a2a]",
  },
  {
    id: "04",
    title: "OptiTask",
    tag: "Productivity · 2024",
    role: "Solo Build",
    summary:
      "A quiet productivity app that pairs task management with lightweight budgeting. Built end-to-end as an exercise in shipping clarity, not features.",
    highlights: [
      "Offline-first with local persistence",
      "Weekly budget rollovers with visual pacing",
      "Zero-config onboarding",
    ],
    stack: ["Flutter", "SQLite"],
    tint: "from-[#8a7a5a] to-[#4a3a2a]",
  },
  {
    id: "05",
    title: "Library Management System",
    tag: "Coursework — Extended · 2024",
    role: "Solo Build",
    summary:
      "Started as coursework, ended as a real internal tool: role-based accounts, fine calculation, and a search that actually finds books.",
    highlights: ["Role-based auth", "Search with fuzzy matching", "Admin reporting"],
    stack: ["Java", "SQL"],
    tint: "from-[#556677] to-[#2a3a4a]",
  },
];

function ProjectsPage() {
  const { data } = useSuspenseQuery(projectsStatsQuery);
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNav />
      <main className="pt-32 pb-24 px-6 md:px-10">
        <header className="max-w-6xl mx-auto mb-24">
          <div className="eyebrow text-muted-foreground">§ Archive — Work</div>
          <h1 className="serif text-6xl md:text-[9vw] leading-[0.9] mt-6">
            Five things<br/>I <em className="italic">actually</em> built.
          </h1>
          <p className="mt-8 text-lg text-ink-soft max-w-2xl">
            None of these are demos. Each one solves a specific problem I got obsessed with — and each one is still being sharpened.
          </p>
        </header>

        <div className="max-w-6xl mx-auto space-y-32">
          {PROJECTS.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-12 gap-8"
            >
              <div className="md:col-span-5">
                <div className={`aspect-[4/5] relative grain bg-gradient-to-br ${p.tint} text-[#f5f3ee] flex flex-col justify-between p-8 sticky top-32`}>
                  <div className="eyebrow opacity-70">{p.id}</div>
                  <div>
                    <div className="serif italic text-6xl md:text-7xl leading-none">{p.title}</div>
                    <div className="eyebrow mt-4 opacity-70">{p.tag}</div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 md:pt-8">
                <div className="eyebrow text-muted-foreground">Role</div>
                <div className="serif text-2xl mb-8">{p.role}</div>

                <p className="serif text-3xl md:text-4xl leading-[1.15] mb-10">{p.summary}</p>

                <div className="eyebrow text-muted-foreground mb-4">Highlights</div>
                <ul className="space-y-3 mb-10">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-lg leading-relaxed">
                      <span className="text-accent shrink-0">◆</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="text-xs border border-ink rounded-full px-3 py-1">{s}</span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <section className="max-w-6xl mx-auto mt-28 border-t border-ink pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow text-muted-foreground">Live from GitHub</div>
              <h2 className="serif mt-3 text-4xl md:text-5xl">Recently updated repositories.</h2>
            </div>
            <a href={`https://github.com/${data.github?.username ?? "Zero-Day-Smile"}`} target="_blank" rel="noreferrer" className="hover-underline text-sm">
              All repositories ↗
            </a>
          </div>
          {data.github?.recentRepos.length ? (
            <ul className="mt-8 grid gap-x-10 md:grid-cols-2">
              {data.github.recentRepos.map((repo, index) => (
                <li key={repo.url} className="border-t border-border">
                  <a href={repo.url} target="_blank" rel="noreferrer" className="group block py-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="serif text-2xl group-hover:text-accent transition-colors">{repo.name}</span>
                      <span className="eyebrow text-muted-foreground">{index + 1} · {new Date(repo.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{repo.description || "Public repository"}</p>
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                      {repo.language && <span>{repo.language}</span>}
                      <span>★ {repo.stars}</span>
                      <span>⑂ {repo.forks}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 border-t border-border py-5 text-sm text-muted-foreground">Public repository data is temporarily unavailable.</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Repository names, descriptions, and links are read from the public GitHub profile when this page refreshes.</p>
        </section>

        <div className="max-w-6xl mx-auto mt-32 border-t border-ink pt-10 flex flex-wrap items-baseline justify-between gap-6">
          <div className="serif text-4xl md:text-5xl">Curious what's next?</div>
          <Link to="/links" className="hover-underline serif italic text-2xl">
            Follow me across the internet →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
