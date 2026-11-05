// An in-page Chord Mode: press ⇪ then hold Space, type a chord, and release
// Space (or press ⇪) to run it, just like the app.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { squirclePaths } from "./desktop";
import {
  tutorialChord,
  type TutorialEvent,
  type TutorialStep,
} from "./tutorial";

export type PageChord = { keys: string; name: string; run: () => void };

type Feedback = { kind: "ran" | "missing"; text: string; keys: string };

const layers = { bar: 9999, hint: 10000 };
/** How long after ⇪ a Space press still counts as ⇪ Space. */
const capsLockWindow = 1500;
const chordKey = /^[a-z0-9/.,;'[\]]$/;

export function isSpace(event: KeyboardEvent) {
  return event.code === "Space" || event.key === " ";
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

function useSquircle(radius: number, deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState({ outer: "", middle: "", inner: "" });
  useEffect(() => {
    if (!ref.current) return;
    const { offsetWidth, offsetHeight } = ref.current;
    setPaths(squirclePaths(offsetWidth, offsetHeight, radius));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-measure when the content changes
  }, deps);
  return [ref, paths] as const;
}

/** The frosted, layered squircle surface shared by the HUD and the chord bar. */
function Glass({
  paths,
  radius,
  children,
}: {
  paths: { outer: string; middle: string; inner: string };
  radius: number;
  children: ReactNode;
}) {
  const round = (inset: number) => `inset(0 round ${radius - inset}px)`;
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          clipPath: paths.outer || round(0),
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          clipPath: paths.outer || round(0),
          background: "rgba(0,0,0,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          inset: 1,
          clipPath: paths.middle || round(1),
          background: "rgba(255,255,255,0.25)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 2,
          left: 2,
          right: 2,
          bottom: 2,
          clipPath: paths.inner || round(2),
          background: "rgba(0,0,0,0.25)",
        }}
      />
      <div
        className="relative w-full overflow-hidden"
        style={{ clipPath: paths.inner || round(2) }}
      >
        {children}
      </div>
    </>
  );
}

export function HudKey({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md text-white/80 min-h-[24px] ${className}`}
      style={{ background: "rgba(255,255,255,0.2)" }}
    >
      {children}
    </kbd>
  );
}

function HudCapsLockKey() {
  return (
    <HudKey className="px-1.5">
      <span style={{ whiteSpace: "nowrap" }}>caps lock</span>
    </HudKey>
  );
}

function HudRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm font-medium text-white/90">{label}</span>
      <div className="flex gap-0.5">{children}</div>
    </div>
  );
}

/** The frosted panel in the corner that lists how to use Chord Mode. */
function Hud({
  active,
  capsLockOn,
}: {
  active: boolean;
  capsLockOn: boolean;
}) {
  const [panel, paths] = useSquircle(14, [active, capsLockOn]);

  return (
    <div
      ref={panel}
      className="chord-hud fixed bottom-4 right-4"
      style={{
        width: 280,
        zIndex: layers.hint,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        clipPath: paths.outer || "inset(0 round 14px)",
      }}
    >
      <Glass paths={paths} radius={14}>
        {active ? (
          <div className="flex flex-col divide-y divide-white/10">
            <div className="px-4 py-3">
              <p className="text-sm text-white/70 leading-relaxed">
                Keep holding Space and type a chord
              </p>
            </div>
            <HudRow label="Run">
              <HudCapsLockKey />
            </HudRow>
            <HudRow label="Back to normal">
              <HudKey>release space</HudKey>
            </HudRow>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/10">
            <HudRow label="Chord Mode">
              <HudCapsLockKey />
              <HudKey>Space</HudKey>
            </HudRow>
            <HudRow label="Run chord">
              <HudCapsLockKey />
            </HudRow>
            {capsLockOn ? (
              <div className="px-4 py-3">
                <p className="text-sm text-white/70 leading-relaxed">
                  Your Caps Lock is on from trying this. Tap it to turn it off.
                  Once installed, Chord handles this for you.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </Glass>
    </div>
  );
}

/** Letters first, as the app lists them. */
function sortKeys(keys: Iterable<string>) {
  const isLetter = (key: string) => /^[a-z]$/.test(key);
  return [...keys].sort(
    (a, b) =>
      Number(isLetter(b)) - Number(isLetter(a)) || a.localeCompare(b),
  );
}

/**
 * Chord Mode's panel, laid out like the app's default one on the left edge of the screen: a
 * column of keys, then another for each key typed, with the keys so far picked out in green.
 */
function ChordPanel({
  chords,
  hints,
  typed,
  feedback,
  tutorialStep,
}: {
  chords: PageChord[];
  hints: Record<string, string>;
  typed: string;
  feedback: Feedback | null;
  tutorialStep: TutorialStep;
}) {
  const guided =
    tutorialStep === "run" && tutorialChord.keys.startsWith(typed);
  const promptRelease = tutorialStep === "release" && !typed;
  // Only what's being followed while guided: the chord to type, then the one that just ran.
  const listed = guided
    ? chords.filter((chord) => chord.keys === tutorialChord.keys)
    : promptRelease
      ? chords.filter((chord) => chord.keys === feedback?.keys)
      : chords;
  const selected = feedback?.kind === "ran" ? feedback.keys : typed;
  const columns = [...selected, undefined]
    .map((selectedKey, index) => {
      const prefix = selected.slice(0, index);
      const keys = listed
        .filter((chord) => chord.keys.startsWith(prefix))
        .flatMap((chord) => chord.keys[index] ?? []);
      return { prefix, selectedKey, keys: sortKeys(new Set(keys)) };
    })
    .filter((column) => column.keys.length > 0);

  return (
    <div className="chord-panel" style={{ zIndex: layers.bar }}>
      {promptRelease ? (
        <p className="chord-panel-note" data-prompt="">
          Release space to go back to normal
        </p>
      ) : feedback?.kind === "missing" ? (
        <p className="chord-panel-note" data-missing="">
          {feedback.text}
        </p>
      ) : null}
      {/* Left out when there's nothing to list, so a note on its own ends the panel. */}
      {columns.length > 0 ? (
        <div className="chord-panel-columns">
          {columns.map(({ prefix, selectedKey, keys }) => (
            <div key={prefix} className="chord-panel-column">
              {keys.map((key) => (
                <div
                  key={key}
                  className="chord-panel-row"
                  data-dimmed={
                    (selectedKey !== undefined && key !== selectedKey) ||
                    undefined
                  }
                >
                  <kbd
                    className="chord-panel-key"
                    data-selected={key === selectedKey || undefined}
                  >
                    {key.toUpperCase()}
                  </kbd>
                  <span>
                    {chords.find((chord) => chord.keys === prefix + key)?.name ??
                      hints[prefix + key]}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ChordDemo({
  chords,
  hints,
  tutorialStep,
  onTutorialEvent,
}: {
  chords: PageChord[];
  /** What a key stands for when it only starts chords, like a package's hints. */
  hints: Record<string, string>;
  tutorialStep: TutorialStep;
  onTutorialEvent: (event: TutorialEvent) => void;
}) {
  const [initialized, setInitialized] = useState(false);
  const [active, setActive] = useState(false);
  // The page can't undo a Caps Lock press the way the app does, so it says so instead.
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const state = useRef({
    active,
    typed,
    capsLockAt: -Infinity,
    /** Where the page was when a Space press began that isn't Chord Mode yet. */
    spaceHeldFrom: null as number | null,
  });
  state.current.active = active;
  state.current.typed = typed;
  const chordsRef = useRef(chords);
  chordsRef.current = chords;
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setInitialized(true), []);

  const showFeedback = useCallback((next: Feedback | null, duration = 1200) => {
    clearTimeout(feedbackTimer.current);
    setFeedback(next);
    if (next)
      feedbackTimer.current = setTimeout(() => setFeedback(null), duration);
  }, []);

  const exit = useCallback(() => {
    state.current.active = false;
    state.current.typed = "";
    setActive(false);
    setTyped("");
    onTutorialEvent("left");
  }, [onTutorialEvent]);

  /** Runs the chord matching what's been typed; returns whether one ran. */
  const run = useCallback(() => {
    const { typed } = state.current;
    const chord = chordsRef.current.find(
      (candidate) => candidate.keys === typed,
    );
    state.current.typed = "";
    setTyped("");
    if (!chord) return false;
    showFeedback({ kind: "ran", text: `Ran ${chord.name}`, keys: chord.keys });
    chord.run();
    onTutorialEvent("ran");
    return true;
  }, [onTutorialEvent, showFeedback]);

  useEffect(() => {
    const enter = () => {
      state.current.active = true;
      state.current.spaceHeldFrom = null;
      setActive(true);
      setTyped("");
      showFeedback(null);
      onTutorialEvent("entered");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      setCapsLockOn(event.getModifierState("CapsLock"));
      if (event.key === "CapsLock") {
        state.current.capsLockAt = performance.now();
        // ⇪ runs the chord and stays in Chord Mode.
        if (state.current.active) run();
        // macOS delays Caps Lock, so pressed together, Space is reported first and scrolled
        // the page. This was the shortcut after all, so put the page back.
        else if (state.current.spaceHeldFrom !== null) {
          window.scrollTo({
            top: state.current.spaceHeldFrom,
            behavior: "instant",
          });
          enter();
        }
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isSpace(event)) {
        if (state.current.active) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        const capsLock =
          event.getModifierState("CapsLock") ||
          performance.now() - state.current.capsLockAt < capsLockWindow;
        if (isTyping(event.target)) return;
        if (!capsLock) {
          state.current.spaceHeldFrom ??= window.scrollY;
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        enter();
        return;
      }
      if (!state.current.active) return;
      if (event.key === "Escape") {
        event.preventDefault();
        exit();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        const next = state.current.typed.slice(0, -1);
        state.current.typed = next;
        setTyped(next);
      } else if (event.key.length === 1) {
        const key = event.key.toLowerCase();
        if (!chordKey.test(key)) return;
        event.preventDefault();
        event.stopPropagation();
        const next = state.current.typed + key;
        if (chordsRef.current.some((chord) => chord.keys.startsWith(next))) {
          state.current.typed = next;
          setTyped(next);
          showFeedback(null);
        } else {
          showFeedback(
            {
              kind: "missing",
              text: `No chord starts with “${next}”`,
              keys: next,
            },
            1600,
          );
        }
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      setCapsLockOn(event.getModifierState("CapsLock"));
      if (event.key === "CapsLock") {
        state.current.capsLockAt = performance.now();
        if (state.current.active) run();
        return;
      }
      if (isSpace(event)) state.current.spaceHeldFrom = null;
      if (isSpace(event) && state.current.active) {
        // Releasing Space runs the chord and leaves Chord Mode.
        event.preventDefault();
        run();
        exit();
      }
    };
    const onBlur = () => exit();
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", onBlur);
    };
  }, [exit, onTutorialEvent, run, showFeedback]);

  useEffect(() => () => clearTimeout(feedbackTimer.current), []);

  if (!initialized) return null;

  return (
    <>
      {(active || feedback?.kind === "ran") && (
        <ChordPanel
          chords={chords}
          hints={hints}
          typed={typed}
          feedback={feedback}
          tutorialStep={tutorialStep}
        />
      )}
      <Hud active={active} capsLockOn={capsLockOn} />
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {tutorialStep === "run"
          ? `Chord Mode on. Keep holding Space, type ${[...tutorialChord.keys].join(" ")}, then press Caps Lock.`
          : tutorialStep === "release"
            ? "Chord ran. Release Space to go back to normal."
            : active
              ? "Chord Mode on. Type a chord, then release Space to run it."
              : feedback?.kind === "ran"
                ? feedback.text
                : tutorialStep === "done"
                  ? "Back to normal."
                  : ""}
      </div>
    </>
  );
}
