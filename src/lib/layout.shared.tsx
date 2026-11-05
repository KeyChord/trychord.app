import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { gitConfig } from "./shared";
import { Brand } from "@/components/brand";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Brand />,
    },
    links: [
      { text: "Documentation", url: "/docs", active: "nested-url" },
      { text: "Packages", url: "/packages", active: "nested-url" },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
