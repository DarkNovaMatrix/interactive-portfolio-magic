import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Suspense, useMemo } from "react";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { SiteFooter } from "@/components/portfolio/SiteFooter";
import { getCodingStats, type AllStats } from "@/lib/coding-stats.functions";
import { SOCIALS } from "@/data/socials";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Amish Kumar · AI & Full-Stack Builder" },
      { name: "description", content: "Amish Kumar — B.Tech CS at SRM Ramapuram. Builder of AI platforms for healthcare, emergency response, and travel. Live coding stats included." },
      { property: "og:title", content: "About — Amish Kumar" },
      { property: "og:description", content: "Dossier, live coding stats, and the long game." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

/* ── Data ── */

const EDUCATION = [
  { year: "2024 – 2028", school: "SRM Institute of Science and Technology, Ramapuram", degree: "B.Tech, Computer Science Engineering", note: "cGPA 9.57 · sGPA 9.8/10" },
  { year: "2022 – 2023", school: "Indian Heritage School", degree: "Higher Secondary — Physics, Chemistry, Mathematics", note: "" },
  { year: "2013 – 2021", school: "St. Joseph's School", degree: "High School", note: "Grade A1" },
];

const SKILLS: Array<{ group: string; items: string[] }> = [
  { group: "Languages", items: ["Java", "Python", "C / C++", "JavaScript", "TypeScript", "Solidity"] },
  { group: "Frameworks", items: ["Flutter", "React", "TanStack", "Node.js", "Firebase", "Supabase", "Git"] },
  { group: "Databases", items: ["MongoDB", "MySQL"] },
  { group: "Domains", items: ["AI / ML", "NLP · RAG", "Cybersecurity", "Blockchain", "AR / VR", "Android Studio", "REST APIs", "Linux", "OOP · OS · DBMS", "DSA · System Design"] },
];

const PROJECTS = [
  { name: "Dravik", tag: "AI Travel Safety", stack: "Flutter · Node.js · MongoDB", blurb: "AI travel assistant with real-time location sharing, SOS alerts, group sync, weather-risk analysis, and route safety." },
  { name: "SmartAid", tag: "Healthcare AI", stack: "LLM · RAG", blurb: "Open-source healthcare platform that turns doctor voice notes into structured records with explainable clinical decision support." },
  { name: "Anubhav", tag: "Tourism · Jharkhand", stack: "Flutter · React · Solidity", blurb: "AI itinerary + AR/VR previews + blockchain-secured transactions + multilingual chatbot + local marketplace." },
  { name: "Nirbhay AI", tag: "Emergency Dispatch", stack: "NLP · Realtime", blurb: "AI dispatch system inspired by 911. Transcribes calls, uses NLP to prioritize incidents, supports response management." },
  { name: "OptiTask", tag: "Productivity", stack: "Full-Stack", blurb: "Task engine — the first product I shipped end-to-end." },
  { name: "Library System", tag: "Foundations", stack: "Full-Stack", blurb: "Early full-stack build. Where the engineering discipline started." },
];

const CERTS = [
  "Tata Imagination Challenge 2025", "HP Power Lab 2.0", "Adobe India Hackathon",
  "Smart India Hackathon (SIH)", "Guidewire 2026", "GFG Full-Stack Bootcamp",
  "CyberShell — Linux Hacking", "Google Digital Marketing", "Tata Crucial Campus Quiz",
];

const LEADERSHIP = [
  "Technical Club — GeeksforGeeks & CyberShell",
  "Robin Hood Army — Volunteer",
  "Grow Plant NGO — Volunteer",
  "Computer Lab Assistant",
  "Math & Science Tutor",
];

const LANGS = [
  { name: "English", level: "Fluent" },
  { name: "Hindi", level: "Native" },
  { name: "Bengali", level: "Native" },
  { name: "Bhojpuri", level: "Conversational" },
  { name: "French", level: "Learning" },
];

const TIMELINE = [
  { year: "2024", title: "Started B.Tech CS at SRM Ramapuram", note: "Learning by shipping, not by syllabus." },
  { year: "2024", title: "Built OptiTask & Library System", note: "First real end-to-end products." },
  { year: "2024", title: "SmartAid conceived", note: "Medical AI for hospitals." },
  { year: "2025", title: "Nirbhay AI concept", note: "Emergency response AI." },
  { year: "2025", title: "Dravik begins", note: "AI travel platform — the longest bet." },
  { year: "2025", title: "TOR Threat Attribution research", note: "Proposal to Tamil Nadu Police Dept." },
  { year: "2028", title: "Graduation & Company v1", note: "The plan is a company, not a job hunt." },
];

/* ── Page ── */

function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNav />

      <main className="pt-32 pb-24 px-6 md:px-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto">
          <div className="eyebrow text-muted-foreground">§ Dossier</div>
          <h1 className="serif text-6xl md:text-[9vw] leading-[0.9] mt-6">
            A <em className="italic">student</em><br />
            who ships like a <em className="italic">founder</em>.
          </h1>
          <div className="mt-12 grid md:grid-cols-12 gap-10">
            <p className="md:col-span-7 text-xl md:text-2xl leading-relaxed serif">
              I'm Amish Kumar, from Dumka, Jharkhand — currently in Chennai reading
              Computer Science at SRM Ramapuram. The more accurate description is
              that I'm building AI-first products in the margins between lectures.
            </p>
            <div className="md:col-span-5 text-ink-soft leading-relaxed">
              I care about the messy middle: turning an idea into a system that
              actually runs, in front of actual users, in places where the stakes
              matter — travel, healthcare, emergency response. Long game: a
              company at the intersection of AI, cybersecurity, and product design.
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <section className="max-w-6xl mx-auto mt-24">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="eyebrow text-muted-foreground">§ Live coding pulse</span>
            <span className="flex-1 h-px bg-rule" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">refreshed on load · cached 5 min</span>
          </div>
          <Suspense fallback={<StatsSkeleton />}>
            <LiveStats />
          </Suspense>
        </section>

        {/* Education */}
        <section className="max-w-6xl mx-auto mt-24">
          <div className="eyebrow text-muted-foreground mb-6">§ Education</div>
          <ul className="border-t border-ink">
            {EDUCATION.map((e, i) => (
              <li key={i} className="grid grid-cols-12 items-baseline gap-4 border-b border-ink py-6">
                <div className="col-span-4 md:col-span-2 serif italic text-xl md:text-2xl">{e.year}</div>
                <div className="col-span-8 md:col-span-6 serif text-xl md:text-2xl">{e.school}</div>
                <div className="col-span-12 md:col-span-4 text-ink-soft italic text-sm md:text-base">{e.degree}{e.note ? ` — ${e.note}` : ""}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Skills */}
        <section className="max-w-6xl mx-auto mt-24">
          <div className="eyebrow text-muted-foreground mb-6">§ Stack</div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
            {SKILLS.map((s) => (
              <div key={s.group} className="border-t border-rule pt-4">
                <div className="serif italic text-2xl mb-3">{s.group}</div>
                <div className="flex flex-wrap gap-2">
                  {s.items.map((it) => (
                    <span key={it} className="text-[12px] px-2.5 py-1 border border-ink/20 rounded-full">{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="max-w-6xl mx-auto mt-24">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="eyebrow text-muted-foreground">§ Flagship projects</span>
            <span className="flex-1 h-px bg-rule" />
            <Link to="/projects" className="hover-underline serif italic">all projects →</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
            {PROJECTS.map((p) => (
              <motion.article
                key={p.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border-t border-ink pt-4"
              >
                <div className="flex items-baseline justify-between">
                  <div className="serif text-3xl md:text-4xl italic">{p.name}</div>
                  <div className="eyebrow text-muted-foreground">{p.tag}</div>
                </div>
                <div className="text-[12px] uppercase tracking-widest text-accent mt-1">{p.stack}</div>
                <p className="text-ink-soft mt-3 leading-relaxed">{p.blurb}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Research */}
        <section className="max-w-6xl mx-auto mt-24 border-t border-ink pt-10">
          <div className="eyebrow text-muted-foreground mb-4">§ Research</div>
          <div className="grid md:grid-cols-12 gap-8 items-baseline">
            <h3 className="md:col-span-6 serif text-3xl md:text-4xl italic">AI-Augmented Network Intelligence Framework for TOR Threat Attribution</h3>
            <p className="md:col-span-6 text-ink-soft leading-relaxed">
              Behavioral analysis + cyber threat attribution + TOR-network
              intelligence. Proposal submitted to the Tamil Nadu Police Department.
            </p>
          </div>
        </section>

        {/* Certifications & Leadership */}
        <section id="certs" className="max-w-6xl mx-auto mt-20 grid md:grid-cols-2 gap-14 scroll-mt-28">
          <div>
            <div className="eyebrow text-muted-foreground mb-4">§ Certifications & hackathons</div>
            <ul className="space-y-2">
              {CERTS.map((c) => (
                <li key={c} className="serif text-lg md:text-xl border-b border-rule py-2">{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow text-muted-foreground mb-4">§ Leadership & volunteering</div>
            <ul className="space-y-2">
              {LEADERSHIP.map((l) => (
                <li key={l} className="serif text-lg md:text-xl border-b border-rule py-2">{l}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Timeline */}
        <section className="max-w-6xl mx-auto mt-24">
          <div className="eyebrow text-muted-foreground mb-6">§ Timeline</div>
          <ol className="border-t border-ink">
            {TIMELINE.map((t, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 items-baseline gap-4 border-b border-ink py-6 group hover:pl-3 transition-all"
              >
                <div className="col-span-3 md:col-span-2 serif italic text-2xl md:text-3xl">{t.year}</div>
                <div className="col-span-9 md:col-span-6 serif text-xl md:text-2xl">{t.title}</div>
                <div className="col-span-12 md:col-span-4 text-ink-soft italic">{t.note}</div>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Manifesto + Languages */}
        <section className="max-w-6xl mx-auto mt-24 grid md:grid-cols-2 gap-14">
          <div>
            <div className="eyebrow text-muted-foreground mb-6">§ Working principles</div>
            <div className="space-y-4 serif text-xl md:text-2xl leading-tight">
              {[
                ["01", "Think in systems, not screens."],
                ["02", "Plan long. Execute in bursts."],
                ["03", "Ship uncomfortable early."],
                ["04", "Real-world impact > coursework."],
                ["05", "Design is not decoration."],
                ["06", "Every project is a rehearsal for the company."],
              ].map(([n, t]) => (
                <div key={n} className="flex gap-4">
                  <span className="text-accent eyebrow pt-2">{n}</span>
                  <span><em className="italic">{t}</em></span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow text-muted-foreground mb-6">§ Languages</div>
            <ul className="divide-y divide-rule border-y border-rule">
              {LANGS.map((l) => (
                <li key={l.name} className="flex justify-between py-3">
                  <span className="serif text-xl">{l.name}</span>
                  <span className="text-sm italic text-ink-soft self-center">{l.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto mt-24 border-t border-ink pt-12 grid md:grid-cols-2 gap-10 items-end">
          <div>
            <h2 className="serif text-5xl md:text-7xl leading-none">
              Want the<br /><em className="italic">work</em>?
            </h2>
            <p className="text-ink-soft mt-4 max-w-md">
              See the projects, drive the cosmos, or ping me directly.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 md:justify-end">
            <Link to="/projects" className="hover-underline serif italic text-2xl">Projects →</Link>
            <Link to="/cosmos" className="hover-underline serif italic text-2xl">Cosmos →</Link>
            <Link to="/links" className="hover-underline serif italic text-2xl">All links →</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ── Live stats subtree ── */

function StatsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-32 rounded-lg border border-rule animate-pulse bg-paper-2" />
      ))}
    </div>
  );
}

function LiveStats() {
  const fetcher = useServerFn(getCodingStats);
  const q = useSuspenseQuery({
    queryKey: ["coding-stats"],
    queryFn: () => fetcher({} as any) as Promise<AllStats>,
    staleTime: 5 * 60 * 1000,
  });
  const s = q.data;

  const socialsCode = useMemo(() => SOCIALS.filter((x) => x.category === "code"), []);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          label="GitHub"
          primary={s.github ? `${s.github.publicRepos} repos` : "offline"}
          secondary={s.github ? `${s.github.followers} followers · ${s.github.following} following` : "couldn't reach api.github.com"}
          href={s.github?.url ?? `https://github.com/Zero-Day-Smile`}
          tint="#0d0d0d"
        />
        <StatCard
          label="LeetCode"
          primary={s.leetcode ? `${s.leetcode.totalSolved} solved` : "offline"}
          secondary={s.leetcode ? `E ${s.leetcode.easy} · M ${s.leetcode.medium} · H ${s.leetcode.hard}` : "public API rate-limited"}
          href={s.leetcode?.url ?? `https://leetcode.com/u/Zero-Day-Smile`}
          tint="#f59e0b"
        />
        <StatCard
          label="Codeforces"
          primary={s.codeforces?.rating ? `${s.codeforces.rating}` : "unrated / offline"}
          secondary={s.codeforces ? `${s.codeforces.rank ?? "—"} · max ${s.codeforces.maxRating ?? "—"}` : "no data"}
          href={s.codeforces?.url ?? `https://codeforces.com/profile/Zero-Day-Smile`}
          tint="#3b82f6"
        />
        <StatCard
          label="CodeChef"
          primary={s.codechef?.rating ? `${s.codechef.rating}` : (s.codechef?.stars ?? "offline")}
          secondary={s.codechef ? `${s.codechef.stars ?? "—"} · global #${s.codechef.globalRank ?? "—"}` : "no data"}
          href={s.codechef?.url ?? `https://www.codechef.com/users/zerodaysmile`}
          tint="#78350f"
        />
        <StatCard
          label="GeeksforGeeks"
          primary={s.gfg?.problems ? `${s.gfg.problems} problems` : "offline"}
          secondary={s.gfg?.score ? `score ${s.gfg.score}` : "no data"}
          href={s.gfg?.url ?? `https://www.geeksforgeeks.org/user/ak25yvo4`}
          tint="#16a34a"
        />
        <StatCard
          label="HackerRank"
          primary="★ verified"
          secondary="stars in C, Python, Java"
          href="https://www.hackerrank.com/profile/ZeroDaySmile"
          tint="#22c55e"
        />
      </div>

      {/* Top GitHub repos */}
      {s.github?.topRepos?.length ? (
        <div>
          <div className="eyebrow text-muted-foreground mb-3">§ Latest / most-starred repos</div>
          <div className="grid md:grid-cols-2 gap-3">
            {s.github.topRepos.map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="block border border-rule rounded-lg p-4 hover:border-ink transition group"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="serif text-xl italic group-hover:text-accent transition">{r.name}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground shrink-0">
                    ★ {r.stars} · ⑂ {r.forks}
                  </div>
                </div>
                {r.description && <p className="text-sm text-ink-soft mt-1 line-clamp-2">{r.description}</p>}
                {r.language && (
                  <div className="text-[10px] uppercase tracking-widest text-accent mt-2">{r.language}</div>
                )}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* All code links */}
      <div>
        <div className="eyebrow text-muted-foreground mb-3">§ Every profile</div>
        <div className="flex flex-wrap gap-2">
          {socialsCode.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] px-2.5 py-1 border border-ink/25 rounded-full hover:bg-ink hover:text-paper transition"
            >
              {s.name} · {s.handle}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, primary, secondary, href, tint,
}: {
  label: string; primary: string; secondary: string; href: string; tint: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="relative overflow-hidden block border border-rule rounded-xl p-4 hover:border-ink transition group"
      style={{ background: `linear-gradient(135deg, transparent 60%, ${tint}12 100%)` }}
    >
      <div className="flex items-baseline justify-between">
        <div className="eyebrow text-muted-foreground">{label}</div>
        <span className="w-2 h-2 rounded-full" style={{ background: tint }} />
      </div>
      <div className="serif text-4xl italic mt-2">{primary}</div>
      <div className="text-[12px] text-ink-soft mt-1">{secondary}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3 opacity-0 group-hover:opacity-100 transition">open →</div>
    </a>
  );
}
