// Keep the existing manuals intact; only add frontmatter and resolve local links.
const workspace = new URL("../../", import.meta.url);
const website = new URL("../", import.meta.url);
const pages = [
  {
    source: "Chord/readme.md",
    target: "reference/chord-manual",
    title: "Chord manual",
    description:
      "The complete introductory guide from the Chord application repository.",
  },
  {
    source: "Chord/scripting.md",
    target: "developers/scripting",
    title: "Scripting API",
    description:
      "Handlers, events, macros, the chord module, CLI, and native code.",
  },
  {
    source: "create-chord-package/readme.md",
    target: "developers/create-package",
    title: "Create a package",
    description:
      "Build, test, and share a chord package with TOML and optional TypeScript handlers.",
  },
  {
    source: "config/readme.md",
    target: "developers/package-configuration",
    title: "Package build configuration",
    description:
      "The complete @keychord/config reference for JavaScript builds, vendoring, and Swift add-ons.",
  },
  {
    source: "chords/readme.md",
    target: "reference/chord-packages",
    title: "Chord packages reference",
    description:
      "The official package collection, key conventions, repository mirrors, and monorepo development.",
  },
];

const contents = await Promise.all(
  pages.map(async (page) => {
    const original = await Bun.file(new URL(page.source, workspace)).text();
    const body = original
      .replaceAll("](scripting.md", "](/docs/developers/scripting")
      .replaceAll(
        "](development.md",
        "](https://github.com/KeyChord/Chord/blob/dev/development.md",
      );
    return {
      ...page,
      content: `---\ntitle: ${JSON.stringify(page.title)}\ndescription: ${JSON.stringify(page.description)}\n---\n\n${body}`,
    };
  }),
);

for (const page of contents) {
  await Bun.write(
    new URL(`content/docs/${page.target}.mdx`, website),
    page.content,
  );
  console.log(`${page.source} → content/docs/${page.target}.mdx`);
}
