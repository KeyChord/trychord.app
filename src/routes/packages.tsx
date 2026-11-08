import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Download,
  ExternalLink,
  FolderGit2,
  Globe,
  Grid2X2,
  Package,
  Search,
  Terminal,
  X,
} from "lucide-react";
import { useState } from "react";
import officialPackages from "@/data/official-packages.json";
import { baseOptions } from "@/lib/layout.shared";
import { appName, siteUrl } from "@/lib/shared";
import "@/styles/packages.css";

const description =
  "Browse official Chord packages for your Mac. Find ready-made key sequences for browsers, editors, terminals, and window management.";

export const Route = createFileRoute("/packages")({
  component: Packages,
  head: () => ({
    links: [{ rel: "canonical", href: `${siteUrl}/packages` }],
    meta: [
      { title: `Packages | ${appName}` },
      { name: "description", content: description },
      { property: "og:title", content: `Packages | ${appName}` },
      { property: "og:description", content: description },
      { property: "og:url", content: `${siteUrl}/packages` },
    ],
  }),
});

const categories = [
  ...new Set(officialPackages.flatMap((pkg) => pkg.categories)),
].sort((a, b) => a.localeCompare(b, "en"));
const categoryIcons = {
  Browsers: Globe,
  Editors: Code2,
  Terminals: Terminal,
  "Window Management": Grid2X2,
};

function Packages() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("featured");
  const query = search.trim().toLowerCase();
  const filteredPackages = officialPackages
    .filter(
      (pkg) =>
        (category === null || pkg.categories.includes(category)) &&
        `${pkg.displayName} ${pkg.packageName} ${pkg.description} ${pkg.categories.join(" ")} ${pkg.url}`
          .toLowerCase()
          .includes(query),
    )
    .sort((a, b) =>
      sort === "name" ? a.displayName.localeCompare(b.displayName) : 0,
    );

  function clearFilters() {
    setSearch("");
    setCategory(null);
  }

  return (
    <HomeLayout {...baseOptions()}>
      <div id="main-content" className="packages-page">
        <header className="packages-heading">
          <p className="eyebrow">
            <span className="status-dot" /> THE OFFICIAL COLLECTION
          </p>
          <div className="packages-heading-row">
            <div>
              <h1>
                Packages<span className="accent">.</span>
              </h1>
              <p>
                Ready-made chords for the apps you use. Find your next shortcut.
              </p>
            </div>
            <Link
              to="/docs/$"
              params={{ _splat: "guides/packages" }}
              className="button-secondary"
            >
              <BookOpen size={15} /> How to install
            </Link>
          </div>
        </header>

        <div className="packages-browser">
          <aside className="packages-sidebar" aria-label="Package categories">
            <h2 className="packages-label">CATEGORIES</h2>
            <div
              className="packages-categories"
              role="group"
              aria-label="Filter by category"
            >
              <button
                type="button"
                aria-pressed={category === null}
                onClick={() => setCategory(null)}
              >
                <Package size={16} /> All packages
                <span>{officialPackages.length}</span>
              </button>
              {categories.map((name) => {
                const Icon =
                  categoryIcons[name as keyof typeof categoryIcons] ?? Package;
                return (
                  <button
                    type="button"
                    key={name}
                    aria-pressed={category === name}
                    onClick={() => setCategory(name)}
                  >
                    <Icon size={16} /> {name}
                    <span>
                      {
                        officialPackages.filter((pkg) =>
                          pkg.categories.includes(name),
                        ).length
                      }
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="packages-install-note">
              <h2>A little setup. A lot less clicking.</h2>
              <p>
                In Chord, open <strong>Settings → Browse</strong> and choose
                Install next to a package.
              </p>
              <Link to="/docs/$" params={{ _splat: "guides/packages" }}>
                Installation guide <ArrowRight size={13} />
              </Link>
            </div>
          </aside>

          <section
            className="packages-results"
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
                    <X size={15} />
                  </button>
                )}
              </div>
              <select
                aria-label="Sort packages"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>

            <div className="packages-results-heading">
              <h2>{category ?? "All packages"}</h2>
              <span role="status" aria-live="polite">
                {filteredPackages.length}{" "}
                {filteredPackages.length === 1 ? "package" : "packages"}
              </span>
            </div>

            {filteredPackages.length > 0 ? (
              <div className="packages-list">
                {filteredPackages.map((pkg) => {
                  const Icon =
                    categoryIcons[
                      pkg.categories[0] as keyof typeof categoryIcons
                    ] ?? Package;
                  return (
                    <article key={pkg.packageName} className="package-row">
                      <div className="package-icon" aria-hidden="true">
                        <Icon size={23} strokeWidth={1.5} />
                      </div>
                      <div className="package-details">
                        <div className="package-title">
                          <h3>
                            <a href={pkg.url} target="_blank" rel="noreferrer">
                              {pkg.displayName}
                            </a>
                          </h3>
                          {pkg.categories.map((name) => (
                            <span className="package-category" key={name}>
                              {name}
                            </span>
                          ))}
                        </div>
                        <p>{pkg.description}</p>
                        <div className="package-meta">
                          <span className="package-publisher">
                            <Check size={11} /> KeyChord
                          </span>
                          <span className="package-repository">
                            <FolderGit2 size={13} />{" "}
                            {pkg.url.replace("https://github.com/", "")}
                          </span>
                        </div>
                      </div>
                      <div className="package-actions">
                        <a
                          className="package-add"
                          href={`chord://add-package?repo=${encodeURIComponent(pkg.url.replace("https://github.com/", ""))}`}
                          aria-label={`Add ${pkg.displayName} to Chord`}
                        >
                          <Download size={13} /> Add to Chord
                        </a>
                        <a
                          className="package-source"
                          href={pkg.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${pkg.displayName} on GitHub`}
                        >
                          View source <ExternalLink size={13} />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="packages-empty">
                <Search size={26} strokeWidth={1.5} aria-hidden="true" />
                <h3>No matching packages</h3>
                <p>Try another search or choose a different category.</p>
                <button type="button" onClick={clearFilters}>
                  Clear filters <X size={13} />
                </button>
              </div>
            )}

            <div className="packages-collection-link">
              <span>Looking for more chords?</span>
              <a
                href="https://github.com/KeyChord/chords"
                target="_blank"
                rel="noreferrer"
              >
                Explore the full collection <ArrowRight size={14} />
              </a>
            </div>
          </section>
        </div>

        <footer className="packages-contribute">
          <Code2 size={21} strokeWidth={1.5} aria-hidden="true" />
          <div>
            <h2>Your workflow, your chords.</h2>
            <p>
              Build a package for the way you work and share it with everyone.
            </p>
          </div>
          <Link
            to="/docs/$"
            params={{ _splat: "developers/create-package" }}
            className="text-link"
          >
            Create a package <ArrowRight size={15} />
          </Link>
        </footer>
      </div>
    </HomeLayout>
  );
}
