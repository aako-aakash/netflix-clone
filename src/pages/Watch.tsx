import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pause,
  Play,
  Volume2,
  Maximize,
  Info,
} from "lucide-react";
import {
  getMovieDetails,
  getMovieVideos,
  pickBestTrailer,
  getYoutubeEmbedUrl,
  mapTmdbMovieToMockTitle,
} from "../lib/tmdb";
import { useContinueWatching } from "../hooks/useContinueWatching";
import { formatRuntime } from "../utils/format";
import type { MockTitle } from "../data/mock";

type MovieDetailsResponse = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  runtime?: number;
  adult?: boolean;
  genres?: { id: number; name: string }[];
  videos?: { results?: any[] };
};

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const continueWatching = useContinueWatching();

  const [movie, setMovie] = useState<MockTitle | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const [showChrome, setShowChrome] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // simulated progress for iframe-based trailer player
  const initialProgress = id ? continueWatching.progressById[Number(id)] ?? 0 : 0;
  const [progress, setProgress] = useState(initialProgress);

  useEffect(() => {
    let active = true;

    async function loadVideo() {
      if (!id) return;

      try {
        setLoading(true);

        const detailsRes: MovieDetailsResponse = await getMovieDetails(id, {
          append_to_response: "videos",
        });

        if (!active) return;

        const mapped = mapTmdbMovieToMockTitle(detailsRes);

        setMovie({
          ...mapped,
          runtime: detailsRes.runtime || mapped.runtime,
          year: Number(String(detailsRes.release_date || mapped.year).slice(0, 4)),
          maturity: detailsRes.adult ? "A" : mapped.maturity,
          rating: Number((detailsRes.vote_average || mapped.rating).toFixed(1)),
          genres: detailsRes.genres?.map((g) => g.name) ?? mapped.genres,
        });

        const videos = detailsRes.videos?.results || [];
        const trailer = pickBestTrailer(videos);

        if (trailer) {
          setVideoUrl(
            getYoutubeEmbedUrl(trailer.key) +
              "&autoplay=1&controls=1&modestbranding=1"
          );
        } else {
          setVideoUrl("");
        }
      } catch (err) {
        console.error("Failed to load player:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVideo();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!movie) return;
    setProgress(continueWatching.progressById[movie.id] ?? 0);
  }, [movie, continueWatching.progressById]);

  // auto-hide top/bottom chrome
  useEffect(() => {
    const onMove = () => {
      setShowChrome(true);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
    };
  }, []);

  useEffect(() => {
    if (!showChrome) return;

    const t = setTimeout(() => {
      setShowChrome(false);
    }, 2500);

    return () => clearTimeout(t);
  }, [showChrome]);

  // simulated auto-save watch progress
  useEffect(() => {
    if (!movie) return;
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(0.95, prev + 0.01);
        continueWatching.setProgress(movie, next);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [movie, isPlaying, continueWatching]);

  const handleBack = () => {
    if (movie) {
      continueWatching.setProgress(movie, progress);
    }
    navigate(-1);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleMarkAlmostDone = () => {
    if (!movie) return;
    const next = 0.95;
    setProgress(next);
    continueWatching.setProgress(movie, next);
  };

  const resumeText = useMemo(() => {
    if (!movie) return "";
    if (progress <= 0.02) return "Starting now";
    if (progress >= 0.9) return "Almost finished";
    return `Resume at ${Math.round(progress * 100)}%`;
  }, [movie, progress]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black text-white"
      onMouseMove={() => setShowChrome(true)}
      onClick={() => setShowChrome(true)}
    >
      {/* player area */}
      <div className="absolute inset-0">
        {loading ? (
          <div className="flex h-full items-center justify-center text-white/70">
            Loading player...
          </div>
        ) : videoUrl ? (
          <iframe
            src={videoUrl}
            className="h-full w-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={movie?.title || "Watch"}
          />
        ) : movie?.backdrop ? (
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="h-full w-full object-cover opacity-80"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/60">
            No trailer available
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/45" />
      </div>

      {/* top controls */}
      <div
        className={[
          "absolute left-0 right-0 top-0 z-20 transition-all duration-300",
          showChrome ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3",
        ].join(" ")}
      >
        <div className="flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="rounded-full bg-black/45 p-2 hover:bg-black/70"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <div className="text-sm text-white/60">Now Playing</div>
              <div className="text-base font-semibold md:text-lg">
                {movie?.title ?? "Watch"}
              </div>
            </div>
          </div>

          {movie && (
            <div className="hidden items-center gap-3 md:flex text-sm text-white/75">
              <span>{movie.year}</span>
              <span>{formatRuntime(movie.runtime)}</span>
              <span>{resumeText}</span>
            </div>
          )}
        </div>
      </div>

      {/* bottom controls */}
      <div
        className={[
          "absolute bottom-0 left-0 right-0 z-20 transition-all duration-300",
          showChrome ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        ].join(" ")}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-5 pt-16 md:px-6">
          {/* progress */}
          <div className="mb-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-white/60">
              <span>{resumeText}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          </div>

          {/* controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlay}
                className="rounded-full bg-white p-3 text-black hover:bg-white/90"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
              </button>

              <button
                onClick={handleMarkAlmostDone}
                className="rounded-full border border-white/20 bg-white/5 p-3 text-white hover:bg-white/10"
                aria-label="Mark progress"
              >
                <Volume2 size={18} />
              </button>

              <button
                onClick={() => navigate(`/movie/${id}`)}
                className="rounded-full border border-white/20 bg-white/5 p-3 text-white hover:bg-white/10"
                aria-label="Movie info"
              >
                <Info size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/75">
              <button
                onClick={() => navigate(`/movie/${id}`)}
                className="rounded-md border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                Back to Details
              </button>

              <button
                className="rounded-full border border-white/20 bg-white/5 p-3 text-white hover:bg-white/10"
                aria-label="Fullscreen"
              >
                <Maximize size={18} />
              </button>
            </div>
          </div>

          {/* metadata */}
          {movie && (
            <div className="mt-4 hidden md:block">
              <div className="text-sm font-medium text-white/90">{movie.title}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/60">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-white/15 px-2 py-0.5"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}