import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

// ---------- Data ----------
const PROJECTS = [
  {
    id: "01",
    title: "Dravik",
    tag: "AI Travel Platform",
    year: "2025 — Now",
    blurb:
      "An intelligent travel ecosystem — AI itineraries, budget planning, and a travel assistant that learns how you move.",
    stack: ["Flutter", "Node.js", "AI/ML", "Figma"],
    accent: "from-[#c9805a] to-[#8a4a2a]",
  },
  {
    id: "02",
    title: "Nirbhay AI",
    tag: "Emergency Response AI",
    year: "2025",
    blurb:
      "A government-focused AI emergency call assistant designed for Indian police forces. Long-term goal: national deployment.",
    stack: ["Python", "NLP", "Realtime", "Voice"],
    accent: "from-[#2d2d2d] to-[#0d0d0d]",
  },
  {
    id: "03",
    title: "SmartAid",
    tag: "Medical Emergency AI",
    year: "2024",
    blurb:
      "AI-driven medical emergency reporting for hospitals and first responders — cutting response friction to seconds.",
    stack: ["Python", "Java", "APIs"],
    accent: "from-[#6b7a4a] to-[#3a4a2a]",
  },
  {
    id: "04",
    title: "OptiTask",
    tag: "Tasks & Budget",
    year: "2024",
    blurb:
      "A productivity app pairing task management with lightweight budgeting. Built end-to-end with a focus on clarity.",
    stack: ["Flutter", "SQLite"],
    accent: "from-[#8a7a5a] to-[#4a3a2a]",
  },
];

const SKILLS = [
  { group: "Languages", items: ["C", "Python", "Java"] },
  { group: "Frontend", items: ["React", "Flutter", "Tailwind"] },
  { group: "Backend", items: ["Node.js", "REST APIs", "Databases"] },
  { group: "Design & Tools", items: ["Figma", "Git", "Linux", "VS Code"] },
  { group: "Focus Areas", items: ["AI / ML", "Cybersecurity", "Data Science", "Product"] },
];

const BOTS = [
  {
    name: "Ravi",
    role: "Travel Concierge",
    desc: "Plans itineraries, negotiates budget, and remembers how you like to travel.",
    project: "Dravik",
  },
  {
    name: "Nirbhay",
    role: "Emergency Dispatcher",
    desc: "Handles distress calls, extracts location, and routes to nearest units.",
    project: "Nirbhay AI",
  },
  {
    name: "Aid",
    role: "Medical Triage",
    desc: "Classifies severity, notifies hospitals, and preps intake paperwork.",
    project: "SmartAid",
  },
];

// ---------- Cursor ----------
function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 350, damping: 30, mass: 0.4 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement;
      setHovering(!!t.closest("a, button, [data-hover]"));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        animate={{ scale: hovering ? 2.2 : 1, opacity: hovering ? 0.15 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="-translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-ink"
      />
    </motion.div>
  );
}

// ---------- Nav ----------
function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Work", "#work"],
    ["About", "#about"],
    ["Skills", "#skills"],
    ["Bots", "#bots"],
    ["Contact", "#contact"],
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50 mix-blend-difference">
      <div className="flex items-center justify-between px-6 md:px-10 py-5 text-paper">
        <a href="#top" className="serif text-2xl leading-none">
          Amish<span className="text-accent">.</span>
        </a>
        <nav className="hidden md:flex gap-8 text-sm">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="hover-underline uppercase tracking-widest text-xs">
              {label}
            </a>
          ))}
        </nav>
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-xs uppercase tracking-widest"
          aria-label="Toggle menu"
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
            <div className="flex flex-col gap-4 px-6 py-6 serif text-3xl">
              {links.map(([label, href]) => (
                <a key={href} href={href} onClick={() => setOpen(false)}>
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ---------- Hero ----------
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="grain relative min-h-[100svh] flex flex-col justify-between px-6 md:px-10 pt-32 pb-10 overflow-hidden"
    >
      {/* rulebook grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-ink) 1px, transparent 1px), linear-gradient(to bottom, var(--color-ink) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <motion.div style={{ y, opacity }} className="relative">
        <div className="flex items-baseline gap-4 mb-8">
          <span className="eyebrow text-muted-foreground">№ 001 — Portfolio, 2026 Edition</span>
          <span className="flex-1 h-px bg-rule" />
          <span className="eyebrow text-muted-foreground hidden md:inline">Ramapuram · IN</span>
        </div>

        <h1 className="serif leading-[0.9] tracking-tight text-[15vw] md:text-[11vw]">
          <span className="block">
            <ItalicWord>Amish</ItalicWord> Kumar
          </span>
          <span className="block text-outline">Builds things</span>
          <span className="block">
            that <em className="italic">think</em>.
          </span>
        </h1>

        <div className="mt-10 grid md:grid-cols-3 gap-8 max-w-6xl">
          <div className="md:col-span-2">
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl">
              CS undergraduate at <u>SRM Ramapuram</u> (2024–2028). I build AI-first
              products with real-world weight — travel, emergency response, medical
              triage — and I'm slowly building a company around them.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <div className="eyebrow text-muted-foreground">Currently</div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-sm">Building <em className="italic serif">Dravik</em></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Marquee */}
      <div className="relative mt-16 border-y border-rule overflow-hidden">
        <div className="marquee flex whitespace-nowrap py-4 serif text-4xl md:text-6xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-10 pr-10">
              <span>AI / ML</span><Dot />
              <span className="italic">Product Design</span><Dot />
              <span>Cybersecurity</span><Dot />
              <span className="italic">Founder-in-Progress</span><Dot />
              <span>Full-Stack</span><Dot />
              <span className="italic">Ambitious Systems</span><Dot />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ItalicWord({ children }: { children: React.ReactNode }) {
  return <span className="italic font-normal">{children}</span>;
}

function Dot() {
  return <span className="inline-block h-3 w-3 rounded-full bg-accent" />;
}

// ---------- About ----------
function About() {
  return (
    <section id="about" className="px-6 md:px-10 py-24 md:py-40 border-t border-rule">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-3">
          <div className="eyebrow text-muted-foreground sticky top-32">§ 01 — About</div>
        </div>
        <div className="md:col-span-9">
          <Reveal>
            <h2 className="serif text-4xl md:text-7xl leading-[1.05] mb-10">
              I like the messy part <em className="italic">between</em> an
              idea and a product that <em className="italic">ships</em>.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-10 text-base md:text-lg leading-relaxed">
            <Reveal delay={0.05}>
              <p>
                I think in systems, not screens. I plan long, execute in bursts,
                and try to design software that doesn't feel like software —
                especially in high-stakes places like travel, healthcare, and
                emergency response.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p>
                Outside of code: gold-medal athletics and cricket, five languages
                — English, Hindi, Bengali, Bhojpuri, French — and a stubborn
                belief that student projects can be startup-ready.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-rule pt-10">
            {[
              ["2024–28", "B.Tech CS, SRM"],
              ["3+", "Ambitious products"],
              ["5", "Languages spoken"],
              ["∞", "Ideas in the queue"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="serif text-4xl md:text-5xl">{n}</div>
                <div className="eyebrow text-muted-foreground mt-2">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Reveal helper ----------
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ---------- Work ----------
function Work() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section id="work" className="px-6 md:px-10 py-24 md:py-40 border-t border-rule bg-paper-2/40">
      <div className="grid md:grid-cols-12 gap-10 mb-16">
        <div className="md:col-span-3">
          <div className="eyebrow text-muted-foreground sticky top-32">§ 02 — Selected Work</div>
        </div>
        <div className="md:col-span-9">
          <h2 className="serif text-5xl md:text-7xl leading-none">
            Four <em className="italic">projects</em>,<br />
            one long <em className="italic">obsession</em>.
          </h2>
        </div>
      </div>

      <div className="border-t border-ink">
        {PROJECTS.map((p) => (
          <ProjectRow key={p.id} p={p} active={active === p.id} onEnter={() => setActive(p.id)} onLeave={() => setActive(null)} />
        ))}
      </div>
    </section>
  );
}

function ProjectRow({
  p,
  active,
  onEnter,
  onLeave,
}: {
  p: (typeof PROJECTS)[number];
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      data-hover
      onHoverStart={onEnter}
      onHoverEnd={onLeave}
      className="group relative border-b border-ink"
    >
      <motion.div
        initial={false}
        animate={{ height: active ? "auto" : 0 }}
        className="overflow-hidden"
      >
        <div className={`h-[280px] w-full bg-gradient-to-br ${p.accent} relative`}>
          <div className="absolute inset-0 grain" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-paper">
            <div className="serif text-4xl md:text-6xl italic">{p.title}</div>
            <div className="eyebrow opacity-80">{p.year}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 items-center py-6 md:py-8 px-1 gap-4">
        <div className="col-span-2 md:col-span-1 eyebrow text-muted-foreground">{p.id}</div>
        <div className="col-span-10 md:col-span-4">
          <motion.div
            className="serif text-3xl md:text-5xl leading-none"
            animate={{ x: active ? 12 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {p.title}
          </motion.div>
        </div>
        <div className="hidden md:block md:col-span-3 text-sm text-ink-soft">{p.tag}</div>
        <div className="col-span-12 md:col-span-3 flex flex-wrap gap-2">
          {p.stack.map((s) => (
            <span key={s} className="text-xs border border-rule rounded-full px-3 py-1">
              {s}
            </span>
          ))}
        </div>
        <div className="hidden md:flex md:col-span-1 justify-end">
          <motion.span
            animate={{ rotate: active ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="serif text-3xl"
          >
            +
          </motion.span>
        </div>
        <p className="col-span-12 text-ink-soft max-w-3xl md:hidden text-sm">{p.blurb}</p>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="hidden md:block overflow-hidden"
          >
            <p className="pb-8 pl-[calc(1/12*100%)] pr-6 max-w-3xl text-ink-soft leading-relaxed">
              {p.blurb}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------- Skills ----------
function Skills() {
  return (
    <section id="skills" className="px-6 md:px-10 py-24 md:py-40 border-t border-rule">
      <div className="grid md:grid-cols-12 gap-10 mb-16">
        <div className="md:col-span-3">
          <div className="eyebrow text-muted-foreground sticky top-32">§ 03 — Toolkit</div>
        </div>
        <div className="md:col-span-9">
          <h2 className="serif text-5xl md:text-7xl leading-none">
            The <em className="italic">stack</em> behind the work.
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-px bg-rule border border-rule">
        {SKILLS.map((s, i) => (
          <Reveal key={s.group} delay={i * 0.05}>
            <div className="bg-paper p-6 h-full min-h-[220px] flex flex-col justify-between">
              <div className="eyebrow text-muted-foreground">{s.group}</div>
              <ul className="mt-6 space-y-2 serif text-2xl leading-tight">
                {s.items.map((it) => (
                  <li key={it} className="hover:italic transition-all duration-300 cursor-default">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ---------- Bots ----------
function Bots() {
  const [active, setActive] = useState(0);
  const bot = BOTS[active];
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: "you" | "bot"; text: string }[]>([]);

  useEffect(() => {
    setChat([
      { from: "bot", text: `Hi — I'm ${bot.name}. ${bot.desc}` },
    ]);
  }, [active, bot.name, bot.desc]);

  function send() {
    if (!msg.trim()) return;
    const you = msg.trim();
    setChat((c) => [...c, { from: "you", text: you }]);
    setMsg("");
    setTimeout(() => {
      setChat((c) => [
        ...c,
        {
          from: "bot",
          text: canned(bot.name, you),
        },
      ]);
    }, 500);
  }

  return (
    <section id="bots" className="px-6 md:px-10 py-24 md:py-40 border-t border-rule bg-ink text-paper">
      <div className="grid md:grid-cols-12 gap-10 mb-16">
        <div className="md:col-span-3">
          <div className="eyebrow opacity-60 sticky top-32">§ 04 — Agents & Bots</div>
        </div>
        <div className="md:col-span-9">
          <h2 className="serif text-5xl md:text-7xl leading-none">
            Small <em className="italic">minds</em><br />I've been building.
          </h2>
          <p className="mt-6 text-paper/70 max-w-xl">
            Prototype conversational agents that live inside my products. Try one.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-2">
          {BOTS.map((b, i) => (
            <button
              key={b.name}
              onClick={() => setActive(i)}
              className={`w-full text-left p-5 border transition-all ${
                i === active
                  ? "border-paper bg-paper text-ink"
                  : "border-paper/20 hover:border-paper/60"
              }`}
            >
              <div className="serif text-3xl italic">{b.name}</div>
              <div className="eyebrow mt-1 opacity-70">{b.role}</div>
              <div className="text-xs mt-3 opacity-60">from {b.project}</div>
            </button>
          ))}
        </div>

        <div className="md:col-span-8 border border-paper/20 flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between border-b border-paper/20 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="eyebrow">chat with {bot.name}</span>
            </div>
            <span className="text-xs opacity-60">demo · not connected</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence initial={false}>
              {chat.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 text-sm leading-relaxed ${
                      m.from === "you"
                        ? "bg-paper text-ink"
                        : "border border-paper/30"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-paper/20 flex"
          >
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={`Ask ${bot.name} something…`}
              className="flex-1 bg-transparent px-5 py-4 outline-none placeholder:text-paper/40 text-sm"
            />
            <button type="submit" className="px-6 border-l border-paper/20 hover:bg-paper hover:text-ink transition-colors eyebrow">
              Send →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function canned(name: string, q: string) {
  const l = q.toLowerCase();
  if (l.includes("hello") || l.includes("hi")) return `Hey — ${name} here. What are we solving?`;
  if (name === "Ravi")
    return "Give me a city and a budget — I'll draft a 3-day plan you can actually afford.";
  if (name === "Nirbhay")
    return "Copy that. Sharing your location with the nearest response unit now.";
  if (name === "Aid")
    return "Noted symptoms. Priority triage: yellow. Notifying nearest ER.";
  return "Interesting — that's outside my demo scope, but I'd love to be trained on it.";
}

// ---------- Contact ----------
function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", msg: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    // opens mail client as fallback
    const body = encodeURIComponent(`${form.msg}\n\n— ${form.name}`);
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name}`);
    window.location.href = `mailto:hello@amishkumar.dev?subject=${subject}&body=${body}`;
  }

  return (
    <section id="contact" className="px-6 md:px-10 py-24 md:py-40 border-t border-rule">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-3">
          <div className="eyebrow text-muted-foreground sticky top-32">§ 05 — Contact</div>
        </div>
        <div className="md:col-span-9">
          <h2 className="serif text-6xl md:text-[9vw] leading-[0.9]">
            Let's build<br />
            <em className="italic">something</em>
            <span className="caret ml-2">_</span>
          </h2>

          <div className="mt-16 grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-lg leading-relaxed max-w-md">
                I'm open to internships, collaborations on AI products, and
                conversations about ambitious ideas. Reach out — I read
                everything.
              </p>
              <div className="mt-10 space-y-4">
                {[
                  ["Email", "hello@amishkumar.dev"],
                  ["Location", "Ramapuram, Chennai · IN"],
                  ["Availability", "Summer 2026 internships"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-rule pb-3">
                    <span className="eyebrow text-muted-foreground">{k}</span>
                    <span className="text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Message" textarea value={form.msg} onChange={(v) => setForm({ ...form, msg: v })} />
              <motion.button
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                className="serif text-3xl italic inline-flex items-center gap-3"
                type="submit"
              >
                {sent ? "Thank you —" : "Send message"}
                <span>→</span>
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="mt-2 w-full bg-transparent border-b border-ink outline-none py-2 focus:border-accent transition-colors resize-none serif text-xl"
          required
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full bg-transparent border-b border-ink outline-none py-2 focus:border-accent transition-colors serif text-xl"
          required
        />
      )}
    </label>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="border-t border-rule px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
      <div className="eyebrow">© 2026 · Amish Kumar</div>
      <div className="serif italic text-lg">Set in Instrument Serif & Work Sans.</div>
      <div className="flex gap-6 eyebrow">
        <a href="#top" className="hover-underline">Back to top ↑</a>
      </div>
    </footer>
  );
}

// ---------- Page ----------
export default function Portfolio() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-ink selection:text-paper">
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <About />
        <Work />
        <Skills />
        <Bots />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
