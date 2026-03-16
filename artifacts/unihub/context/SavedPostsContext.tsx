import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "@unihub_saved_posts";
const UPVOTES_KEY = "@unihub_upvoted_posts";

interface SavedPostsContextValue {
  savedPostIds: string[];
  upvotedPostIds: string[];
  isSaved: (id: string) => boolean;
  isUpvoted: (id: string) => boolean;
  toggleSave: (id: string) => void;
  toggleUpvote: (id: string) => void;
}

const SavedPostsContext = createContext<SavedPostsContextValue | null>(null);

export function SavedPostsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [upvotedPostIds, setUpvotedPostIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(UPVOTES_KEY),
    ]).then(([saved, upvoted]) => {
      if (saved) setSavedPostIds(JSON.parse(saved));
      if (upvoted) setUpvotedPostIds(JSON.parse(upvoted));
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => savedPostIds.includes(id),
    [savedPostIds]
  );

  const isUpvoted = useCallback(
    (id: string) => upvotedPostIds.includes(id),
    [upvotedPostIds]
  );

  const toggleSave = useCallback(
    (id: string) => {
      setSavedPostIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((s) => s !== id)
          : [...prev, id];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const toggleUpvote = useCallback(
    (id: string) => {
      setUpvotedPostIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((s) => s !== id)
          : [...prev, id];
        AsyncStorage.setItem(UPVOTES_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  return (
    <SavedPostsContext.Provider
      value={{
        savedPostIds,
        upvotedPostIds,
        isSaved,
        isUpvoted,
        toggleSave,
        toggleUpvote,
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
