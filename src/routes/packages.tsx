import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Download,
  ExternalLink,
  Globe,
  Grid2X2,
  Keyboard,
  Monitor,
  Music2,
  Package,
  Search,
  Terminal,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import artwork from "@/data/package-artwork.json";
import { baseOptions } from "@/lib/layout.shared";
import { appName, siteUrl } from "@/lib/shared";
import "@/styles/packages.css";

const description =
  "Browse official Chord packages and install ready-made key sequences for your apps.";
const collectionUrl = "https://github.com/KeyChord/chords";

export const Route = createFileRoute("/packages")({
  component: Packages,
  head: () => ({
    links: [{ rel: "canonical", href: `${siteUrl}/packages` }],
    meta: [
      { title: `Browse Chords | ${appName}` },
      { name: "description", content: description },
      { property: "og:title", content: `Browse Chords | ${appName}` },
      { property: "og:description", content: description },
      { property: "og:url", content: `${siteUrl}/packages` },
    ],
  }),
});

const categoryIcons = {
  Browsers: Globe,
  Editors: Code2,
  Input: Keyboard,
  macOS: Monitor,
  Media: Music2,
  Terminals: Terminal,
  "Window Management": Grid2X2,
};
const presentation: Record<
  string,
  { label?: string; icon?: string; category?: string; search?: string }
> = artwork;

function describePackage(name: string) {
  const slug = name.slice("chords-".length).toLowerCase();
  const decoration = presentation[slug];
  const label =
    decoration?.label ??
    name
      .replace(/^chords-(?:com\.apple\.)?/i, "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[._-]+/g, " ")
      .replace(/\b[a-z]/g, (first) => first.toUpperCase());
  return {
    name,
    label,
    category:
      decoration?.category ??
      (slug.startsWith("com.apple.") ? "macOS" : "Other"),
    icon: decoration?.icon,
    search: decoration?.search ?? "",
  };
}

type ChordPackage = ReturnType<typeof describePackage>;
type Catalog =
  | { status: "loading" | "error" }
  | { status: "ready"; packages: ChordPackage[] };
const byLabel = new Intl.Collator("en", { numeric: true });

function Packages() {
  const [catalog, setCatalog] = useState<Catalog>({ status: "loading" });
  const [request, setRequest] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<ChordPackage | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const abort = new AbortController();
    async function loadCatalog() {
      try {
        const response = await fetch("/api/packages", { signal: abort.signal });
        if (!response.ok) throw new Error("Couldn't load Chord packages");
        const names: string[] = await response.json();
        if (abort.signal.aborted) return;
        const packages = names
          .map(describePackage)
          .sort((a, b) => byLabel.compare(a.label, b.label));
        setCatalog({ status: "ready", packages });
      } catch {
        if (!abort.signal.aborted) setCatalog({ status: "error" });
      }
    }
    void loadCatalog();
    return () => abort.abort();
  }, [request]);

  const packages = catalog.status === "ready" ? catalog.packages : [];
  const categories = [...new Set(packages.map((pkg) => pkg.category))].sort(
    byLabel.compare,
  );
  const query = search.trim().toLowerCase();
  const filtered = packages.filter(
    (pkg) =>
      (!category || pkg.category === category) &&
      `${pkg.label} ${pkg.name} ${pkg.category} ${pkg.search}`
        .toLowerCase()
        .includes(query),
  );

  return (
    <HomeLayout {...baseOptions()}>
      <div id="main-content" className="packages-page">
        <header className="packages-heading">
          <div>
            <h1>
              Browse Chords<span className="accent">.</span>
            </h1>
            <p>Find ready-made chords for the apps you use.</p>
          </div>
          <Link
            to="/docs/$"
            params={{ _splat: "guides/packages" }}
            className="button-secondary"
          >
            <BookOpen size={16} /> How to install
          </Link>
        </header>

        {catalog.status === "error" ? (
          <div className="packages-message" role="alert">
            <h2>Couldn’t load the catalog</h2>
            <button
              type="button"
              onClick={() => {
                setCatalog({ status: "loading" });
                setRequest((current) => current + 1);
              }}
            >
              Try again
            </button>
            <a href={collectionUrl}>
              View packages on GitHub <ArrowRight size={15} />
            </a>
          </div>
        ) : (
          <section
            className="packages-browser"
            aria-label="Official Chord packages"
          >
            <div className="packages-toolbar">
              <div className="packages-search">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Search official packages"
                  placeholder="Search packages…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <select
                aria-label="Filter by category"
                value={category}
                disabled={catalog.status === "loading"}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>

            <p className="packages-count" role="status">
              {catalog.status === "loading"
                ? "Loading packages…"
                : `${filtered.length} ${filtered.length === 1 ? "package" : "packages"}`}
            </p>

            {filtered.length > 0 && (
              <ul className="packages-grid">
                {filtered.map((pkg) => (
                  <li key={pkg.name}>
                    <button
                      type="button"
                      className="package-tile"
                      aria-haspopup="dialog"
                      onClick={() => {
                        setSelected(pkg);
                        dialog.current?.showModal();
                      }}
                    >
                      <PackageIcon pkg={pkg} />
                      <span>{pkg.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {catalog.status === "ready" && filtered.length === 0 && (
              <div className="packages-message">
                <h2>No matching packages</h2>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        )}

        <footer className="packages-footer">
          <a href="https://github.com/search?q=topic%3Achordpack+-org%3AKeyChord&type=repositories">
            Community packages <ExternalLink size={14} />
          </a>
          <Link to="/docs/$" params={{ _splat: "developers/create-package" }}>
            Create a package <ArrowRight size={15} />
          </Link>
        </footer>

        <dialog
          ref={dialog}
          className="package-dialog"
          aria-labelledby="package-title"
          onClose={() => setSelected(null)}
        >
          <form method="dialog">
            <button
              type="submit"
              className="package-close"
              aria-label="Close package details"
            >
              <X size={19} />
            </button>
          </form>
          {selected && <PackageDetails key={selected.name} pkg={selected} />}
        </dialog>
      </div>
    </HomeLayout>
  );
}

function PackageIcon({ pkg }: { pkg: ChordPackage }) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon =
    categoryIcons[pkg.category as keyof typeof categoryIcons] ?? Package;
  return pkg.icon && !imageFailed ? (
    <img
      className="package-icon"
      src={pkg.icon}
      alt=""
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
      onError={() => setImageFailed(true)}
    />
  ) : (
    <span className="package-icon package-icon-fallback" aria-hidden="true">
      <Icon size={28} strokeWidth={1.6} />
    </span>
  );
}

function PackageDetails({ pkg }: { pkg: ChordPackage }) {
  const [description, setDescription] = useState("");
  const slug = `KeyChord/${pkg.name}`;
  const repo = `https://github.com/${slug}`;

  useEffect(() => {
    const abort = new AbortController();
    const manifest = `https://raw.githubusercontent.com/KeyChord/chords/HEAD/@keychord/${encodeURIComponent(pkg.name)}/package.json`;
    async function loadDescription() {
      try {
        const response = await fetch(manifest, { signal: abort.signal });
        if (!response.ok) return;
        const metadata: { description?: unknown } = await response.json();
        if (!abort.signal.aborted && typeof metadata.description === "string") {
          setDescription(metadata.description);
        }
      } catch {
        // Source and install links are available as soon as the catalog loads.
      }
    }
    void loadDescription();
    return () => abort.abort();
  }, [pkg.name]);

  return (
    <>
      <div className="package-detail-heading">
        <PackageIcon pkg={pkg} />
        <div>
          <h2 id="package-title">{pkg.label}</h2>
          <p>{slug}</p>
        </div>
      </div>
      {description && <p className="package-description">{description}</p>}
      <div className="package-actions">
        <a
          className="package-add"
          href={`chord://add-package?repo=${encodeURIComponent(slug)}`}
        >
          <Download size={16} /> Add to Chord
        </a>
        <a
          className="button-secondary"
          href={repo}
          target="_blank"
          rel="noreferrer"
        >
          View source <ExternalLink size={14} />
        </a>
      </div>
    </>
  );
}
