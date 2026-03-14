const BASE_URL =
  import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const IMAGE_URL =
  import.meta.env.VITE_TMDB_IMAGE_URL || "https://image.tmdb.org/t/p";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=500&q=60";
const FALLBACK_BACKDROP =
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=60";

async function tmdbFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB request failed: ${res.status} ${text}`);
  }

  return res.json();
}

export function toImageUrl(path, size = "w500") {
  if (!path) return "";
  return `${IMAGE_URL}/${size}${path}`;
}

export function mapTmdbMovieToMockTitle(movie) {
  const title = movie.title || movie.name || "Untitled";

  return {
    id: movie.id,
    title,
    poster: movie.poster_path
      ? toImageUrl(movie.poster_path, "w500")
      : `${FALLBACK_POSTER}&sig=${movie.id}`,
    backdrop: movie.backdrop_path
      ? toImageUrl(movie.backdrop_path, "w1280")
      : `${FALLBACK_BACKDROP}&sig=${movie.id + 1000}`,
    overview: movie.overview || "No overview available for this title yet.",

    year: Number(
      String(movie.release_date || movie.first_air_date || "2024").slice(0, 4)
    ),
    runtime: 95 + (movie.id % 45),
    match: 75 + (movie.id % 24),
    rating: Number((movie.vote_average || 7.2).toFixed(1)),
    maturity: movie.adult ? "A" : "U/A 16+",
    genres: Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0
      ? ["Movie"]
      : ["Movie"],
  };
}

export async function getTrendingMovies() {
  const data = await tmdbFetch("/trending/movie/week");
  return (data.results || []).map(mapTmdbMovieToMockTitle);
}

export async function getTopRatedMovies() {
  const data = await tmdbFetch("/movie/top_rated");
  return (data.results || []).map(mapTmdbMovieToMockTitle);
}

export async function getActionMovies() {
  const data = await tmdbFetch("/discover/movie", {
    with_genres: 28,
    sort_by: "popularity.desc",
  });
  return (data.results || []).map(mapTmdbMovieToMockTitle);
}

export async function getComedyMovies() {
  const data = await tmdbFetch("/discover/movie", {
    with_genres: 35,
    sort_by: "popularity.desc",
  });
  return (data.results || []).map(mapTmdbMovieToMockTitle);
}

export async function searchMovies(query) {
  if (!query?.trim()) return [];
  const data = await tmdbFetch("/search/movie", {
    query: query.trim(),
    include_adult: false,
  });
  return (data.results || []).map(mapTmdbMovieToMockTitle);
}

/* ---------------------------
   NEW: Real details for modal
---------------------------- */

export async function getMovieDetails(movieId, params = {}) {
  const data = await tmdbFetch(`/movie/${movieId}`, params);
  return data;
}

export async function getMovieVideos(movieId) {
  const data = await tmdbFetch(`/movie/${movieId}/videos`);
  return data.results || [];
}

export function pickBestTrailer(videos) {
  if (!Array.isArray(videos) || videos.length === 0) return null;

  const youtubeVideos = videos.filter(
    (video) => video.site === "YouTube" && video.key
  );

  if (youtubeVideos.length === 0) return null;

  const trailer =
    youtubeVideos.find(
      (video) =>
        video.type === "Trailer" &&
        video.official === true &&
        video.iso_639_1 === "en"
    ) ||
    youtubeVideos.find((video) => video.type === "Trailer") ||
    youtubeVideos.find((video) => video.type === "Teaser") ||
    youtubeVideos[0];

  return trailer || null;
}

export function getYoutubeEmbedUrl(key) {
  if (!key) return "";
  return `https://www.youtube.com/embed/${key}?autoplay=1&mute=1&controls=1&rel=0`;
}



export async function getRecommendations(movieId) {
  const data = await tmdbFetch(`/movie/${movieId}/recommendations`);
  return (data.results || []).map(mapTmdbMovieToMockTitle);
}


export async function getTrendingTV() {
  const data = await tmdbFetch("/trending/tv/week");
  return (data.results || []).map(mapTmdbMovieToMockTitle);
}

export async function getTopRatedTV() {
  const data = await tmdbFetch("/tv/top_rated");
  return (data.results || []).map(mapTmdbMovieToMockTitle);
}