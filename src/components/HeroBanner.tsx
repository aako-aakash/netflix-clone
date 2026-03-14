import type { MockTitle } from "../data/mock";
import { Play, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeroBanner({
  item,
  onMoreInfo,
  onNext,
  onPlay,
  trailerUrl,
}: {
  item: MockTitle;
  onMoreInfo?: () => void;
  onNext?: () => void;
  onPlay?: (item: MockTitle) => void;
  trailerUrl?: string;
}) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((k) => k + 1);
  }, [item?.id]);

  return (
    <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
      <div key={key} className="absolute inset-0">
        {trailerUrl ? (
          <iframe
            src={trailerUrl}
            title={`${item.title} hero trailer`}
            className="absolute inset-0 h-full w-full scale-[1.18]"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img
            src={item.backdrop}
            alt={item.title}
            className="hero-kenburns absolute inset-0 h-full w-full object-cover opacity-90 contrast-110 brightness-105"
          />
        )}

        {/* overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />
        <div className="absolute inset-0 hero-grain opacity-[0.06] mix-blend-overlay pointer-events-none" />
      </div>

      <div className="relative mx-auto flex h-full max-w-6xl items-end px-4 pb-24">
        <div className="max-w-xl">
          <h1 className="netflix-title text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            {item.title}
          </h1>

          <p className="mt-5 text-white/80 text-lg leading-relaxed line-clamp-3">
            {item.overview}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlay?.(item)}
              className="flex items-center gap-2 rounded-md bg-white px-7 py-3 text-black font-semibold hover:bg-white/90 transition"
            >
              <Play size={20} fill="black" />
              Play
            </button>

            <button
              onClick={onMoreInfo}
              className="rounded-md bg-white/10 px-6 py-3 text-white font-semibold border border-white/15 hover:bg-white/15 transition"
            >
              More Info
            </button>

            {onNext && (
              <button
                onClick={onNext}
                className="rounded-md bg-white/5 px-4 py-3 text-white/90 border border-white/10 hover:bg-white/10 transition"
              >
                Next
              </button>
            )}

            {trailerUrl && (
              <div className="ml-1 inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/75">
                <VolumeX size={16} />
                Muted Preview
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}