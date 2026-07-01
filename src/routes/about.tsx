import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { SiteFooter } from "@/components/portfolio/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Amish Kumar" },
      { name: "description", content: "CS student at SRM Ramapuram. Builder of AI products. Long game: launch a company." },
      { property: "og:title", content: "About — Amish Kumar" },
      { property: "og:description", content: "The story, the stack, the ambitions." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const TIMELINE = [
  { year: "2024", title: "Started B.Tech CS at SRM Ramapuram", note: "Learning by shipping, not by syllabus." },
  { year: "2024", title: "Built OptiTask & Library System",   note: "First real end-to-end products." },
  { year: "2024", title: "SmartAid conceived",                 note: "Medical triage AI for hospitals." },
  { year: "2025", title: "Nirbhay AI concept",                 note: "Emergency response AI for Indian police." },
  { year: "2025", title: "Dravik begins",                       note: "AI travel platform — my longest bet." },
  { year: "2028", title: "Graduation & Company v1",             note: "The plan is a company, not a job hunt." },
];

const LANGS = [
  { name: "English",  level: "Fluent" },
  { name: "Hindi",    level: "Native" },
  { name: "Bengali",  level: "Native" },
  { name: "Bhojpuri", level: "Conversational" },
  { name: "French",   level: "Learning" },
];

const BEYOND = [
  "Gold medals in athletics & cricket",
  "HackerRank stars in C, Python & Java",
  "GeeksforGeeks Technical Club",
  "Computer Lab Assistant",
  "NGO volunteering & tutoring",
  "Photography interviews",
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNav />

      <main className="pt-32 pb-24 px-6 md:px-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto">
          <div className="eyebrow text-muted-foreground">§ About</div>
          <h1 className="serif text-6xl md:text-[9vw] leading-[0.9] mt-6">
            A <em className="italic">student</em><br/>
            who ships like a <em className="italic">founder</em>.
          </h1>
          <div className="mt-12 grid md:grid-cols-12 gap-10">
            <p className="md:col-span-7 text-xl md:text-2xl leading-relaxed serif">
              I'm Amish Kumar. I study Computer Science at SRM Institute of Science
              and Technology, Ramapuram — but the more accurate description is
              that I'm building AI-first products in the margins between lectures.
            </p>
            <div className="md:col-span-5 text-ink-soft leading-relaxed">
              I care about the messy middle: turning an idea into a system that
              actually runs, in front of actual users, in places where the
              stakes matter — travel, healthcare, emergency response. Long-term,
              I want to launch a company that lives at the intersection of AI,
              cybersecurity, and product design.
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="max-w-6xl mx-auto mt-32">
          <div className="flex items-baseline gap-4 mb-10">
            <span className="eyebrow text-muted-foreground">§ Timeline</span>
            <span className="flex-1 h-px bg-rule" />
          </div>
          <ol className="border-t border-ink">
            {TIMELINE.map((t, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="grid grid-cols-12 items-baseline gap-4 border-b border-ink py-8 group hover:pl-3 transition-all"
              >
                <div className="col-span-3 md:col-span-2 serif italic text-3xl md:text-4xl">{t.year}</div>
                <div className="col-span-9 md:col-span-6 serif text-2xl md:text-3xl">{t.title}</div>
                <div className="col-span-12 md:col-span-4 text-ink-soft italic">{t.note}</div>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Manifesto */}
        <section className="max-w-6xl mx-auto mt-32 border-t border-ink pt-16">
          <div className="eyebrow text-muted-foreground mb-6">§ Working principles</div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10 serif text-2xl md:text-3xl leading-tight">
            {[
              ["01", "Think in systems, not screens."],
              ["02", "Plan long. Execute in bursts."],
              ["03", "Ship uncomfortable early."],
              ["04", "Real-world impact > coursework."],
              ["05", "Design is not decoration."],
              ["06", "Every project is a rehearsal for the company."],
            ].map(([n, t]) => (
              <div key={n} className="flex gap-6">
                <span className="text-accent eyebrow pt-2">{n}</span>
                <span><em className="italic">{t}</em></span>
              </div>
            ))}
          </div>
        </section>

        {/* Languages & Beyond */}
        <section className="max-w-6xl mx-auto mt-32 grid md:grid-cols-2 gap-16">
          <div>
            <div className="eyebrow text-muted-foreground mb-6">§ Languages</div>
            <ul className="divide-y divide-rule border-y border-rule">
              {LANGS.map((l) => (
                <li key={l.name} className="flex justify-between py-4">
                  <span className="serif text-2xl">{l.name}</span>
                  <span className="text-sm italic text-ink-soft self-center">{l.level}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow text-muted-foreground mb-6">§ Beyond code</div>
            <ul className="space-y-3">
              {BEYOND.map((b) => (
                <li key={b} className="flex gap-3 serif text-xl">
                  <span className="text-accent">◆</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto mt-32 border-t border-ink pt-16 grid md:grid-cols-2 gap-10 items-end">
          <div>
            <h2 className="serif text-5xl md:text-7xl leading-none">
              Want the<br/><em className="italic">work</em>?
            </h2>
            <p className="text-ink-soft mt-4 max-w-md">
              See the projects, or jump straight to every profile.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 md:justify-end">
            <Link to="/projects" className="hover-underline serif italic text-2xl">See projects →</Link>
            <Link to="/links" className="hover-underline serif italic text-2xl">All links →</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
