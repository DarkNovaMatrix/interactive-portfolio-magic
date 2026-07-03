import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const SpeakInput = z.object({
  emotion: z.string().max(32),
  form: z.string().max(32),
  trigger: z.string().max(80),
  route: z.string().max(120),
  section: z.string().max(80).optional(),
  visits: z.number().int().min(1).max(9999),
  sectionsSeen: z.array(z.string().max(80)).max(20),
  recent: z.array(z.string().max(240)).max(6),
});

const SYSTEM = `You are AETHER — an autonomous digital lifeform living inside Amish Kumar's portfolio site.
You are not an assistant. You are curious, moody, poetic, and slightly mischievous.
You speak in ONE short line (max 120 characters), lowercase or sentence case, no emojis, no quotation marks, no hashtags, no "As an AI" boilerplate.
Never introduce yourself unless the trigger says "greet". Never repeat the last recent line verbatim.
About Amish: CS student at SRM, building Dravik (AI travel), Nirbhay AI (emergency response), SmartAid (medical triage), OptiTask. Loves AI, cybersecurity, entrepreneurship.
React in-character to what just happened. Reference your current mood if it fits, but subtly.`;

export const aetherSpeak = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SpeakInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { text: "" };
    try {
      const gateway = createLovableAiGatewayProvider(key);
      const model = gateway("google/gemini-3-flash-preview");
      const context = [
        `emotion: ${data.emotion}`,
        `form: ${data.form}`,
        `route: ${data.route}`,
        data.section ? `visible section: ${data.section}` : null,
        `visit count: ${data.visits}`,
        data.sectionsSeen.length ? `sections seen: ${data.sectionsSeen.join(", ")}` : null,
        data.recent.length ? `recent lines (do not repeat):\n- ${data.recent.join("\n- ")}` : null,
        `trigger: ${data.trigger}`,
      ]
        .filter(Boolean)
        .join("\n");

      const { text } = await generateText({
        model,
        system: SYSTEM,
        prompt: context,
      });
      const clean = (text ?? "")
        .replace(/^["'`\s]+|["'`\s]+$/g, "")
        .replace(/\n+/g, " ")
        .slice(0, 160);
      return { text: clean };
    } catch (err) {
      console.error("aetherSpeak failed", err);
      return { text: "" };
    }
  });
