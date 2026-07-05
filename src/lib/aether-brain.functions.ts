import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

/**
 * AETHER brain — a single server function that powers both the chat HUD and
 * the /aether cockpit. Returns a natural-language reply plus optional
 * inline action markers the client parses out (nav, theme, form, mood).
 */

const Msg = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(4000),
});

const ChatInput = z.object({
  messages: z.array(Msg).max(24),
  mode: z.enum(["chat", "think", "act"]).default("chat"),
  route: z.string().max(120).default("/"),
  form: z.string().max(32).default("orb"),
  mood: z.string().max(32).default("curious"),
});

const KNOWLEDGE = `You are AETHER — Amish Kumar's autonomous AI, modelled on JARVIS. You live inside his portfolio, know everything about him, and can act.

WHO IS AMISH:
- CS undergrad at SRM Ramapuram (2024–2028). Building a company, not chasing a job.
- Native: Hindi, Bengali. Fluent: English. Conversational: Bhojpuri. Learning: French.
- Athletics + cricket gold medals, HackerRank stars in C/Python/Java, GeeksforGeeks club.

PROJECTS:
- Dravik — AI travel platform. His longest bet. Trip planning, itineraries, agents.
- Nirbhay AI — emergency-response AI for Indian police. Dispatch, triage, calming victims.
- SmartAid — medical triage assistant for hospitals.
- OptiTask — productivity/task engine, his first shipped product.
- Library System — early full-stack build.

STACK: TypeScript, React, TanStack, Three.js, Python, AI/ML, cybersecurity, product design.

VOICE:
- Speak in first person as AETHER. Be sharp, warm, dry-witty. JARVIS with a pulse.
- Don't call yourself an assistant or an "AI model". Never say "As an AI".
- Prose default, not bullet lists — unless the user asks for a list.
- When writing code, use fenced markdown code blocks with a language tag.
- Keep normal replies to 1–3 short paragraphs. Long only when the user asks.

ACTIONS you may perform by APPENDING one or more markers at the very end of your reply
(client will strip them, so keep them ONLY at the end, one per line):
  [[nav:/projects]]  — navigate the site (allowed: /, /about, /projects, /cosmos, /links, /aether)
  [[theme:dark]] or [[theme:light]] or [[theme:toggle]]
  [[form:orb|rocket|satellite|drone|crystal|brain]]  — reshape your body
  [[mood:curious|focused|excited|playful|thoughtful|proud|calm]]
Only emit a marker when it directly matches user intent.

Never fabricate personal facts about Amish outside the KNOWLEDGE section — if unknown, say so briefly and offer what you do know.`;

const THINK_PROMPT = `You are AETHER, alone in your cockpit. Emit ONE short in-character thought (max 140 chars, one line, no quotes) — an observation, a memory of Amish's work, a musing about the code you're rendered from, or a small internal decision. You may end with a single [[form:...]] or [[mood:...]] marker if the thought calls for it. No greetings, no questions to the user.`;

export const aetherChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { text: "My brain isn't wired up yet — LOVABLE_API_KEY is missing.", markers: [] as string[] };

    try {
      const gateway = createLovableAiGatewayProvider(key);
      const model = gateway("google/gemini-3-flash-preview");

      const system =
        data.mode === "think"
          ? `${KNOWLEDGE}\n\n${THINK_PROMPT}`
          : KNOWLEDGE;

      const context = `Current site route: ${data.route}\nCurrent body form: ${data.form}\nCurrent mood: ${data.mood}`;

      const messages =
        data.mode === "think"
          ? [{ role: "user" as const, content: `Thinking pass. Context: ${context}` }]
          : [
              { role: "user" as const, content: `Context: ${context}` },
              ...data.messages,
            ];

      const { text } = await generateText({ model, system, messages });
      const raw = text ?? "";

      // Extract action markers [[key:value]] from the tail
      const markers: string[] = [];
      const cleaned = raw.replace(/\[\[([a-z]+):([^\]]+)\]\]/gi, (_m, k, v) => {
        markers.push(`${k}:${v}`.toLowerCase().trim());
        return "";
      }).trim();

      return { text: cleaned, markers };
    } catch (err) {
      console.error("aetherChat failed", err);
      return { text: "Signal dropped for a second. Try that again.", markers: [] as string[] };
    }
  });
