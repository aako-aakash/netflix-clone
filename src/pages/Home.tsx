import { useCallback, useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import HeroBanner from "../components/HeroBanner";
import Row from "../components/Row";
import TitleModal from "../components/TitleModal";
import RowSkeleton from "../components/RowSkeleton";
import TrailerPlayer from "../components/TrailerPlayer";
import type { MockTitle } from "../data/mock";
import { useMyList } from "../hooks/useMyList";
import { useContinueWatching } from "../hooks/useContinueWatching";
import {
  getTrendingMovies,
  getTopRatedMovies,
  getActionMovies,
  getComedyMovies,
  getTrendingTV,
  getTopRatedTV,
  getRecommendations,
  getMovieVideos,
  pickBestTrailer,
  getYoutubeEmbedUrl,
} from "../lib/tmdb";

type HomeRow = {
  id: string;
  title: string;
  items: MockTitle[];
};

export default function Home() {
  const [selected, setSelected] = useState<MockTitle | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<HomeRow[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroTrailerUrl, setHeroTrailerUrl] = useState("");

  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerTitle, setPlayerTitle] = useState("");
  const [playerTrailerUrl, setPlayerTrailerUrl] = useState("");

  const myList = useMyList();
  const continueWatching = useContinueWatching();

  useEffect(() => {
    let mounted = true;

    async function loadHome() {
      try {
        const [trending, topRated, action, comedy, trendingTV, topTV] = await Promise.all([
          getTrendingMovies(),
          getTopRatedMovies(),
          getActionMovies(),
          getComedyMovies(),
          getTrendingTV(),
          getTopRatedTV(),
        ]);

        if (!mounted) return;

        const newRows = [
          { id: "trending", title: "Trending Now", items: trending },
          { id: "top", title: "Top Rated Movies", items: topRated },
          { id: "action", title: "Action Movies", items: action },
          { id: "comedy", title: "Comedies", items: comedy },
          { id: "tv-trending", title: "Trending TV Shows", items: trendingTV },
          { id: "tv-top", title: "Top Rated TV Shows", items: topTV },
        ];

        const recSource = continueWatching.items[0];

        if (recSource) {
          try {
            const recommended = await getRecommendations(recSource.id);

            if (recommended.length > 0) {
              newRows.unshift({
                id: "recommended",
                title: `Because you watched ${recSource.title}`,
                items: recommended.slice(0, 20),
              });
            }
          } catch (error) {
            console.error("Failed to load recommendations:", error);
          }
        }

        setRows(newRows);
      } catch (err) {
        console.error("Failed loading TMDB:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHome();

    return () => {
      mounted = false;
    };
  }, []);

  const allTitles = useMemo(() => {
    const map = new Map<number, MockTitle>();

    rows.forEach((row) => {
      row.items.forEach((item) => {
        map.set(item.id, item);
      });
    });

    return Array.from(map.values());
  }, [rows]);

  const pickRandomIndex = useCallback(
    (excludeIndex?: number) => {
      if (allTitles.length <= 1) return 0;

      let idx = Math.floor(Math.random() * allTitles.length);

      while (excludeIndex !== undefined && idx === excludeIndex) {
        idx = Math.floor(Math.random() * allTitles.length);
      }

      return idx;
    },
    [allTitles.length]
  );

  const heroItem = allTitles[heroIndex] ?? null;

  useEffect(() => {
    if (allTitles.length > 0) {
      setHeroIndex(pickRandomIndex());
    }
  }, [allTitles, pickRandomIndex]);

  useEffect(() => {
    if (allTitles.length === 0) return;
    if (heroPaused) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => pickRandomIndex(prev));
    }, 20000);

    return () => clearInterval(interval);
  }, [allTitles.length, heroPaused, pickRandomIndex]);

  useEffect(() => {
    let active = true;

    async function loadHeroTrailer() {
      if (!heroItem?.id) {
        setHeroTrailerUrl("");
        return;
      }

      try {
        const videos = await getMovieVideos(heroItem.id);
        if (!active) return;

        const trailer = pickBestTrailer(videos);
        const url = trailer
          ? getYoutubeEmbedUrl(trailer.key) + "&playlist=" + trailer.key
          : "";

        setHeroTrailerUrl(url);
      } catch (error) {
        console.error("Failed to load hero trailer:", error);
        if (active) setHeroTrailerUrl("");
      }
    }

    loadHeroTrailer();

    return () => {
      active = false;
    };
  }, [heroItem?.id]);

  const openTrailerPlayer = useCallback(async (item: MockTitle) => {
    try {
      const videos = await getMovieVideos(item.id);
      const trailer = pickBestTrailer(videos);
      const url = trailer ? getYoutubeEmbedUrl(trailer.key) : "";

      setPlayerTitle(item.title);
      setPlayerTrailerUrl(url);
      setPlayerOpen(true);
    } catch (error) {
      console.error("Failed to open trailer player:", error);
      setPlayerTitle(item.title);
      setPlayerTrailerUrl("");
      setPlayerOpen(true);
    }
  }, []);

  const handlePick = useCallback((item: MockTitle) => {
    setSelected(item);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const handleMoreInfo = useCallback(() => {
    if (heroItem) setSelected(heroItem);
  }, [heroItem]);

  const handleNextHero = useCallback(() => {
    setHeroIndex((prev) => pickRandomIndex(prev));
  }, [pickRandomIndex]);

  const handlePlay = useCallback(
    async (item: MockTitle) => {
      continueWatching.play(item);
      await openTrailerPlayer(item);
    },
    [continueWatching, openTrailerPlayer]
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-14">
        <div
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          {heroItem ? (
            <HeroBanner
              item={heroItem}
              onMoreInfo={handleMoreInfo}
              onNext={handleNextHero}
              onPlay={handlePlay}
              trailerUrl={heroTrailerUrl}
            />
          ) : (
            <div className="h-[70vh] min-h-[520px] bg-black" />
          )}
        </div>

        <div className="pb-16">
          {loading ? (
            <>
              <RowSkeleton title="Continue Watching" />
              <RowSkeleton title="My List" />
              <RowSkeleton title="Trending Now" />
              <RowSkeleton title="Top Rated" />
              <RowSkeleton title="Action Movies" />
              <RowSkeleton title="Comedies" />
            </>
          ) : (
            <>
              {continueWatching.items.length > 0 && (
                <Row
                  title="Continue Watching"
                  items={continueWatching.items}
                  onPick={handlePick}
                  isInList={myList.isInList}
                  onToggleList={myList.toggle}
                  progressById={continueWatching.progressById}
                  onPreviewActiveChange={setHeroPaused}
                />
              )}

              {myList.list.length > 0 && (
                <Row
                  title="My List"
                  items={myList.list}
                  onPick={handlePick}
                  isInList={myList.isInList}
                  onToggleList={myList.toggle}
                  onPreviewActiveChange={setHeroPaused}
                />
              )}

              {rows.map((row) => (
                <Row
                  key={row.id}
                  title={row.title}
                  items={row.items}
                  onPick={handlePick}
                  isInList={myList.isInList}
                  onToggleList={myList.toggle}
                  onPreviewActiveChange={setHeroPaused}
                />
              ))}
            </>
          )}
        </div>
      </main>
      
      <Footer/>
      
      {selected && (
        <TitleModal
          item={selected}
          onClose={handleClose}
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