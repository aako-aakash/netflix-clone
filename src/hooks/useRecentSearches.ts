import { useEffect, useMemo, useState } from "react";
import { useProfile } from "./useProfile";

const MAX = 8;

function getKey(profileId: string | null) {
  return `netflix_clone_recent_searches_v1:${profileId ?? "guest"}`;
}

export function useRecentSearches() {
  const { activeProfile } = useProfile();
  const storageKey = useMemo(() => getKey(activeProfile?.id ?? null), [activeProfile?.id]);

  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setItems([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }, [items, storageKey]);

  const add = (q: string) => {
    const query = q.trim();
    if (!query) return;

    setItems((prev) => {
      const next = [query, ...prev.filter((x) => x.toLowerCase() !== query.toLowerCase())];
      return next.slice(0, MAX);
    });
  };

  const clear = () => setItems([]);

  return { items, add, clear };
}