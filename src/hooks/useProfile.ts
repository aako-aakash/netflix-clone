import { useEffect, useState } from "react";

const KEY = "netflix_clone_active_profile_v1";
const EVENT_NAME = "netflix-profile-changed";

export type Profile = {
  id: string;
  name: string;
  avatar: string;
};

export const defaultProfiles: Profile[] = [
  {
    id: "aakash",
    name: "Aakash",
    avatar:
      "https://api.dicebear.com/7.x/shapes/svg?seed=Aakash&backgroundColor=b6e3f4",
  },
  {
    id: "movies",
    name: "Movies",
    avatar:
      "https://api.dicebear.com/7.x/shapes/svg?seed=Movies&backgroundColor=ffd5dc",
  },
  {
    id: "tv",
    name: "TV Shows",
    avatar:
      "https://api.dicebear.com/7.x/shapes/svg?seed=TV&backgroundColor=c0aede",
  },
  {
    id: "kids",
    name: "Kids",
    avatar:
      "https://api.dicebear.com/7.x/shapes/svg?seed=Kids&backgroundColor=d1d4f9",
  },
];

function readStoredProfile() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function emitProfileChange() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useProfile() {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(
    readStoredProfile()
  );

  useEffect(() => {
    const syncProfile = () => {
      setActiveProfileId(readStoredProfile());
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        syncProfile();
      }
    };

    window.addEventListener(EVENT_NAME, syncProfile);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, syncProfile);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const activeProfile =
    defaultProfiles.find((p) => p.id === activeProfileId) ?? null;

  const selectProfile = (id: string) => {
    try {
      localStorage.setItem(KEY, id);
    } catch {}
    setActiveProfileId(id);
    emitProfileChange();
  };

  const clearProfile = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setActiveProfileId(null);
    emitProfileChange();
  };

  return {
    profiles: defaultProfiles,
    activeProfile,
    hasProfile: !!activeProfile,
    selectProfile,
    clearProfile,
  };
}