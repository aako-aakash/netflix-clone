import type { MockTitle } from "../data/mock";

export function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function searchTitles(all: MockTitle[], query: string) {
  const q = normalize(query);
  if (!q) return [];
  return all.filter((t) => normalize(t.title).includes(q));
}