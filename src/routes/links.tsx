import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { SiteFooter } from "@/components/portfolio/SiteFooter";
import { SOCIALS, type Social } from "@/data/socials";

export const Route = createFileRoute("/links")({
  head: () => ({
    meta: [
      { title: "Links — Amish Kumar" },
      { name: "description", content: "GitHub, LeetCode, LinkedIn, Twitter, Instagram — every place to find Amish Kumar online." },
      { property: "og:title", content: "Links — Amish Kumar" },
      { property: "og:description", content: "All my profiles: code, professional, social." },
      { property: "og:url", content: "/links" },
    ],
    links: [{ rel: "canonical", href: "/links" }],
  }),
  component: LinksPage,
});

const GROUPS: { key: Social["category"]; title: string; caption: string }[] = [
  { key: "code",         title: "Code",         caption: "Where I ship, solve, and break things." },
  { key: "professional", title: "Professional", caption: "The formal handshake." },
  { key: "social",       title: "Social",       caption: "The unfiltered version." },
  { key: "contact",      title: "Direct",       caption: "The fastest way to reach me." },
];

function LinksPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNav />
      <main className="pt-32 pb-24 px-6 md:px-10">
        <header className="max-w-5xl mx-auto text-center mb-20">
          <div className="eyebrow text-muted-foreground">§ Index — Elsewhere</div>
          <h1 className="serif text-6xl md:text-[10vw] leading-[0.9] mt-6">
            All my <em className="italic">rooms</em><br/>on the internet.
          </h1>
          <p className="mt-8 text-lg text-ink-soft max-w-xl mx-auto">
            Pick a door. Every profile below is a version of me — some polished, some not.
          </p>
        </header>

        <div className="max-w-5xl mx-auto space-y-16">
          {GROUPS.map((g) => {
            const items = SOCIALS.filter(s => s.category === g.key);
            if (!items.length) return null;
            return (
              <section key={g.key}>
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="eyebrow text-muted-foreground">{g.title}</span>
                  <span className="flex-1 h-px bg-rule" />
                  <span className="text-sm italic serif text-ink-soft">{g.caption}</span>
                </div>
                <ul className="border-t border-ink">
                  {items.map((s, i) => (
                    <motion.li
                      key={s.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-ink group"
                    >
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        data-hover
                        className="flex items-center justify-between py-6 md:py-8 gap-6 transition-all duration-500 hover:pl-4 hover:bg-paper-2"
                      >
                        <div className="flex items-baseline gap-6 min-w-0">
                          <span className="eyebrow text-muted-foreground w-8">0{i + 1}</span>
                          <span className="serif text-3xl md:text-5xl truncate">{s.name}</span>
                        </div>
                        <div className="hidden md:block text-sm text-ink-soft italic">{s.handle}</div>
                        <motion.span
                          className="serif text-3xl md:text-5xl shrink-0"
                          initial={{ x: 0 }}
                          whileHover={{ x: 8, rotate: -12 }}
                        >
                          ↗
                        </motion.span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
