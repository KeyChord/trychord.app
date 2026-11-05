import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ComponentType,
  type ReactNode,
} from "react";

export type FeatureSlide = {
  title: string;
  tagline: string;
  /** Space-separated keys; `⌘` renders as the Command glyph. */
  shortcut?: string;
  /** An animated scene that plays while its card is active, like a looping video. */
  scene: ComponentType<{ playing: boolean }>;
  /** Where the active card leads when clicked. */
  href: string;
};

const slideDuration = 5000;
const tickInterval = 50;

export function Key({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={`inline-flex items-center justify-center px-2 py-1 mx-0.5 text-sm font-medium bg-neutral-100 border border-neutral-300 rounded-md text-neutral-700 shadow-sm min-h-[28px] ${className}`}
    >
      {children}
    </kbd>
  );
}

export function CommandGlyph({
  className = "w-4 h-4",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 1.5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2v-2a2 2 0 0 0-2-2Z" />
      <path d="M10.5 5.5h2a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2Z" />
      <path d="M12.5 10.5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-2Z" />
      <path d="M5.5 10.5h-2a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-2Z" />
      <rect x="5.5" y="5.5" width="5" height="5" />
    </svg>
  );
}

function Shortcut({ shortcut }: { shortcut: string }) {
  return (
    <div className="flex items-center justify-center">
      {shortcut.split(" ").map((key, index) =>
        key === "⌘" ? (
          <Key key={index} className="px-1.5">
            <CommandGlyph />
          </Key>
        ) : (
          <Key key={index}>{key}</Key>
        ),
      )}
    </div>
  );
}

const VideoCard = memo(function VideoCard({
  slide,
  isActive,
  isAdjacent,
  onSelect,
}: {
  slide: FeatureSlide;
  isActive: boolean;
  isAdjacent: boolean;
  onSelect: () => void;
}) {
  const Scene = slide.scene;

  return (
    <div
      className={`flex-shrink-0 transition-all duration-500 w-[280px] sm:w-[560px] ${isActive ? "opacity-100 z-10" : isAdjacent ? "opacity-70" : "opacity-50"}`}
      onClick={() => !isActive && onSelect()}
    >
      <a
        href={slide.href}
        className="block relative cursor-pointer pointer-events-auto group"
        onClick={(event) => !isActive && event.preventDefault()}
      >
        <div className="relative rounded-2xl overflow-hidden transition-all duration-500 shadow-xl ring-1 ring-black/10">
          <div className="w-full aspect-video object-cover">
            <Scene playing={isActive} />
          </div>
        </div>
        {slide.shortcut && (
          <div
            className={`mt-4 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-50"}`}
          >
            <Shortcut shortcut={slide.shortcut} />
          </div>
        )}
      </a>
    </div>
  );
});

const Track = memo(function Track({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: FeatureSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardWidth = isMobile ? 280 : 560;

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    // 36px matches the track's `gap-9`.
    track.current?.scrollTo({
      left: activeIndex * (cardWidth + 36),
      behavior: "smooth",
    });
  }, [activeIndex, cardWidth]);

  return (
    <div className="w-full overflow-hidden my-12 relative">
      <div
        ref={track}
        className="flex py-2 gap-9 pointer-events-none"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: `calc(50% - ${cardWidth / 2}px)`,
          paddingRight: `calc(50% - ${cardWidth / 2}px)`,
          overflowX: "hidden",
          userSelect: "none",
        }}
      >
        {slides.map((slide, index) => (
          <VideoCard
            key={index}
            slide={slide}
            isActive={activeIndex === index}
            isAdjacent={index === activeIndex - 1 || index === activeIndex + 1}
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>
    </div>
  );
});

const ProgressBar = memo(function ProgressBar({
  progress,
}: {
  progress: number;
}) {
  return (
    <div
      className="transition-all rounded-full h-3 bg-neutral-900"
      style={{
        width: `${Math.max(12, progress)}%`,
        animation: "fadeIn 1s ease-in",
      }}
    />
  );
});

export function FeatureCarousel({ slides }: { slides: FeatureSlide[] }) {
  const [active, setActive] = useState(0);
  const [selectedDot, setSelectedDot] = useState(0);
  const [progress, setProgress] = useState(0);
  const [, startTransition] = useTransition();
  const [changing, setChanging] = useState(false);
  const [title, setTitle] = useState(slides[0]?.title ?? "");
  const [tagline, setTagline] = useState(slides[0]?.tagline ?? "");
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    startTransition(() => {
      setProgress((value) => {
        if (value >= 100) {
          const next = (active + 1) % slides.length;
          setActive(next);
          setSelectedDot(next);
          return 0;
        }
        return value + 100 / (slideDuration / tickInterval);
      });
    });
  }, [active, slides.length]);

  useEffect(() => {
    if (interval.current) clearInterval(interval.current);
    setProgress(0);
    interval.current = setInterval(tick, tickInterval);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [active, tick]);

  useEffect(() => {
    const nextTitle = slides[active]?.title ?? "";
    const nextTagline = slides[active]?.tagline ?? "";
    if (nextTitle === title && nextTagline === tagline) return;
    // Fade the heading out, swap its text, then fade it back in.
    setChanging(true);
    const timer = setTimeout(() => {
      setTitle(nextTitle);
      setTagline(nextTagline);
      setChanging(false);
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs only when the slide changes
  }, [active, slides]);

  const select = useCallback((index: number) => {
    startTransition(() => {
      setActive(index);
      setSelectedDot(index);
      setProgress(0);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24">
      <div className="flex flex-col items-center mb-8 min-h-[5rem]">
        <div
          className={`text-2xl sm:text-4xl text-center font-semibold tracking-tight text-neutral-900 mb-2 transition-all duration-300 ease-out ${changing ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
        >
          {title}
        </div>
        <div
          className={`text-base text-neutral-600 transition-all duration-300 ease-out delay-75 ${changing ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
        >
          {tagline}
        </div>
      </div>
      <Track slides={slides} activeIndex={active} onSelect={select} />
      <div className="flex gap-x-2 p-4 bg-neutral-100 rounded-full">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => select(index)}
            className={`transition-all duration-500 ease-out rounded-full h-3  ${selectedDot === index ? "bg-neutral-300 w-[100px]" : "bg-neutral-200 w-6 hover:bg-neutral-300"}`}
          >
            {selectedDot === index && <ProgressBar progress={progress} />}
          </button>
        ))}
      </div>
    </div>
  );
}
