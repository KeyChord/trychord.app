export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        {/* A MacBook Caps Lock key over the space bar, at their real proportions. */}
        <svg viewBox="2 2 96 96" fill="currentColor">
          <rect x="10" y="32.353" width="26.363" height="13.319" rx="3.463" />
          <rect x="10" y="54.329" width="80" height="13.319" rx="3.463" />
        </svg>
      </span>
      <span>
        Chord<span className="brand-period">.</span>
      </span>
    </span>
  );
}
