import type { MockTitle } from "../data/mock";
import { useEffect, useState } from "react";
import {
  Plus,
  Check,
  Play,
  ExternalLink,
  LoaderCircle,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHoverPreview } from "../hooks/useHoverPreview";
import {
  getMovieVideos,
  pickBestTrailer,
  getYoutubeEmbedUrl,
} from "../lib/tmdb";

export default function PosterCard({
  item,
  onClick,
  isInList = false,
  onToggleList,
  progress,
  onPreviewActiveChange,
}: {
  item: MockTitle;
  onClick: (item: MockTitle) => void;
  isInList?: boolean;
  onToggleList?: (item: MockTitle) => void;
  progress?: number;
  onPreviewActiveChange?: (active: boolean) => void;
}) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const { active, shouldLoad, onEnter, onLeave } = useHoverPreview(500);

  const pct =
    progress !== undefined ? Math.max(0, Math.min(1, progress)) : undefined;

  useEffect(() => {
    onPreviewActiveChange?.(active);
  }, [active, onPreviewActiveChange]);

  useEffect(() => {
    let activeRequest = true;

    async function loadPreview() {
      if (!shouldLoad) {
        setPreviewUrl("");
        setPreviewLoading(false);
        return;
      }

      try {
        setPreviewLoading(true);
        const videos = await getMovieVideos(item.id);
        if (!activeRequest) return;

        const trailer = pickBestTrailer(videos);
        const url = trailer
          ? `${getYoutubeEmbedUrl(trailer.key)}&mute=1&autoplay=1`
          : "";

        setPreviewUrl(url);
      } catch (error) {
        console.error("Hover preview failed:", error);
        if (!activeRequest) return;
        setPreviewUrl("");
      } finally {
        if (activeRequest) setPreviewLoading(false);
      }
    }

    loadPreview();

    return () => {
      activeRequest = false;
    };
  }, [item.id, shouldLoad]);

  return (
    <div
      className="relative shrink-0 group"
      style={{ width: 180 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* base poster */}
      <button
        onClick={() => onClick(item)}
        className="relative w-full overflow-hidden rounded-md border border-white/10 bg-white/5 transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/30"
        title={item.title}
      >
        {!loaded && <div className="absolute inset-0 animate-pulse bg-white/10" />}

        <img
          src={item.poster}
          alt={item.title}
          className={[
            "h-[270px] w-[180px] object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {pct !== undefined && (
          <div className="absolute left-0 right-0 bottom-0 p-2">
            <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-red-600" style={{ width: `${pct * 100}%` }} />
            </div>
          </div>
        )}
      </button>

      {/* expanded hover card */}
      <div
        className={[
          "pointer-events-none absolute left-1/2 top-[-14px] z-40 w-[320px] -translate-x-1/2",
          "opacity-0 scale-95 transition-all duration-200",
          active ? "group-hover:opacity-100 group-hover:scale-100" : "",
        ].join(" ")}
      >
        <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="relative h-[180px] w-full bg-black">
            {shouldLoad && previewUrl ? (
              <iframe
                src={previewUrl}
                title={`${item.title} preview`}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img
                src={item.backdrop}
                alt={item.title}
                className="h-full w-full object-cover opacity-90"
              />
            )}

            {previewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <LoaderCircle size={24} className="animate-spin text-white/80" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

            {previewUrl && !previewLoading && (
              <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/45 px-2 py-1 text-[10px] text-white/80">
                muted preview
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base font-semibold text-white line-clamp-1">
                  {item.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/65">
                  <span className="text-emerald-400 font-semibold">
                    {item.match}% Match
                  </span>
                  <span>{item.year}</span>
                  <span className="rounded border border-white/15 px-1.5 py-0.5">
                    {item.maturity ?? "U/A"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onClick(item)}
                className="rounded-full border border-white/20 bg-white/5 p-2 text-white hover:bg-white/10"
                aria-label="More info"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onClick(item)}
                className="rounded-full bg-white p-2 text-black hover:bg-white/90"
                aria-label="Play"
              >
                <Play size={16} fill="black" />
              </button>

              {onToggleList && (
                <button
                  onClick={() => onToggleList(item)}
                  className="rounded-full border border-white/20 bg-white/5 p-2 text-white hover:bg-white/10"
                  aria-label={isInList ? "Remove from My List" : "Add to My List"}
                >
                  {isInList ? <Check size={16} /> : <Plus size={16} />}
                </button>
              )}

              <button
                onClick={() => navigate(`/movie/${item.id}`)}
                className="rounded-full border border-white/20 bg-white/5 p-2 text-white hover:bg-white/10"
                aria-label="View details"
              >
                <ExternalLink size={16} />
              </button>
            </div>

            {pct !== undefined && (
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-red-600" style={{ width: `${pct * 100}%` }} />
                </div>
                <div className="mt-1 text-[11px] text-white/50">
                  {Math.round(pct * 100)}% watched
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-white/60 line-clamp-2">
              {item.overview}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/65">
              <span className="rounded-full border border-white/15 px-2 py-0.5">
                HD
              </span>
              <span className="rounded-full border border-white/15 px-2 py-0.5">
                {item.maturity ?? "U/A"}
              </span>
              <span className="rounded-full border border-white/15 px-2 py-0.5">
                {item.genres?.[0] ?? "Movie"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}