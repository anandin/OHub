import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "@unihub_saved_posts";
const LIKES_KEY = "@unihub_liked_posts";

interface SavedPostsContextValue {
  savedPostIds: string[];
  likedPostIds: string[];
  isSaved: (id: string) => boolean;
  isLiked: (id: string) => boolean;
  toggleSave: (id: string) => void;
  toggleLike: (id: string) => void;
}

const SavedPostsContext = createContext<SavedPostsContextValue | null>(null);

export function SavedPostsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(LIKES_KEY),
    ]).then(([saved, liked]) => {
      if (saved) setSavedPostIds(JSON.parse(saved));
      if (liked) setLikedPostIds(JSON.parse(liked));
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => savedPostIds.includes(id),
    [savedPostIds]
  );

  const isLiked = useCallback(
    (id: string) => likedPostIds.includes(id),
    [likedPostIds]
  );

  const toggleSave = useCallback((id: string) => {
    setSavedPostIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLikedPostIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id];
      AsyncStorage.setItem(LIKES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SavedPostsContext.Provider
      value={{
        savedPostIds,
        likedPostIds,
        isSaved,
        isLiked,
        toggleSave,
        toggleLike,
      }}
    >
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
