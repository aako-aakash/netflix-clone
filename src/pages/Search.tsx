import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import TitleModal from "../components/TitleModal";
import ResultsGrid from "../components/ResultsGrid";
import TrailerPlayer from "../components/TrailerPlayer";
import type { MockTitle } from "../data/mock";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useMyList } from "../hooks/useMyList";
import { useContinueWatching } from "../hooks/useContinueWatching";
import {
  searchMovies,
  getMovieVideos,
  pickBestTrailer,
  getYoutubeEmbedUrl,
} from "../lib/tmdb";
import { X } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MockTitle | null>(null);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [results, setResults] = useState<MockTitle[]>([]);
  const [loading, setLoading] = useState(false);

  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerTitle, setPlayerTitle] = useState("");
  const [playerTrailerUrl, setPlayerTrailerUrl] = useState("");

  const recent = useRecentSearches();
  const myList = useMyList();
  const continueWatching = useContinueWatching();

  const openTrailerPlayer = async (item: MockTitle) => {
    try {
      const videos = await getMovieVideos(item.id);
      const trailer = pickBestTrailer(videos);
      const url = trailer ? getYoutubeEmbedUrl(trailer.key) : "";

      setPlayerTitle(item.title);
      setPlayerTrailerUrl(url);
      setPlayerOpen(true);
    } catch (error) {
      console.error("Search trailer open failed:", error);
      setPlayerTitle(item.title);
      setPlayerTrailerUrl("");
      setPlayerOpen(true);
    }
  };

  const handlePlay = async (item: MockTitle) => {
    continueWatching.play(item);
    await openTrailerPlayer(item);
  };

  const pickRecent = async (q: string) => {
    setQuery(q);
    setSubmittedOnce(true);
    setLoading(true);

    try {
      const data = await searchMovies(q);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    recent.add(query);
    setLoading(true);

    try {
      const data = await searchMovies(query);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = document.getElementById("searchInput") as HTMLInputElement | null;
    el?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-20 mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Search</h1>
            <p className="mt-1 text-white/60 text-sm">
              Search real movie results from TMDB.
            </p>
          </div>

          {recent.items.length > 0 && (
            <button
              onClick={recent.clear}
              className="text-sm text-white/70 hover:text-white underline underline-offset-4"
            >
              Clear recent
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-6">
          <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2">
            <input
              id="searchInput"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a movie…"
              className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
            />

            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setSubmittedOnce(false);
                }}
                className="rounded-md p-1 text-white/70 hover:text-white hover:bg-white/10"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}

            <button
              type="submit"
              className="rounded-md bg-white px-4 py-1.5 text-black font-semibold hover:bg-white/90"
            >
              Search
            </button>
          </div>
        </form>

        {recent.items.length > 0 && !submittedOnce && query.trim().length === 0 && (
          <div className="mt-5">
            <div className="text-white/70 text-sm mb-2">Recent searches</div>
            <div className="flex flex-wrap gap-2">
              {recent.items.map((q) => (
                <button
                  key={q}
                  onClick={() => pickRecent(q)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="text-white/55">Searching...</div>
          ) : query.trim().length === 0 ? (
            <div className="text-white/55">Type something to search.</div>
          ) : results.length > 0 ? (
            <>
              <div className="mb-4 text-white/70 text-sm">
                Showing {results.length} result{results.length === 1 ? "" : "s"} for{" "}
                <span className="text-white">“{query.trim()}”</span>
              </div>

              <ResultsGrid
                items={results}
                onPick={setSelected}
                isInList={myList.isInList}
                onToggleList={myList.toggle}
              />
            </>
          ) : (
            submittedOnce && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-white/70">
                No results found for <span className="text-white">“{query.trim()}”</span>.
              </div>
            )
          )}
        </div>
      </main>

      <Footer />

      {selected && (
        <TitleModal
          item={selected}
          onClose={() => setSelected(null)}
          isInList={myList.isInList(selected.id)}
          onToggleList={myList.toggle}
          onPlay={handlePlay}
        />
      )}

      <TrailerPlayer
        open={playerOpen}
        title={playerTitle}
        trailerUrl={playerTrailerUrl}
        onClose={() => setPlayerOpen(false)}
      />
    </div>
  );
}