import { useEffect, useMemo, useState } from "react";
import type { MockTitle } from "../data/mock";
import { useProfile } from "./useProfile";

function getKey(profileId: string | null) {
  return `netflix_clone_my_list_v1:${profileId ?? "guest"}`;
}

export function useMyList() {
  const { activeProfile } = useProfile();
  const storageKey = useMemo(() => getKey(activeProfile?.id ?? null), [activeProfile?.id]);

  const [list, setList] = useState<MockTitle[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setList(raw ? (JSON.parse(raw) as MockTitle[]) : []);
    } catch {
      setList([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {}
  }, [list, storageKey]);

  const isInList = (id: number) => list.some((x) => x.id === id);

  const toggle = (item: MockTitle) => {
    setList((prev) => {
      const exists = prev.some((x) => x.id === item.id);
      if (exists) return prev.filter((x) => x.id !== item.id);
      return [item, ...prev];
    });
  };

  const clear = () => setList([]);

  return { list, isInList, toggle, clear };
}