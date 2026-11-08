// Share the app's catalog without depending on sibling repos at build time.
const source = new URL(
  "../../Chord/packages/dev/improve/chord/data/official-chord-repos/@assets/official-chord-repos.gen.json",
  import.meta.url,
);
const target = new URL("../src/data/official-packages.json", import.meta.url);

const packages = await Bun.file(source).json();
if (
  !Array.isArray(packages) ||
  packages.length === 0 ||
  !packages.every(
    (pkg) =>
      typeof pkg === "object" &&
      pkg !== null &&
      typeof pkg.packageName === "string" &&
      typeof pkg.displayName === "string" &&
      typeof pkg.description === "string" &&
      Array.isArray(pkg.categories) &&
      pkg.categories.every(
        (category: unknown) => typeof category === "string",
      ) &&
      typeof pkg.url === "string" &&
      /^https:\/\/github\.com\/KeyChord\/[\w.-]+$/.test(pkg.url),
  )
) {
  throw new Error("The app's official package catalog is empty or invalid.");
}

await Bun.write(target, `${JSON.stringify(packages, null, 2)}\n`);
console.log(
  `Imported ${packages.length} official packages from the Chord app.`,
);
