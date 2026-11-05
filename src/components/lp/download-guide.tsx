/** One of the disk images each release publishes. */
export interface MacDownload {
  /** This kind of Mac, as a sentence would name it. */
  mac: string;
  fileName: string;
  url: string;
}

// What to do once the download has started. Nothing else on the page changes when you click
// Download, and the steps after it are where people new to Mac installers get lost.
export function DownloadGuide({
  download,
  alternative,
  onSwitch,
  onClose,
}: {
  download: MacDownload;
  /** The other Mac's download, for anyone who only now learns there are two. */
  alternative: MacDownload;
  onSwitch: () => void;
  onClose: () => void;
}) {
  return (
    <aside className="download-guide" aria-label="How to install Chord">
      <button
        type="button"
        className="download-guide-close"
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>
      <h2>Your download has started</h2>
      <ol>
        <li>
          If your browser asks to allow the download, click <b>Allow</b>.
        </li>
        <li>
          Open <b>{download.fileName}</b>. It's under the downloads arrow at the
          top of your browser, and in your Downloads folder.
        </li>
        <li>
          In the window that opens, drag <b>Chord</b> onto <b>Applications</b>.
        </li>
        <li>
          Open <b>Chord</b> from your Applications folder. If your Mac asks if
          you're sure, click <b>Open</b>.
        </li>
      </ol>
      <p>Chord then walks you through the rest. It takes about two minutes.</p>
      <p className="download-guide-again">
        Nothing happened? <a href={download.url}>Download again</a>
      </p>
      <p className="download-guide-again">
        On {alternative.mac}?{" "}
        <a href={alternative.url} onClick={onSwitch}>
          Get that version instead
        </a>
      </p>
    </aside>
  );
}
