import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { docs, source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { baseOptions } from "@/lib/layout.shared";
import {
  appName,
  getPageImageUrl,
  getPageMarkdownUrl,
  siteUrl,
} from "@/lib/shared";
import { Suspense, use } from "react";
import { useMDXComponents } from "@/components/mdx";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  pendingComponent: Pending,
  pendingMs: 0,
  pendingMinMs: 0,
  // Documentation only changes with a deployment, so reuse loaded pages.
  staleTime: Infinity,
  preloadStaleTime: Infinity,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/").filter(Boolean) ?? [];
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    // The macro bundles frontmatter and navigation; only the MDX needs loading.
    await page.data.preload();

    return {
      path: page.path,
      title: page.data.title,
      canonicalUrl: new URL(page.url, siteUrl).href,
      description: page.data.description,
      markdownUrl: getPageMarkdownUrl(page).url,
      imageUrl: getPageImageUrl(page).url,
    };
  },
  head: ({ loaderData }) => ({
    links: loaderData
      ? [{ rel: "canonical", href: loaderData.canonicalUrl }]
      : [],
    meta: loaderData
      ? [
          { title: `${loaderData.title} | ${appName}` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.title} | ${appName}` },
          { property: "og:description", content: loaderData.description },
          { property: "og:image", content: loaderData.imageUrl },
          { property: "og:url", content: loaderData.canonicalUrl },
        ]
      : [],
  }),
});

function Content({ path, markdownUrl }: { path: string; markdownUrl: string }) {
  const page = docs.getPage(path);
  if (!page) throw new Error(`unknown page: ${path}`);

  const { toc } = use(page.load());
  const MDX = page.body;

  return (
    <DocsPage toc={toc}>
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} />
      </div>
      <DocsBody>
        <MDX components={useMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

function Page() {
  const { path, markdownUrl } = Route.useLoaderData();

  return (
    <DocsLayout {...baseOptions()} tree={source.getPageTree()}>
      <Suspense>
        <Content path={path} markdownUrl={markdownUrl} />
      </Suspense>
    </DocsLayout>
  );
}

function Pending() {
  return (
    <DocsLayout {...baseOptions()} tree={source.getPageTree()}>
      <DocsPage
        aria-busy="true"
        breadcrumb={{ enabled: false }}
        footer={{ enabled: false }}
      >
        <p role="status" className="text-sm text-fd-muted-foreground">
          Loading documentation…
        </p>
        <div aria-hidden="true" className="docs-loading-skeleton">
          <div />
          <div />
          <div />
        </div>
      </DocsPage>
    </DocsLayout>
  );
}
