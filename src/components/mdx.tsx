import defaultMdxComponents from "fumadocs-ui/mdx";
import { ArrowBigUpDash, Space } from "lucide-react";
import type { MDXComponents } from "mdx/types";

const KEY_ICONS = new Map([
  ["⇪", { icon: ArrowBigUpDash, label: "Caps Lock" }],
  ["␣", { icon: Space, label: "Space" }],
]);

/** A keycap whose symbol is drawn as an icon, so it looks the same on every platform. */
function Key({ children }: { children: string }) {
  const symbol = KEY_ICONS.get(children);
  if (!symbol) return <kbd>{children}</kbd>;
  const Icon = symbol.icon;
  return (
    <kbd>
      <Icon size="1.1em" strokeWidth={2.4} aria-label={symbol.label} className="inline-block" />
    </kbd>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Key,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
