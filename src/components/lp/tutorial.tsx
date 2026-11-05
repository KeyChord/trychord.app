// The hero's guided first chord: enter Chord Mode, run one chord, release Space.
import type { ReactNode } from "react";

/** `retry` is `enter` again, after Space was released before a chord ran. */
export type TutorialStep = "enter" | "retry" | "run" | "release" | "done";
export type TutorialEvent = "entered" | "ran" | "left";

/** Its result is right there in the hero: the Trash on the desktop empties. */
export const tutorialChord = { keys: "et", name: "Empty Trash" };

/**
 * Any chord counts as the one that teaches running a chord, and releasing Space right after
 * typing it counts too: it ran, and the keyboard is back to normal, the same as in the app.
 */
export function nextTutorialStep(
  step: TutorialStep,
  event: TutorialEvent,
): TutorialStep {
  if (step === "done") return step;
  if (event === "entered") return "run";
  if (event === "ran") return "release";
  if (step === "release") return "done";
  return step === "run" ? "retry" : step;
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Step({
  number,
  current,
  children,
}: {
  number: number;
  current: number;
  children: ReactNode;
}) {
  const state =
    number < current ? "done" : number === current ? "current" : "upcoming";
  return (
    <li
      className="chord-tutorial-step"
      data-state={state}
      aria-current={state === "current" ? "step" : undefined}
    >
      <span className="chord-tutorial-badge">
        {state === "done" ? <Check /> : number}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function ChordTutorial({ step }: { step: TutorialStep }) {
  if (step === "done") {
    return (
      <div className="chord-tutorial chord-tutorial-finished">
        <p className="chord-tutorial-normal-title">
          <span className="chord-tutorial-badge" data-finished="">
            <Check />
          </span>
          Back to normal
        </p>
        <p>
          Chord only listens while you hold space. Release it, and every key
          and shortcut works as it always did.
        </p>
        <p className="chord-tutorial-again">
          Press <kbd>caps lock</kbd> + <kbd>space</kbd> to try another chord.
        </p>
      </div>
    );
  }
  const current = step === "run" ? 2 : step === "release" ? 3 : 1;
  return (
    <div className="chord-tutorial">
      <p className="chord-tutorial-eyebrow">Try it on this page</p>
      <ol className="chord-tutorial-steps">
        <Step number={1} current={current}>
          Press <kbd>caps lock</kbd> + <kbd>space</kbd> together, and keep
          holding <kbd>space</kbd>
          {step === "retry" ? (
            <span className="chord-tutorial-retry">
              Chord Mode only lasts while you hold space. Try again, and keep
              holding it.
            </span>
          ) : null}
        </Step>
        <Step number={2} current={current}>
          Still holding, type{" "}
          {[...tutorialChord.keys].map((key) => (
            <kbd key={key}>{key}</kbd>
          ))}{" "}
          for {tutorialChord.name}, then press <kbd>caps lock</kbd>
        </Step>
        <Step number={3} current={current}>
          Release <kbd>space</kbd>.{" "}
          <span className="chord-tutorial-normal">
            Your computer is back to normal.
          </span>
        </Step>
      </ol>
    </div>
  );
}
