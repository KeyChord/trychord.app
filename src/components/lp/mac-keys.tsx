import { useEffect, useState } from "react";
import { isSpace } from "./demo";

/** The Chord shortcut, drawn as the keys on a MacBook and pressed along with the real ones. */
export function MacKeys() {
  const [spaceDown, setSpaceDown] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Browsers on macOS report Caps Lock turning on and off, not the key going down and up,
      // so the key is drawn held for as long as Caps Lock is on, the way the browser reports it.
      setCapsLockOn(event.getModifierState("CapsLock"));
      // macOS doesn't report Space coming back up while ⌘ is held.
      if (isSpace(event))
        setSpaceDown(event.type === "keydown" && !event.metaKey);
    };
    const onBlur = () => setSpaceDown(false);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <span className="mac-keys">
      <kbd className="mac-key mac-key-caps">
        <span className="mac-key-cap" data-pressed={capsLockOn || undefined}>
          <span
            className="mac-key-led"
            data-on={capsLockOn || undefined}
            aria-hidden="true"
          />
          <span className="mac-key-legend">caps lock</span>
        </span>
      </kbd>
      <span className="mac-keys-plus">+</span>
      <kbd className="mac-key mac-key-space">
        <span className="mac-key-cap" data-pressed={spaceDown || undefined}>
          {/* Blank like the real one, so the name is only for screen readers. */}
          <span className="mac-key-name">space</span>
        </span>
      </kbd>
    </span>
  );
}
