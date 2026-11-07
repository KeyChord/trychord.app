import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { gitConfig } from "@/lib/shared";
import { FeatureCarousel } from "./carousel";
import { ChordDemo, type PageChord } from "./demo";
import { DesktopIcon, DownloadButton, QuickLook } from "./desktop";
import { DownloadGuide, type MacDownload } from "./download-guide";
import { MacKeys } from "./mac-keys";
import {
  FollowLink,
  Footer,
  FooterCategory,
  FooterLink,
  SocialLink,
} from "./primitives";
import { BrowserScene, FinderScene, GlobalScene } from "./scenes";
import {
  AppsSection,
  Faq,
  FaqSection,
  Testimonial,
  TestimonialsSection,
} from "./sections";
import { ChordTutorial, nextTutorialStep } from "./tutorial";

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
const releasesUrl = `${githubUrl}/releases/latest`;
const appleSilicon: MacDownload = {
  mac: "a Mac with Apple silicon",
  fileName: "Chord-aarch64.dmg",
  url: `${releasesUrl}/download/Chord-aarch64.dmg`,
};
const intel: MacDownload = {
  mac: "an Intel Mac",
  fileName: "Chord-x86_64.dmg",
  url: `${releasesUrl}/download/Chord-x86_64.dmg`,
};

type IconId = "packages" | "chord" | "trash" | "chords";

/** Apps with official Chord packages. */
const supportedApps = [
  { name: "Chrome", icon: "/apps/chrome.png" },
  { name: "Safari", icon: "/apps/safari.png" },
  { name: "Brave", icon: "/apps/brave.png" },
  { name: "VS Code", icon: "/apps/vscode.png" },
  { name: "Raycast", icon: "/apps/raycast.png" },
  { name: "Terminal", icon: "/apps/terminal.png" },
  { name: "Ghostty", icon: "/apps/ghostty.png" },
  { name: "Warp", icon: "/apps/warp.png" },
  { name: "AeroSpace", icon: "/apps/aerospace.png" },
  { name: "BetterDisplay", icon: "/apps/betterdisplay.png" },
  { name: "Finder", icon: "/apps/finder.png" },
  { name: "System Settings", icon: "/apps/system-settings.png" },
  { name: "Activity Monitor", icon: "/apps/activity-monitor.png" },
  { name: "Mission Control", icon: "/apps/mission-control.png" },
  {
    name: "Accessibility Inspector",
    icon: "/apps/accessibility-inspector.png",
  },
];

/** Chords from Chord's official packages, and the conventions behind them. */
const conventions = [
  {
    quote:
      "Letters stand for words: g is for go to, h is for home and d is for Downloads.",
    name: "Goto Home",
    title: "g h",
    date: "Finder",
    image: "/avatars/finder.png",
  },
  {
    quote:
      "Every browser gets the same t for tabs, so switching browsers doesn't mean relearning.",
    name: "Tab: New",
    title: "t n",
    date: "Chrome",
    image: "/avatars/chrome.png",
  },
  {
    quote:
      "Start a chord with a symbol and it works from any app, wherever you are.",
    name: "Terminal",
    title: "/ t",
    date: "Any app",
    image: "/avatars/terminal.png",
  },
  {
    quote:
      "Chords nest. /w is for windows, then l, r and f for left, right and fill.",
    name: "Window: left",
    title: "/ w l",
    date: "Any app",
    image: "/avatars/mission-control.png",
  },
  {
    quote:
      "Directions are always n e s w, so .e focuses the window to the east.",
    name: "Focus: East",
    title: ". e",
    date: "AeroSpace",
    image: "/avatars/aerospace.png",
  },
  {
    quote:
      "Your editor's commands are a few letters away. f g searches the whole project.",
    name: "Find Globally",
    title: "f g",
    date: "VS Code",
    image: "/avatars/vscode.png",
  },
];


const faqs = [
  {
    question: "Is Chord free?",
    answer:
      "Yes. Download Chord from GitHub and use it on as many Macs as you like.",
  },
  {
    question: "Which download do I need?",
    answer:
      "Choose About This Mac from the Apple menu. If it shows a chip such as Apple M1, use Download for Mac. If it mentions Intel, use Download for Intel Macs.",
  },
  {
    question: "Is there a version for Intel Macs?",
    answer:
      "Yes. Use Download for Intel Macs. Some official packages, including Menu, Windows, Dock and Web, contain code built only for Apple silicon, so parts of them won't work on an Intel Mac yet.",
  },
  {
    question: "Will Chord change my existing shortcuts?",
    answer:
      "No. Chord only listens while you hold Space in Chord Mode, so every shortcut you already use keeps working.",
  },
  {
    question: "Which apps work with Chord?",
    answer:
      "Every app. Global chords work anywhere, and official packages add chords for Chrome, Safari, VS Code, Finder, Terminal, Warp, AeroSpace and more.",
  },
  {
    question: "Why does Chord need Accessibility access?",
    answer:
      "macOS requires it for Chord to notice ⇪ Space and to read the keys you type in Chord Mode.",
  },
  {
    question: "Can I write my own chords?",
    answer:
      "Yes. Chords are plain TOML files in ~/.chord/packages/default. A chord can press a shortcut, run a shell command, or call JavaScript running on Bun.",
  },
];

const chordHints = {
  d: "Download",
  e: "Empty",
  g: "Goto",
  q: "Quick",
  "/": "Links",
};

export function Home() {
  const [selected, setSelected] = useState<IconId | null>(null);
  const [trashEmptied, setTrashEmptied] = useState(false);
  const [quickLookOpen, setQuickLookOpen] = useState(false);
  const [renaming, setRenaming] = useState<IconId | null>(null);
  const [labels, setLabels] = useState<Record<IconId, string>>({
    packages: "Packages",
    chord: "Chord",
    trash: "Trash",
    chords: "chords.png",
  });
  const chordsIcon = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState({ top: 0, left: 0 });

  const measureChords = () => {
    if (!chordsIcon.current) return;
    const rect = chordsIcon.current.getBoundingClientRect();
    setAnchor({ top: rect.top, left: rect.left });
  };

  const emptyTrash = () => {
    if (!trashEmptied) {
      void new Audio("/sounds/empty-trash.mp3").play();
      setTrashEmptied(true);
    }
  };

  // Finder keys: Space previews the selected file, Enter renames the selection.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (renaming) return;
      if (event.code === "Space" && selected === "chords") {
        event.preventDefault();
        measureChords();
        setQuickLookOpen((open) => !open);
      } else if (event.code === "Enter" && selected) {
        event.preventDefault();
        setRenaming(selected);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, renaming]);

  useEffect(() => {
    const onScroll = () => {
      if (quickLookOpen) setQuickLookOpen(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [quickLookOpen]);

  const rename = (id: IconId) => (label: string) => {
    setLabels((current) => ({ ...current, [id]: label }));
    setRenaming(null);
  };

  const [tutorialStep, advanceTutorial] = useReducer(
    nextTutorialStep,
    "enter",
  );
  const [download, setDownload] = useState<MacDownload | null>(null);
  const alternative = download === intel ? appleSilicon : intel;
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const chords = useMemo<PageChord[]>(
    () => [
      {
        keys: "gh",
        name: "Goto Home",
        run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      },
      { keys: "gf", name: "Goto Features", run: () => scrollTo("features") },
      { keys: "gp", name: "Goto Packages", run: () => scrollTo("packages") },
      { keys: "gq", name: "Goto Questions", run: () => scrollTo("faq") },
      {
        keys: "dl",
        name: "Download Chord",
        run: () => {
          setDownload(appleSilicon);
          window.location.href = appleSilicon.url;
        },
      },
      {
        keys: "ql",
        name: "Quick Look",
        run: () => {
          window.scrollTo({ top: 0 });
          setSelected("chords");
          requestAnimationFrame(() => {
            measureChords();
            setQuickLookOpen(true);
          });
        },
      },
      {
        keys: "et",
        name: "Empty Trash",
        run: () => {
          emptyTrash();
          setSelected("trash");
        },
      },
      { keys: "/d", name: "Docs", run: () => (window.location.href = "/docs") },
      {
        keys: "/g",
        name: "GitHub",
        run: () => window.open(githubUrl, "_blank"),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- actions only read refs and setters
    [trashEmptied],
  );

  return (
    <div className="min-h-screen bg-white">
      {download ? (
        <DownloadGuide
          download={download}
          alternative={alternative}
          onSwitch={() => setDownload(alternative)}
          onClose={() => setDownload(null)}
        />
      ) : null}
      <main>
        <section
          className="relative min-h-screen flex flex-col items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/hero-bg.webp)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
            <img src="/chord-icon.png" alt="Chord" width={40} height={40} />
            <span className="text-lg font-semibold text-neutral-900">
              Chord
            </span>
          </div>
          <DesktopIcon
            src="/icons/folder.png"
            label={labels.packages}
            isSelected={selected === "packages"}
            isRenaming={renaming === "packages"}
            onRenameComplete={rename("packages")}
            onClick={() => {
              setSelected("packages");
              scrollTo("packages");
            }}
            // Raised in short windows to stay above the Chord Mode panel in the corner.
            style={{
              top: "min(55%, calc(100vh - var(--chord-hud-clearance) - 6.25rem))",
              right: "12%",
            }}
          />
          <DesktopIcon
            src="/chord-icon.png"
            label={labels.chord}
            isSelected={selected === "chord"}
            isRenaming={renaming === "chord"}
            onRenameComplete={rename("chord")}
            onClick={() => {
              setSelected("chord");
              scrollTo("features");
            }}
            style={{ top: "62%", left: "8%" }}
          />
          <DesktopIcon
            src={
              trashEmptied ? "/icons/trash-empty.png" : "/icons/trash-full.png"
            }
            label={labels.trash}
            isSelected={selected === "trash"}
            isRenaming={renaming === "trash"}
            onRenameComplete={rename("trash")}
            onClick={() => {
              // Only the `et` chord empties the Trash; clicking refills it so the chord can run again.
              setTrashEmptied(false);
              setSelected(selected === "trash" ? null : "trash");
            }}
            // Above Packages: the Chord Mode panel covers the bottom right corner.
            style={{ top: "36%", right: "6%" }}
          />
          <DesktopIcon
            ref={chordsIcon}
            src="/icons/chords.png"
            label={labels.chords}
            isSelected={selected === "chords"}
            isRenaming={renaming === "chords"}
            onRenameComplete={rename("chords")}
            onClick={() => {
              setSelected("chords");
              measureChords();
              setQuickLookOpen(true);
            }}
            isImage
            style={{ top: "58%", left: "18%" }}
          />
          <div className="relative z-10 text-center px-4 mt-[25vh]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 tracking-tight max-w-3xl mx-auto leading-tight">
              Shortcuts you can
              <br />
              <em className="italic">actually</em> remember
            </h1>
            <div className="mt-6 flex flex-col items-center gap-2">
              <MacKeys />
              <ChordTutorial step={tutorialStep} />
            </div>
          </div>
          <div className="hero-download relative z-10 mt-auto flex flex-col items-center">
            <DownloadButton
              href={appleSilicon.url}
              onClick={() => setDownload(appleSilicon)}
            >
              <svg
                className="w-5 h-5 -ml-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Download for Mac
            </DownloadButton>
            <p className="hero-download-note mt-4 text-sm">
              For Macs with Apple silicon
            </p>
            <a
              href={intel.url}
              onClick={() => setDownload(intel)}
              className="hero-download-note mt-1 text-sm underline underline-offset-2"
            >
              Download for Intel Macs
            </a>
          </div>
        </section>
        <section
          id="features"
          className="bg-neutral-50 border-y border-neutral-200"
        >
          <FeatureCarousel
            slides={[
              {
                title: "Shortcuts that read like words",
                tagline:
                  "Type g, then h, to go home. Every chord spells out what it does",
                shortcut: "g h",
                scene: FinderScene,
                href: "/docs/getting-started/first-chord",
              },
              {
                title: "Every app gets its own vocabulary",
                tagline:
                  "Browsers, editors and terminals each come with chords that fit them",
                shortcut: "t n",
                scene: BrowserScene,
                href: "/packages",
              },
              {
                title: "Global chords work everywhere",
                tagline: "Start a chord with a symbol and it runs from any app",
                shortcut: "/ t",
                scene: GlobalScene,
                href: "/docs/guides/configuration",
              },
            ]}
          />
        </section>
        <AppsSection
          id="packages"
          headline="Ready for your favourite apps"
          description="Official packages add chords for browsers, editors, terminals and window managers. Global chords cover every other app."
          apps={supportedApps}
        />
        <TestimonialsSection
          headline="A vocabulary, not a cheat sheet"
          subheadline="Chords follow shared conventions, so learning one app teaches you the next."
        >
          {conventions.map((convention) => (
            <Testimonial key={convention.name} {...convention} />
          ))}
        </TestimonialsSection>
        <FaqSection id="faq" headline="Frequently asked questions">
          {faqs.map((faq) => (
            <Faq
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </FaqSection>
      </main>
      <Footer
        cta={
          <FollowLink
            headline="Follow along"
            subheadline={
              <p>
                Chord is built in the open. Watch the repository for new
                releases.
              </p>
            }
            href={githubUrl}
            label="github.com/KeyChord/Chord"
          />
        }
        links={
          <>
            <FooterCategory title="Product">
              <FooterLink href="#features">Features</FooterLink>
              <FooterLink href="/packages">Packages</FooterLink>
              <FooterLink
                href={appleSilicon.url}
                onClick={() => setDownload(appleSilicon)}
              >
                Download
              </FooterLink>
              <FooterLink href={intel.url} onClick={() => setDownload(intel)}>
                Download for Intel
              </FooterLink>
            </FooterCategory>
            <FooterCategory title="Resources">
              <FooterLink href="/docs">Documentation</FooterLink>
              <FooterLink href={releasesUrl}>Changelog</FooterLink>
              <FooterLink href="#faq">FAQ</FooterLink>
              <FooterLink href={`${githubUrl}/issues`}>
                Report an issue
              </FooterLink>
            </FooterCategory>
            <FooterCategory title="Developers">
              <FooterLink href="/docs/developers/scripting">
                Scripting
              </FooterLink>
              <FooterLink href="/docs/developers/create-package">
                Create a package
              </FooterLink>
              <FooterLink href="https://github.com/KeyChord/chords">
                Chord packages
              </FooterLink>
            </FooterCategory>
          </>
        }
        fineprint={<>© {new Date().getFullYear()} Chord</>}
        socialLinks={
          <SocialLink href={githubUrl} name="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </SocialLink>
        }
      />
      <QuickLook
        src="/icons/chords.png"
        title="chords.png"
        isOpen={quickLookOpen}
        onClose={() => setQuickLookOpen(false)}
        anchorPosition={anchor}
      />
      <ChordDemo
        chords={chords}
        hints={chordHints}
        tutorialStep={tutorialStep}
        onTutorialEvent={advanceTutorial}
      />
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="lp">
      <Home />
    </div>
  );
}
