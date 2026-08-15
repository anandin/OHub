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

const MAX_SUBSCRIPTIONS = 50;

const SubscriptionsSchema = z
  .array(z.string().min(1).max(120))
  .max(MAX_SUBSCRIPTIONS);

/**
 * Seeded so the Pulse feed is never empty on first run. These are the three
 * most-applied-to Ontario schools; every one can be unfollowed immediately.
 */
export const DEFAULT_SUBSCRIPTIONS = ["waterloo", "uoft", "queens"];

interface SubscriptionsContextValue {
  subscribed: string[];
  isLoading: boolean;
  isSubscribed: (id: string) => boolean;
  subscribe: (id: string) => void;
  unsubscribe: (id: string) => void;
  toggleSubscription: (id: string) => void;
  reset: () => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null,
);

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscribed, setSubscribed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    readValidated(StorageKeys.subscriptions, SubscriptionsSchema, [])
      .then((stored) => {
        if (!mounted) return;
        if (stored.length > 0) {
          setSubscribed(stored);
          return;
        }
        setSubscribed(DEFAULT_SUBSCRIPTIONS);
        void write(StorageKeys.subscriptions, DEFAULT_SUBSCRIPTIONS);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const mutate = useCallback((fn: (prev: string[]) => string[]) => {
    setSubscribed((prev) => {
      const next = fn(prev);
      if (next === prev) return prev;
      void write(StorageKeys.subscriptions, next);
      return next;
    });
  }, []);

  const subscribe = useCallback(
    (id: string) => {
      mutate((prev) =>
        prev.includes(id) || prev.length >= MAX_SUBSCRIPTIONS
          ? prev
          : [...prev, id],
      );
    },
    [mutate],
  );

  const unsubscribe = useCallback(
    (id: string) => {
      mutate((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : prev));
    },
    [mutate],
  );

  const toggleSubscription = useCallback(
    (id: string) => {
      mutate((prev) =>
        prev.includes(id)
          ? prev.filter((s) => s !== id)
          : prev.length >= MAX_SUBSCRIPTIONS
            ? prev
            : [...prev, id],
      );
    },
    [mutate],
  );

  const isSubscribed = useCallback(
    (id: string) => subscribed.includes(id),
    [subscribed],
  );

  const reset = useCallback(() => {
    setSubscribed(DEFAULT_SUBSCRIPTIONS);
    void write(StorageKeys.subscriptions, DEFAULT_SUBSCRIPTIONS);
  }, []);

  const value = useMemo<SubscriptionsContextValue>(
    () => ({
      subscribed,
      isLoading,
      isSubscribed,
      subscribe,
      unsubscribe,
      toggleSubscription,
      reset,
    }),
    [
      subscribed,
      isLoading,
      isSubscribed,
      subscribe,
      unsubscribe,
      toggleSubscription,
      reset,
    ],
  );

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx)
    throw new Error(
      "useSubscriptions must be used within SubscriptionsProvider",
    );
  return ctx;
}
