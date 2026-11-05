// Animated stand-ins for product videos: each scene loops a chord being typed
// and run. Styles and timing live in the "Feature scenes" part of landing.css.
import { useEffect, useRef, useState, type ReactNode } from "react";

const stageWidth = 560;
const stageHeight = 315;

/** Lays a scene out at 560×315 and scales it to whatever width its card has. */
function Stage({
  playing,
  children,
}: {
  playing: boolean;
  children: ReactNode;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / stageWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="sc-frame">
      <div
        className="sc"
        data-playing={playing || undefined}
        style={{
          width: stageWidth,
          height: stageHeight,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Lights() {
  return (
    <span className="sc-lights" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/** The floating Chord Mode bar, typing `keys` and then showing the chord's name. */
function ChordBar({ keys, name }: { keys: string; name: string }) {
  return (
    <div className="sc-bar" aria-hidden="true">
      <span className="sc-bar-mode">Chord Mode</span>
      {[...keys].map((key, index) => (
        <kbd key={index} className={`sc-key sc-key-${index + 1}`}>
          {key}
        </kbd>
      ))}
      <span className="sc-bar-name">{name}</span>
    </div>
  );
}

function FolderItem({
  name,
  icon = "/icons/folder.png",
}: {
  name: string;
  icon?: string;
}) {
  return (
    <span className="sc-item">
      <img src={icon} alt="" width={40} height={40} />
      {name}
    </span>
  );
}

export function FinderScene({ playing }: { playing: boolean }) {
  return (
    <Stage playing={playing}>
      <div className="sc-wallpaper" />
      <div className="sc-window sc-finder">
        <aside className="sc-sidebar">
          <Lights />
          <small>Favorites</small>
          <span>Recents</span>
          <span>Applications</span>
          <span className="sc-from">Desktop</span>
          <span>Documents</span>
          <span>Downloads</span>
          <span className="sc-to">Home</span>
        </aside>
        <div className="sc-main">
          <div className="sc-toolbar">
            <span className="sc-before">Desktop</span>
            <span className="sc-after">Home</span>
          </div>
          <div className="sc-grid sc-before">
            <FolderItem name="Projects" />
            <FolderItem name="chords.toml" icon="/icons/toml-document.png" />
            <FolderItem name="Screenshots" />
          </div>
          <div className="sc-grid sc-after">
            <FolderItem name="Applications" />
            <FolderItem name="Desktop" />
            <FolderItem name="Documents" />
            <FolderItem name="Downloads" />
            <FolderItem name="Movies" />
            <FolderItem name="Music" />
            <FolderItem name="Pictures" />
            <FolderItem name="Projects" />
          </div>
        </div>
      </div>
      <ChordBar keys="gh" name="Goto Home" />
    </Stage>
  );
}

export function BrowserScene({ playing }: { playing: boolean }) {
  return (
    <Stage playing={playing}>
      <div className="sc-wallpaper" />
      <div className="sc-window sc-browser">
        <div className="sc-tabs">
          <Lights />
          <span className="sc-tab sc-tab-docs">
            <img src="/favicon.svg" alt="" width={12} height={12} /> Chord
            docs
          </span>
          <span className="sc-tab">
            <i className="sc-favicon" /> KeyChord/chords
          </span>
          <span className="sc-tab sc-tab-new">New Tab</span>
        </div>
        <div className="sc-address">
          <span className="sc-before">trychord.app/docs/guides/chord-mode</span>
          <span className="sc-after sc-placeholder">
            Search Google or type a URL
          </span>
        </div>
        <div className="sc-page">
          <div className="sc-article sc-before">
            <b>Chord Mode</b>
            <i style={{ width: "92%" }} />
            <i style={{ width: "86%" }} />
            <i style={{ width: "64%" }} />
            <span className="sc-code">
              <i style={{ width: "38%" }} />
              <i style={{ width: "56%" }} />
            </span>
            <i style={{ width: "90%" }} />
            <i style={{ width: "72%" }} />
          </div>
          <div className="sc-newtab sc-after">
            <span className="sc-search">Search Google or type a URL</span>
            <span className="sc-shortcuts">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
      </div>
      <ChordBar keys="tn" name="Tab: New" />
    </Stage>
  );
}

export function GlobalScene({ playing }: { playing: boolean }) {
  return (
    <Stage playing={playing}>
      <div className="sc-wallpaper" />
      <div className="sc-window sc-notes">
        <div className="sc-titlebar">
          <Lights />
          <span>Notes</span>
        </div>
        <div className="sc-note">
          <b>Things to try</b>
          <p>gh to go home in Finder</p>
          <p>tn for a new tab</p>
          <p>/t opens Terminal from anywhere</p>
        </div>
      </div>
      <div className="sc-window sc-terminal">
        <div className="sc-titlebar">
          <Lights />
          <span>~ — zsh</span>
        </div>
        <pre>
          <span className="sc-dim">Last login: Tue Nov 3 09:41 on ttys000</span>
          {"\n"}
          <span className="sc-prompt">~ %</span> <span className="sc-caret" />
        </pre>
      </div>
      <ChordBar keys="/t" name="Terminal" />
    </Stage>
  );
}
