import { createFileRoute } from "@tanstack/react-router";

const packageDirectory =
  "https://api.github.com/repos/KeyChord/chords/contents/@keychord";
const cacheControl = "public, max-age=300";
const packageName = /^chords-[a-z0-9][a-z0-9._-]*$/i;

async function fetchPackageNames(): Promise<string[]> {
  const response = await fetch(packageDirectory, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "trychord.app package catalog",
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    throw new Error(`GitHub package directory returned ${response.status}`);
  }

  const entries: unknown = await response.json();
  if (!Array.isArray(entries))
    throw new Error("Invalid GitHub package directory");
  const names = entries.flatMap(
    (entry: { type?: unknown; name?: unknown } | null) =>
      entry?.type === "dir" &&
      typeof entry.name === "string" &&
      packageName.test(entry.name)
        ? [entry.name]
        : [],
  );
  if (!names.length) throw new Error("GitHub package directory is empty");
  return names;
}

export const Route = createFileRoute("/api/packages")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // A fixed key prevents query strings from bypassing the edge cache.
        const key = new Request(new URL("/api/packages", request.url));
        const cache =
          typeof caches === "undefined"
            ? undefined
            : (caches as CacheStorage & { default?: Cache }).default;
        const cached = await cache?.match(key);
        if (cached) return cached;

        try {
          const response = Response.json(await fetchPackageNames(), {
            headers: { "Cache-Control": cacheControl },
          });
          await cache?.put(key, response.clone());
          return response;
        } catch (error) {
          console.error(error);
          return Response.json(
            { error: "Couldn't load Chord packages" },
            { status: 502, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
