import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { MockTitle } from "../data/mock";
import PosterCard from "./PosterCard";

export default function Row({
  title,
  items,
  onPick,
  isInList,
  onToggleList,
  progressById,
  onPreviewActiveChange,
}: {
  title: string;
  items: MockTitle[];
  onPick: (item: MockTitle) => void;
  isInList?: (id: number) => boolean;
  onToggleList?: (item: MockTitle) => void;
  progressById?: Record<number, number>;
  onPreviewActiveChange?: (active: boolean) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-6">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-3 text-lg font-semibold text-white/90">{title}</h2>

        <div className="group relative">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-black to-transparent" />

          <button
            onClick={() => scrollByAmount("left")}
            className="absolute left-0 top-[38%] z-20 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 text-white/90 hover:bg-black/80 group-hover:block"
            aria-label="Scroll left"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => scrollByAmount("right")}
            className="absolute right-0 top-[38%] z-20 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 text-white/90 hover:bg-black/80 group-hover:block"
            aria-label="Scroll right"
          >
            <ChevronRight />
          </button>

          <div
            ref={scrollerRef}
            className="hide-scrollbar flex gap-3 overflow-x-auto overflow-y-visible scroll-smooth py-1 pb-28"
          >
            {items.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                onClick={onPick}
                isInList={isInList ? isInList(item.id) : false}
                onToggleList={onToggleList}
                progress={progressById ? progressById[item.id] : undefined}
                onPreviewActiveChange={onPreviewActiveChange}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}