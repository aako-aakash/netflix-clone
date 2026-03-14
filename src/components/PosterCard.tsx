import type { MockTitle } from "../data/mock";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Check,
  Play,
  ExternalLink,
  LoaderCircle,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  activePreviewId,
  onPreviewChange,
}: {
  item: MockTitle;
  onClick: (item: MockTitle) => void;
  isInList?: boolean;
  onToggleList?: (item: MockTitle) => void;
  progress?: number;
  activePreviewId: number | null;
  onPreviewChange: (id: number | null) => void;
}) {
  const navigate = useNavigate();

  const [loaded, setLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const timerRef = useRef<number | null>(null);

  const isExpanded = activePreviewId === item.id;

  const pct =
    progress !== undefined ? Math.max(0, Math.min(1, progress)) : undefined;

  const handleMouseEnter = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      onPreviewChange(item.id);
    }, 450);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (activePreviewId === item.id) {
      onPreviewChange(null);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      if (!isExpanded) {
        setPreviewUrl("");
        setPreviewLoading(false);
        return;
      }

      try {
        setPreviewLoading(true);

        const videos = await getMovieVideos(item.id);

        if (!active) return;

        const trailer = pickBestTrailer(videos);

        const url = trailer
          ? `${getYoutubeEmbedUrl(trailer.key)}&mute=1&autoplay=1`
          : "";

        setPreviewUrl(url);
      } catch (err) {
        console.error("Preview failed:", err);
        if (!active) return;
        setPreviewUrl("");
      } finally {
        if (active) setPreviewLoading(false);
      }
    }

    loadPreview();

    return () => {
      active = false;
    };
  }, [item.id, isExpanded]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative shrink-0"
      style={{ width: 180 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Poster */}
      <button
        onClick={() => onClick(item)}
        className="relative w-full overflow-hidden rounded-md border border-white/10 bg-white/5 transition-transform duration-200 hover:scale-[1.03]"
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-white/10" />
        )}

        <img
          src={item.poster}
          alt={item.title}
          className={`h-[270px] w-[180px] object-cover transition-opacity ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity hover:opacity-100" />

        {pct !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full bg-red-600"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
          </div>
        )}
      </button>

      {/* Expanded hover preview */}
      <div
        className={`absolute left-1/2 top-[-14px] z-40 w-[320px] -translate-x-1/2 transition-all duration-200 ${
          isExpanded
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="relative h-[180px] w-full bg-black">
            {isExpanded && previewUrl ? (
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
                <LoaderCircle size={24} className="animate-spin text-white" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          </div>

          <div className="p-4">
            <div className="text-base font-semibold text-white">
              {item.title}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => onClick(item)}
                className="rounded-full bg-white p-2 text-black"
              >
                <Play size={16} fill="black" />
              </button>

              {onToggleList && (
                <button
                  onClick={() => onToggleList(item)}
                  className="rounded-full border border-white/20 p-2 text-white"
                >
                  {isInList ? <Check size={16} /> : <Plus size={16} />}
                </button>
              )}

              <button
                onClick={() => navigate(`/movie/${item.id}`)}
                className="rounded-full border border-white/20 p-2 text-white"
              >
                <ExternalLink size={16} />
              </button>
            </div>

            <div className="mt-3 text-xs text-white/60 line-clamp-2">
              {item.overview}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}