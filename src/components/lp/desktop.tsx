import { getSvgPath } from "figma-squircle";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

const quickLookKeyframes = `
        @keyframes scaleIn {
          from {
            transform: scale(0) translateX(-80px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateX(0);
            opacity: 1;
          }
        }
        @keyframes scaleOut {
          from {
            transform: scale(1) translateX(0);
            opacity: 1;
          }
          to {
            transform: scale(0) translateX(-80px);
            opacity: 0;
          }
        }
      `;

/** A macOS Quick Look panel that grows out of the desktop icon it previews. */
export function QuickLook({
  src,
  title,
  isOpen,
  onClose,
  anchorPosition,
}: {
  src: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  anchorPosition: { top: number; left: number };
}) {
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const opened = useRef(false);

  useEffect(() => {
    if (isOpen && !opened.current) {
      setVisible(true);
      setClosing(false);
      opened.current = true;
    } else if (!isOpen && opened.current && visible && !closing) {
      setClosing(true);
    }
  }, [isOpen, visible, closing]);

  const close = () => setClosing(true);

  if (!visible && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={close}>
      <style>{quickLookKeyframes}</style>
      <div
        className="absolute"
        onClick={(event) => event.stopPropagation()}
        onAnimationEnd={() => {
          if (!closing) return;
          setVisible(false);
          setClosing(false);
          opened.current = false;
          onClose();
        }}
        style={{
          width: 260,
          height: 400,
          top: anchorPosition.top - 400 / 2 + 36,
          left: anchorPosition.left + 80,
          transformOrigin: "left center",
          animation: closing
            ? "scaleOut 0.15s ease-in forwards"
            : "scaleIn 0.15s ease-out forwards",
          borderRadius: 14,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div
          className="absolute"
          style={{
            inset: 0,
            borderRadius: 14,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          }}
        />
        <div
          className="absolute"
          style={{ inset: 0, borderRadius: 14, background: "rgba(0,0,0,0.5)" }}
        />
        <div
          className="absolute"
          style={{
            inset: 1,
            borderRadius: 13,
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
            borderRadius: "12px",
            background: "rgba(0,0,0,0.25)",
          }}
        />
        <img
          src={src}
          alt={title}
          style={{
            position: "absolute",
            top: 42,
            left: 6,
            width: 248,
            height: 352,
            borderRadius: 10,
            objectFit: "cover",
          }}
        />
        <div
          className="absolute flex items-center gap-2 px-3"
          style={{ top: 2, left: 2, right: 2, height: 36 }}
        >
          <button
            onClick={(event) => {
              event.stopPropagation();
              close();
            }}
            style={{
              padding: 0,
              border: "none",
              background: "transparent",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <defs>
                <mask id="closeMask">
                  <circle cx="7" cy="7" r="7" fill="white" />
                  <path
                    d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </mask>
              </defs>
              <circle
                cx="7"
                cy="7"
                r="7"
                fill="rgba(255,255,255,0.55)"
                mask="url(#closeMask)"
              />
            </svg>
          </button>
          <div style={{ flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <defs>
                <mask id="expandMask">
                  <circle cx="7" cy="7" r="7" fill="white" />
                  <g transform="translate(4, 4)">
                    <path d="M0 0H4L2 2L0 4V0Z" fill="black" />
                    <path d="M6 6H2L4 4L6 2V6Z" fill="black" />
                  </g>
                </mask>
              </defs>
              <circle
                cx="7"
                cy="7"
                r="7"
                fill="rgba(255,255,255,0.55)"
                mask="url(#expandMask)"
              />
            </svg>
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.9)",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}

type SquirclePaths = { outer: string; middle: string; inner: string };

/** Clip paths for a squircle and the two 1px insets inside it, as CSS `path()` values. */
export function squirclePaths(
  width: number,
  height: number,
  radius: number,
): SquirclePaths {
  const path = (inset: number) =>
    `path('${getSvgPath({
      width: width - inset * 2,
      height: height - inset * 2,
      cornerRadius: radius - inset,
      cornerSmoothing: 0.8,
      preserveSmoothing: true,
    })}')`;
  return { outer: path(0), middle: path(1), inner: path(2) };
}

/** The glossy pill-shaped download button, layered from three squircles. */
export function DownloadButton({
  href,
  children,
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const [paths, setPaths] = useState<SquirclePaths>({
    outer: "",
    middle: "",
    inner: "",
  });
  const link = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!link.current) return;
    const { offsetWidth, offsetHeight } = link.current;
    setPaths(squirclePaths(offsetWidth, offsetHeight, offsetHeight / 2));
  }, []);

  return (
    <a
      ref={link}
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white ${className}`}
      style={{ background: "transparent" }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          clipPath: paths.outer || "inset(0 round 9999px)",
          zIndex: 0,
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 1,
          background: "rgba(255,255,255,0.3)",
          clipPath: paths.middle || "inset(0 round 9999px)",
          zIndex: 1,
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 2,
          background: "linear-gradient(to bottom, #3a3a3a 0%, #1a1a1a 100%)",
          clipPath: paths.inner || "inset(0 round 9999px)",
          zIndex: 2,
        }}
      />
      <span
        className="inline-flex items-center gap-2"
        style={{ position: "relative", zIndex: 3 }}
      >
        {children}
      </span>
    </a>
  );
}

/** A Finder desktop icon: click to select, Enter to rename. */
export const DesktopIcon = forwardRef<
  HTMLButtonElement,
  {
    src: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
    isImage?: boolean;
    style?: CSSProperties;
    isRenaming: boolean;
    onRenameComplete: (label: string) => void;
  }
>(function DesktopIcon(
  {
    src,
    label,
    isSelected,
    onClick,
    isImage = false,
    style,
    isRenaming,
    onRenameComplete,
  },
  ref,
) {
  const input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(label);

  useEffect(() => {
    if (isRenaming && input.current) {
      input.current.focus();
      input.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    setDraft(label);
  }, [label]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      onRenameComplete(draft);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setDraft(label);
      onRenameComplete(label);
    }
  };

  const name = isRenaming ? (
    <input
      ref={input}
      type="text"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={onKeyDown}
      onBlur={() => onRenameComplete(draft)}
      className="text-xs font-medium text-white px-2 py-0.5 rounded-md text-center outline-none"
      style={{
        backgroundColor: "transparent",
        border: "none",
        minWidth: "40px",
        maxWidth: "100px",
        boxSizing: "content-box",
        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
      }}
      size={draft.length || 1}
    />
  ) : isSelected ? (
    <span
      className="text-xs font-medium text-white px-2 py-0.5 rounded-md"
      style={{ backgroundColor: "#0259D1" }}
    >
      {label}
    </span>
  ) : (
    <span
      className="text-xs font-medium text-white px-2 py-0.5"
      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
    >
      {label}
    </span>
  );

  const highlighted = isSelected || isRenaming;

  return (
    <button
      ref={ref}
      type="button"
      className="desktop-icon absolute z-10 flex flex-col items-center gap-1.5 cursor-default select-none bg-transparent border-none p-0 outline-none focus:outline-none"
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        if (!isRenaming) onClick();
      }}
    >
      <div
        className="w-[72px] h-[72px] flex items-center justify-center rounded-lg"
        style={
          highlighted
            ? {
                backgroundColor: "rgba(0,0,0,0.35)",
                border: "2px solid rgba(255,255,255,0.4)",
              }
            : { border: "2px solid transparent" }
        }
      >
        <img
          src={src}
          alt={label}
          width={isImage ? 40 : 56}
          height={isImage ? 40 : 56}
          className={
            highlighted
              ? `drop-shadow-md ${isImage ? "rounded object-contain" : ""}`
              : `drop-shadow-md ${isImage ? "object-contain" : ""}`
          }
          style={
            isImage
              ? {
                  borderRadius: "4px",
                  border: "1px solid rgba(255,255,255,0.2)",
                }
              : undefined
          }
        />
      </div>
      {name}
    </button>
  );
});
