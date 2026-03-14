import {
  X,
  Play,
  Plus,
  Check,
  Clapperboard,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";
import type { MockTitle } from "../data/mock";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatRuntime } from "../utils/format";
import {
  getMovieDetails,
  getMovieVideos,
  pickBestTrailer,
  getYoutubeEmbedUrl,
} from "../lib/tmdb";

function RatingPill({ value }: { value: number }) {
  const pct = Math.round((value / 10) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-white/70" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-white/70">{value.toFixed(1)}/10</div>
    </div>
  );
}

type MovieDetailsData = {
  runtime?: number;
  genres?: { id: number; name: string }[];
  release_date?: string;
  adult?: boolean;
  vote_average?: number;
};

type VideoData = {
  key: string;
  site: string;
  type: string;
  official?: boolean;
  iso_639_1?: string;
};

export default function TitleModal({
  item,
  onClose,
  isInList,
  onToggleList,
  onPlay,
}: {
  item: MockTitle;
  onClose: () => void;
  isInList: boolean;
  onToggleList: (item: MockTitle) => void;
  onPlay?: (item: MockTitle) => void;
}) {
  const navigate = useNavigate();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const [details, setDetails] = useState<MovieDetailsData | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadExtraData() {
      try {
        setDetailsLoading(true);
        setShowTrailer(false);

        const [detailsRes, videosRes] = await Promise.all([
          getMovieDetails(item.id),
          getMovieVideos(item.id),
        ]);

        if (!active) return;

        setDetails(detailsRes || null);
        setVideos(videosRes || []);
      } catch (error) {
        console.error("Failed to load movie modal data:", error);
        if (!active) return;
        setDetails(null);
        setVideos([]);
      } finally {
        if (active) setDetailsLoading(false);
      }
    }

    loadExtraData();

    return () => {
      active = false;
    };
  }, [item.id]);

  const trailer = useMemo(() => pickBestTrailer(videos), [videos]);
  const trailerUrl = trailer ? getYoutubeEmbedUrl(trailer.key) : "";

  const genres =
    details?.genres?.map((g) => g.name) && details.genres.length > 0
      ? details.genres.map((g) => g.name)
      : item.genres ?? [];

  const runtime = details?.runtime || item.runtime;
  const year = details?.release_date?.slice(0, 4) || String(item.year || "");
  const maturity = details?.adult === true ? "A" : item.maturity ?? "U/A 16+";
  const rating = details?.vote_average || item.rating;

  const handleViewDetails = () => {
    navigate(`/movie/${item.id}`);
    setTimeout(() => {
      closeRef.current();
    }, 0);
  };

  const handlePlayClick = () => {
    if (onPlay) {
      onPlay(item);
    } else {
      navigate(`/watch/${item.id}`);
      closeRef.current();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
      onClick={() => closeRef.current()}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => closeRef.current()}
          className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="relative h-[340px] w-full bg-black">
          {showTrailer && trailerUrl ? (
            <iframe
              src={trailerUrl}
              title={`${item.title} trailer`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={item.backdrop}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/10" />
            </>
          )}

          <div className="relative h-full flex items-end p-6">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {item.title}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/80">
                <span className="text-emerald-400 font-semibold">
                  {item.match}% Match
                </span>
                <span>{year}</span>
                <span className="rounded border border-white/20 px-2 py-0.5 text-xs">
                  {maturity}
                </span>
                <span>{formatRuntime(runtime)}</span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePlayClick}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 text-black font-semibold hover:bg-white/90"
                >
                  <Play size={18} />
                  Play
                </button>

                <button
                  onClick={() => onToggleList(item)}
                  className="inline-flex items-center gap-2 rounded-md bg-white/10 px-6 py-2.5 text-white font-semibold border border-white/15 hover:bg-white/15"
                >
                  {isInList ? <Check size={18} /> : <Plus size={18} />}
                  {isInList ? "In My List" : "Add to My List"}
                </button>

                <button
                  onClick={() => trailer && setShowTrailer((prev) => !prev)}
                  disabled={!trailer}
                  className="inline-flex items-center gap-2 rounded-md bg-white/5 px-5 py-2.5 text-white/90 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={trailer ? "Watch trailer" : "Trailer not available"}
                >
                  <Clapperboard size={18} />
                  {showTrailer ? "Hide Trailer" : "Trailer"}
                </button>

                <button
                  onClick={handleViewDetails}
                  className="inline-flex items-center gap-2 rounded-md bg-white/5 px-5 py-2.5 text-white/90 border border-white/10 hover:bg-white/10"
                >
                  <ExternalLink size={18} />
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <p className="text-white/80 leading-relaxed">{item.overview}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {genres.length > 0 ? (
                  genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75"
                    >
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75">
                    Movie
                  </span>
                )}
              </div>

              {showTrailer && trailer && (
                <div className="mt-5 text-xs text-white/50">
                  Now playing: {trailer.type}
                </div>
              )}
            </div>

            <div className="md:col-span-1">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white/90 flex items-center gap-2">
                  <Clapperboard size={16} />
                  Details
                </div>

                {detailsLoading ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
                    <LoaderCircle size={16} className="animate-spin" />
                    Loading details...
                  </div>
                ) : (
                  <div className="mt-3 space-y-3 text-sm text-white/70">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/50">Rating</span>
                      <RatingPill value={rating} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Year</span>
                      <span>{year}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Runtime</span>
                      <span>{formatRuntime(runtime)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Maturity</span>
                      <span>{maturity}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Trailer</span>
                      <span>{trailer ? "Available" : "Not available"}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-white/40">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-white/40">
            <span className="inline-flex items-center gap-2">
              <Clapperboard size={14} />
              Netflix Clone UI
            </span>
            <span>ID: #{item.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}