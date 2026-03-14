export type MockTitle = {
  id: number;
  title: string;
  poster: string;
  backdrop: string;
  overview: string;

  year: number;
  runtime: number; // minutes
  match: number; // 0-100
  rating: number; // 0-10
  maturity: string; // e.g. "U/A 16+"
  genres: string[];
};

const basePoster =
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=500&q=60";
const baseBackdrop =
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=60";

const GENRES = [
  "Action",
  "Thriller",
  "Drama",
  "Comedy",
  "Sci-Fi",
  "Crime",
  "Mystery",
  "Adventure",
];

function pickGenres(seed: number) {
  const g1 = GENRES[seed % GENRES.length];
  const g2 = GENRES[(seed + 3) % GENRES.length];
  return g1 === g2 ? [g1] : [g1, g2];
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export const mockTitles: MockTitle[] = Array.from({ length: 24 }).map((_, i) => {
  const seed = i + 1;
  return {
    id: seed,
    title: `Movie ${seed}`,
    poster: basePoster + `&sig=${seed}`,
    backdrop: baseBackdrop + `&sig=${seed + 100}`,
    overview:
      "A suspenseful story with high stakes, intense drama, and a binge-worthy vibe. This is placeholder text for the modal/details later.",

    year: 2012 + (seed % 13),
    runtime: 88 + (seed % 55),
    match: clamp(70 + (seed % 29), 70, 99),
    rating: clamp(6.4 + ((seed % 26) / 10), 6.4, 9.3),
    maturity: seed % 3 === 0 ? "U/A 16+" : seed % 3 === 1 ? "U/A 13+" : "A",
    genres: pickGenres(seed),
  };
});

export const rows = [
  { id: "trending", title: "Trending Now", items: mockTitles.slice(0, 10) },
  { id: "top", title: "Top Rated", items: mockTitles.slice(6, 16) },
  { id: "action", title: "Action Movies", items: mockTitles.slice(2, 12) },
  { id: "comedy", title: "Comedies", items: mockTitles.slice(10, 20) },
];