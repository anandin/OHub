import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "@unihub_subscriptions";

interface SubscriptionsContextValue {
  subscribed: string[];
  isSubscribed: (id: string) => boolean;
  subscribe: (id: string) => void;
  unsubscribe: (id: string) => void;
  toggleSubscription: (id: string) => void;
  isLoading: boolean;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null
);

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscribed, setSubscribed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) {
          setSubscribed(JSON.parse(data));
        } else {
          const defaults = ["waterloo", "uoft", "queens"];
          setSubscribed(defaults);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        }
      })
      .catch(() => {
        setSubscribed(["waterloo", "uoft", "queens"]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback((ids: string[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const subscribe = useCallback(
    (id: string) => {
      setSubscribed((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const unsubscribe = useCallback(
    (id: string) => {
      setSubscribed((prev) => {
        const next = prev.filter((s) => s !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const isSubscribed = useCallback(
    (id: string) => subscribed.includes(id),
    [subscribed]
  );

  const toggleSubscription = useCallback(
    (id: string) => {
      if (isSubscribed(id)) {
        unsubscribe(id);
      } else {
        subscribe(id);
      }
    },
    [isSubscribed, subscribe, unsubscribe]
  );

  return (
    <SubscriptionsContext.Provider
      value={{
        subscribed,
        isSubscribed,
        subscribe,
        unsubscribe,
        toggleSubscription,
        isLoading,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx)
    throw new Error(
      "useSubscriptions must be used within SubscriptionsProvider"
    );
  return ctx;
}
