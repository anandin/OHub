import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

import { REFRESH_BATCHES } from "@/data/feedRefreshBatches";
import { Post } from "@/data/feed";

const LAST_REFRESH_KEY = "@unihub_last_refresh";
const EXTRA_POSTS_KEY = "@unihub_extra_posts";
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export function useFeedRefresh() {
  const [extraPosts, setExtraPosts] = useState<Post[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doRefresh = useCallback(async (batchIndex: number) => {
    const now = Date.now();
    const batch = REFRESH_BATCHES[batchIndex % REFRESH_BATCHES.length];

    const existingRaw = await AsyncStorage.getItem(EXTRA_POSTS_KEY);
    const existing: Post[] = existingRaw ? JSON.parse(existingRaw) : [];

    // Prepend new batch, keep up to 60 extra posts
    const merged = [...batch, ...existing].slice(0, 60);

    await AsyncStorage.setItem(EXTRA_POSTS_KEY, JSON.stringify(merged));
    await AsyncStorage.setItem(LAST_REFRESH_KEY, String(now));

    setExtraPosts(merged);
    setLastRefreshed(new Date(now));
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Load persisted extra posts
      const storedRaw = await AsyncStorage.getItem(EXTRA_POSTS_KEY);
      if (storedRaw && mounted) {
        setExtraPosts(JSON.parse(storedRaw));
      }

      // Check if a refresh is due
      const lastRaw = await AsyncStorage.getItem(LAST_REFRESH_KEY);
      const lastTime = lastRaw ? Number(lastRaw) : 0;
      const now = Date.now();

      if (!mounted) return;

      if (now - lastTime >= REFRESH_INTERVAL_MS || lastTime === 0) {
        // Determine which batch to use based on how many refreshes have happened
        const batchIndex = lastTime === 0
          ? 0
          : Math.floor((now - lastTime) / REFRESH_INTERVAL_MS) - 1;
        doRefresh(batchIndex);
      } else {
        setLastRefreshed(new Date(lastTime));
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [doRefresh]);

  // Update countdown every minute
  useEffect(() => {
    const update = async () => {
      const lastRaw = await AsyncStorage.getItem(LAST_REFRESH_KEY);
      if (!lastRaw) return;
      const lastTime = Number(lastRaw);
      const msUntilNext = REFRESH_INTERVAL_MS - (Date.now() - lastTime);
      if (msUntilNext <= 0) return;
      const hours = Math.floor(msUntilNext / (1000 * 60 * 60));
      const mins = Math.floor((msUntilNext % (1000 * 60 * 60)) / (1000 * 60));
      setNextRefreshIn(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
    };
    update();
    timerRef.current = setInterval(update, 60 * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lastRefreshed]);

  const manualRefresh = useCallback(async () => {
    const lastRaw = await AsyncStorage.getItem(LAST_REFRESH_KEY);
    const lastTime = lastRaw ? Number(lastRaw) : 0;
    const batchIndex = Math.ceil((Date.now() - lastTime) / REFRESH_INTERVAL_MS);
    await doRefresh(batchIndex);
  }, [doRefresh]);

  return { extraPosts, lastRefreshed, nextRefreshIn, manualRefresh };
}
