import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SOCIALS } from "@/data/socials";

const NAV = [
  ["Home", "/"],
  ["About", "/about"],
  ["Projects", "/projects"],
  ["Links", "/links"],
];

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-ink text-paper">
      <div className="px-6 md:px-10 py-20 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="serif text-5xl md:text-7xl leading-none">
            Let's <em className="italic">talk</em>.
          </div>
          <a href="mailto:hello@amishkumar.dev" className="mt-6 inline-block hover-underline serif text-2xl italic">
            hello@amishkumar.dev →
          </a>
        </div>

        <div className="md:col-span-3">
          <div className="eyebrow opacity-60 mb-4">Navigate</div>
          <ul className="space-y-2 serif text-2xl">
            {NAV.map(([l, h]) => (
              <li key={h}>
                <Link to={h} className="hover-underline">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="eyebrow opacity-60 mb-4">Elsewhere</div>
          <ul className="grid grid-cols-2 gap-y-2 text-sm">
            {SOCIALS.filter(s => s.category !== "contact").slice(0, 10).map((s) => (
              <li key={s.name}>
                <motion.a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ x: 4 }}
                  className="inline-flex items-center gap-2 hover-underline"
                >
                  <span>{s.name}</span>
                  <span className="opacity-40">↗</span>
                </motion.a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs opacity-70">
        <div className="eyebrow">© 2026 · Amish Kumar</div>
        <div className="serif italic text-base">Set in Instrument Serif & Work Sans.</div>
        <a href="#top" className="hover-underline eyebrow">Back to top ↑</a>
      </div>
    </footer>
  );
}
