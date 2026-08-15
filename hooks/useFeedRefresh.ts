import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { Post } from "@/data/feed";
import { REFRESH_BATCHES } from "@/data/feedRefreshBatches";
import { StorageKeys, readValidated, write } from "@/lib/storage";

const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const MAX_EXTRA_POSTS = 60;

/**
 * Persisted posts are re-validated on read. They are rendered directly into the
 * feed, so a corrupted record would otherwise surface as a blank card or a
 * crash inside `PostCard`.
 */
const PostSchema = z.object({
  id: z.string().min(1).max(120),
  universityId: z.string().min(1).max(120),
  title: z.string().max(300),
  body: z.string().max(5000),
  category: z.enum([
    "event",
    "program",
    "news",
    "hackathon",
    "competition",
    "club",
    "openhouse",
    "scholarship",
    "merch",
    "sports",
    "research",
    "admission",
  ]),
  author: z.string().max(120),
  source: z.string().max(120),
  sourceUrl: z.string().max(2048).optional(),
  timeAgo: z.string().max(40),
  likes: z.number().finite().nonnegative().catch(0),
  comments: z.number().finite().nonnegative().catch(0),
  imageUrl: z.string().max(2048).optional(),
  tags: z.array(z.string().max(60)).max(20).catch([]),
  isPinned: z.boolean().optional(),
});

const PostsSchema = z.array(PostSchema).max(MAX_EXTRA_POSTS);
const TimestampSchema = z.number().finite().nonnegative();

export function useFeedRefresh() {
  const [extraPosts, setExtraPosts] = useState<Post[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doRefresh = useCallback(async (batchIndex: number) => {
    setIsRefreshing(true);
    try {
      const now = Date.now();
      const safeIndex =
        ((Math.trunc(batchIndex) % REFRESH_BATCHES.length) +
          REFRESH_BATCHES.length) %
        REFRESH_BATCHES.length;
      const batch = REFRESH_BATCHES[safeIndex] ?? [];

      const existing = await readValidated(
        StorageKeys.extraPosts,
        PostsSchema,
        [],
      );

      // De-duplicate: without this, a batch that comes round again stacks
      // identical posts and React logs duplicate-key warnings.
      const seen = new Set<string>();
      const merged = [...batch, ...existing]
        .filter((post) => {
          if (seen.has(post.id)) return false;
          seen.add(post.id);
          return true;
        })
        .slice(0, MAX_EXTRA_POSTS);

      await write(StorageKeys.extraPosts, merged);
      await write(StorageKeys.lastRefresh, now);

      setExtraPosts(merged);
      setLastRefreshed(new Date(now));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const [stored, lastTime] = await Promise.all([
        readValidated(StorageKeys.extraPosts, PostsSchema, []),
        readValidated(StorageKeys.lastRefresh, TimestampSchema, 0),
      ]);

      if (!mounted) return;
      setExtraPosts(stored);

      const now = Date.now();
      if (lastTime === 0 || now - lastTime >= REFRESH_INTERVAL_MS) {
        const batchIndex =
          lastTime === 0
            ? 0
            : Math.max(0, Math.floor((now - lastTime) / REFRESH_INTERVAL_MS) - 1);
        void doRefresh(batchIndex);
      } else {
        setLastRefreshed(new Date(lastTime));
      }
    };

    void init();

    return () => {
      mounted = false;
    };
  }, [doRefresh]);

  // Countdown to the next automatic refresh.
  useEffect(() => {
    let mounted = true;

    const update = async () => {
      const lastTime = await readValidated(
        StorageKeys.lastRefresh,
        TimestampSchema,
        0,
      );
      if (!mounted || lastTime === 0) return;

      const msUntilNext = REFRESH_INTERVAL_MS - (Date.now() - lastTime);
      if (msUntilNext <= 0) {
        setNextRefreshIn("any moment");
        return;
      }
      const hours = Math.floor(msUntilNext / (1000 * 60 * 60));
      const mins = Math.floor((msUntilNext % (1000 * 60 * 60)) / (1000 * 60));
      setNextRefreshIn(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
    };

    void update();
    timerRef.current = setInterval(() => void update(), 60 * 1000);

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lastRefreshed]);

  const manualRefresh = useCallback(async () => {
    const lastTime = await readValidated(
      StorageKeys.lastRefresh,
      TimestampSchema,
      0,
    );
    const batchIndex = Math.ceil((Date.now() - lastTime) / REFRESH_INTERVAL_MS);
    await doRefresh(batchIndex);
  }, [doRefresh]);

  return { extraPosts, lastRefreshed, nextRefreshIn, isRefreshing, manualRefresh };
}
