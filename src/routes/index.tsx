import { createFileRoute } from "@tanstack/react-router";
import Portfolio from "@/components/portfolio/Portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amish Kumar — AI, Product & Systems Engineering" },
      { name: "description", content: "Amish Kumar builds AI-first products for travel, healthcare, and emergency response. Explore selected work, technical interests, and live coding activity." },
      { property: "og:title", content: "Amish Kumar — AI, Product & Systems Engineering" },
      { property: "og:description", content: "Selected products, engineering work, and the ideas behind them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Portfolio,
});
