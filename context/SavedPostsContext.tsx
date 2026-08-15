import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { z } from "zod";

import { StorageKeys, readValidated, write } from "@/lib/storage";

/** Bounded so a runaway loop or hostile write can't exhaust local storage. */
const MAX_IDS = 500;

const IdListSchema = z.array(z.string().min(1).max(120)).max(MAX_IDS);

interface SavedPostsContextValue {
  savedPostIds: string[];
  likedPostIds: string[];
  isLoading: boolean;
  isSaved: (id: string) => boolean;
  isLiked: (id: string) => boolean;
  toggleSave: (id: string) => void;
  toggleLike: (id: string) => void;
  reset: () => void;
}

const SavedPostsContext = createContext<SavedPostsContextValue | null>(null);

function toggleId(list: string[], id: string): string[] {
  if (list.includes(id)) return list.filter((entry) => entry !== id);
  if (list.length >= MAX_IDS) return list;
  return [...list, id];
}

export function SavedPostsProvider({ children }: { children: React.ReactNode }) {
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      readValidated(StorageKeys.savedPosts, IdListSchema, []),
      readValidated(StorageKeys.likedPosts, IdListSchema, []),
    ])
      .then(([saved, liked]) => {
        if (!mounted) return;
        setSavedPostIds(saved);
        setLikedPostIds(liked);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isSaved = useCallback(
    (id: string) => savedPostIds.includes(id),
    [savedPostIds],
  );

  const isLiked = useCallback(
    (id: string) => likedPostIds.includes(id),
    [likedPostIds],
  );

  const toggleSave = useCallback((id: string) => {
    setSavedPostIds((prev) => {
      const next = toggleId(prev, id);
      void write(StorageKeys.savedPosts, next);
      return next;
    });
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLikedPostIds((prev) => {
      const next = toggleId(prev, id);
      void write(StorageKeys.likedPosts, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSavedPostIds([]);
    setLikedPostIds([]);
    void write(StorageKeys.savedPosts, []);
    void write(StorageKeys.likedPosts, []);
  }, []);

  const value = useMemo<SavedPostsContextValue>(
    () => ({
      savedPostIds,
      likedPostIds,
      isLoading,
      isSaved,
      isLiked,
      toggleSave,
      toggleLike,
      reset,
    }),
    [
      savedPostIds,
      likedPostIds,
      isLoading,
      isSaved,
      isLiked,
      toggleSave,
      toggleLike,
      reset,
    ],
  );

  return (
    <SavedPostsContext.Provider value={value}>
      {children}
    </SavedPostsContext.Provider>
  );
}

export function useSavedPosts() {
  const ctx = useContext(SavedPostsContext);
  if (!ctx)
    throw new Error("useSavedPosts must be used within SavedPostsProvider");
  return ctx;
}
