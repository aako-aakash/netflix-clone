import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clapperboard, Play, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import Row from "../components/Row";
import TrailerPlayer from "../components/TrailerPlayer";
import type { MockTitle } from "../data/mock";
import { useMyList } from "../hooks/useMyList";
import { useContinueWatching } from "../hooks/useContinueWatching";
import {
  getMovieDetails,
  pickBestTrailer,
  getYoutubeEmbedUrl,
  mapTmdbMovieToMockTitle,
} from "../lib/tmdb";
import { formatRuntime } from "../utils/format";

type MovieDetailsResponse = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  runtime?: number;
  adult?: boolean;
  genres?: { id: number; name: string }[];
  recommendations?: { results?: any[] };
  videos?: { results?: any[] };
};

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const myList = useMyList();
  const continueWatching = useContinueWatching();

  const [movie, setMovie] = useState<MockTitle | null>(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [related, setRelated] = useState<MockTitle[]>([]);
  const [loading, setLoading] = useState(true);

  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerTitle, setPlayerTitle] = useState("");
  const [playerTrailerUrl, setPlayerTrailerUrl] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMoviePage() {
      if (!id) return;

      try {
        setLoading(true);

        const detailsRes: MovieDetailsResponse = await getMovieDetails(id, {
          append_to_response: "videos,recommendations",
        });

        if (!active) return;

        const mapped = mapTmdbMovieToMockTitle(detailsRes);
        const realGenres =
          detailsRes.genres?.map((g) => g.name) ?? mapped.genres;

        setMovie({
          ...mapped,
          runtime: detailsRes.runtime || mapped.runtime,
          year: Number(String(detailsRes.release_date || mapped.year).slice(0, 4)),
          maturity: detailsRes.adult ? "A" : mapped.maturity,
          rating: Number((detailsRes.vote_average || mapped.rating).toFixed(1)),
          genres: realGenres,
        });

        const videos = detailsRes.videos?.results || [];
        const trailer = pickBestTrailer(videos);
        setTrailerUrl(trailer ? getYoutubeEmbedUrl(trailer.key) : "");

        const recs = detailsRes.recommendations?.results || [];
        setRelated(recs.slice(0, 12).map(mapTmdbMovieToMockTitle));
      } catch (error) {
        console.error("Failed to load movie detail page:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMoviePage();

    return () => {
      active = false;
    };
  }, [id]);

  const handlePlay = (item: MockTitle) => {
    continueWatching.play(item);
    navigate(`/watch/${item.id}`);
  };

  const handleTrailerPreview = () => {
    if (!movie) return;
    setPlayerTitle(movie.title);
    setPlayerTrailerUrl(trailerUrl);
    setPlayerOpen(true);
  };

  const heroImage = useMemo(() => {
    if (!movie) return "";
    return movie.backdrop || movie.poster;
  }, [movie]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-24 mx-auto max-w-6xl px-4">
          <div className="animate-pulse">
            <div className="h-[420px] rounded-2xl bg-white/10" />
            <div className="mt-6 h-10 w-80 rounded bg-white/10" />
            <div className="mt-4 h-5 w-56 rounded bg-white/10" />
            <div className="mt-6 h-24 w-full rounded bg-white/10" />
          </div>
        </main>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-24 mx-auto max-w-6xl px-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="mt-8 text-white/70">Movie not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-14">
        <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
          {trailerUrl ? (
            <iframe
              src={trailerUrl}
              title={`${movie.title} trailer`}
              className="absolute inset-0 h-full w-full scale-[1.18]"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              src={heroImage}
              alt={movie.title}
              className="absolute inset-0 h-full w-full object-cover opacity-90 contrast-110 brightness-105"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
          <div className="absolute inset-0 hero-grain opacity-[0.05] mix-blend-overlay pointer-events-none" />

          <div className="relative mx-auto flex h-full max-w-6xl items-end px-4 pb-20">
            <div className="max-w-2xl">
              <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-4 py-2 text-sm hover:bg-black/45"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <h1 className="netflix-title text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                {movie.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
                <span className="text-emerald-400 font-semibold">{movie.match}% Match</span>
                <span>{movie.year}</span>
                <span className="rounded border border-white/20 px-2 py-0.5 text-xs">
                  {movie.maturity}
                </span>
                <span>{formatRuntime(movie.runtime)}</span>
                <span className="inline-flex items-center gap-1">
                  <Star size={14} fill="currentColor" />
                  {movie.rating.toFixed(1)}
                </span>
              </div>

              <p className="mt-5 max-w-xl text-white/80 text-lg leading-relaxed">
                {movie.overview}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handlePlay(movie)}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-7 py-3 text-black font-semibold hover:bg-white/90 transition"
                >
                  <Play size={20} fill="black" />
                  Play
                </button>

                <button
                  onClick={() => myList.toggle(movie)}
                  className="rounded-md bg-white/10 px-6 py-3 text-white font-semibold border border-white/15 hover:bg-white/15 transition"
                >
                  {myList.isInList(movie.id) ? "In My List" : "Add to My List"}
                </button>

                {trailerUrl && (
                  <button
                    onClick={handleTrailerPreview}
                    className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/75 hover:bg-black/45 transition"
                  >
                    <Clapperboard size={16} />
                    Trailer Preview
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 className="text-2xl font-semibold">About this title</h2>
              <p className="mt-4 text-white/75 leading-relaxed">
                {movie.overview}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold">Details</h3>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Release Year</span>
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Runtime</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Rating</span>
                  <span>{movie.rating.toFixed(1)}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Maturity</span>
                  <span>{movie.maturity}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="pb-16">
            <Row
              title="More Like This"
              items={related}
              onPick={(item) => navigate(`/movie/${item.id}`)}
              isInList={myList.isInList}
              onToggleList={myList.toggle}
            />
          </section>
        )}
      </main>

      <Footer/>

      <TrailerPlayer
        open={playerOpen}
        title={playerTitle}
        trailerUrl={playerTrailerUrl}
        onClose={() => setPlayerOpen(false)}
      />
    </div>
  );
}
