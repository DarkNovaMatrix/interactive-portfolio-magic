import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { SOCIALS } from "@/data/socials";
import { ThemeToggle } from "./ThemeToggle";
import { useAetherEscort } from "./Aether";


const LINKS: [string, string][] = [
  ["Home", "/"],
  ["Work", "/projects"],
  ["About", "/about"],
  ["Cosmos", "/cosmos"],
  ["Links", "/links"],
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const escort = useAetherEscort();
  const top4 = SOCIALS.filter(s => ["GitHub","LinkedIn","Twitter / X","Instagram"].includes(s.name));

  return (
    <header className="fixed top-0 inset-x-0 z-50 mix-blend-difference">
      <div className="flex items-center justify-between px-6 md:px-10 py-5 text-white">
        <Link to="/" className="serif text-2xl leading-none" onClick={(e) => escort("/", e)}>
          Amish<span className="text-accent">.</span>
        </Link>

        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-widest items-center">
          {LINKS.map(([l, h]) => (
            <Link
              key={h}
              to={h}
              onClick={(e) => escort(h, e)}
              className="hover-underline"
              activeProps={{ className: "italic" }}
              activeOptions={{ exact: true }}
            >
              {l}
            </Link>
          ))}
          <span className="h-4 w-px bg-white/40" />
          {top4.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="hover-underline" title={s.handle}>
              {s.name.split(" ")[0]}
            </a>
          ))}
          <ThemeToggle />

        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-xs uppercase tracking-widest"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden bg-ink text-paper"
          >
            <div className="flex flex-col gap-3 px-6 py-6 serif text-3xl">
              {LINKS.map(([l, h]) => (
                <Link key={h} to={h} onClick={(e) => { setOpen(false); escort(h, e); }}>{l}</Link>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 px-6 pb-6 text-sm">
              {top4.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="border border-paper/20 px-3 py-2">
                  {s.name} ↗
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
