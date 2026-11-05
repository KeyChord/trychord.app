import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/lp/home";
import { siteUrl } from "@/lib/shared";
import "@/styles/landing.css";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    links: [{ rel: "canonical", href: siteUrl }],
    meta: [{ property: "og:url", content: siteUrl }],
  }),
});
