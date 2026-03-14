import { useEffect, useMemo, useState } from "react";
import type { MockTitle } from "../data/mock";
import { useProfile } from "./useProfile";

type ContinueWatchingEntry = {
  item: MockTitle;
  progress: number; // 0..1
  updatedAt: number;
};

type ContinueWatchingMap = Record<number, ContinueWatchingEntry>;

function getKey(profileId: string | null) {
  return `netflix_clone_continue_watching_v1:${profileId ?? "guest"}`;
}

export function useContinueWatching() {
  const { activeProfile } = useProfile();
  const storageKey = useMemo(() => getKey(activeProfile?.id ?? null), [activeProfile?.id]);

  const [data, setData] = useState<ContinueWatchingMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setData(raw ? (JSON.parse(raw) as ContinueWatchingMap) : {});
    } catch {
      setData({});
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {}
  }, [data, storageKey]);

  const play = (item: MockTitle) => {
    setData((prev) => {
      const existing = prev[item.id];
      const nextProgress = existing ? Math.min(0.95, existing.progress + 0.12) : 0.12;

      return {
        ...prev,
        [item.id]: {
          item,
          progress: nextProgress,
          updatedAt: Date.now(),
        },
      };
    });
  };

  const setProgress = (item: MockTitle, progress: number) => {
    setData((prev) => ({
      ...prev,
      [item.id]: {
        item,
        progress: Math.max(0, Math.min(1, progress)),
        updatedAt: Date.now(),
      },
    }));
  };

  const remove = (id: number) => {
    setData((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clear = () => setData({});

  const items = useMemo(
    () =>
      Object.values(data)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((entry) => entry.item),
    [data]
  );

  const progressById = useMemo(() => {
    const map: Record<number, number> = {};
    for (const entry of Object.values(data)) {
      map[entry.item.id] = entry.progress;
    }
    return map;
  }, [data]);

  return {
    items,
    progressById,
    play,
    setProgress,
    remove,
    clear,
  };
}