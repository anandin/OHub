import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "@unihub_applications";

export type AppStatus =
  | "shortlisted"
  | "applied"
  | "supp_sent"
  | "offer"
  | "accepted"
  | "declined";

export interface ApplicationEntry {
  universityId: string;
  status: AppStatus;
  note: string;
  addedAt: number;
  programName?: string;
}

export const APP_STATUS_CONFIG: Record<
  AppStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  shortlisted: { label: "Shortlisted",   color: "#6366F1", bg: "#EEF2FF", icon: "bookmark"       },
  applied:     { label: "Applied",       color: "#0EA5E9", bg: "#E0F2FE", icon: "send"           },
  supp_sent:   { label: "Supp. Sent",    color: "#F59E0B", bg: "#FFFBEB", icon: "file-text"      },
  offer:       { label: "Offer!",        color: "#7C3AED", bg: "#F5F3FF", icon: "star"           },
  accepted:    { label: "Accepted",      color: "#10B981", bg: "#ECFDF5", icon: "check-circle"   },
  declined:    { label: "Declined",      color: "#6B7280", bg: "#F3F4F6", icon: "x-circle"       },
};

export const APP_STATUS_ORDER: AppStatus[] = [
  "shortlisted",
  "applied",
  "supp_sent",
  "offer",
  "accepted",
  "declined",
];

interface ApplicationsContextValue {
  applications: ApplicationEntry[];
  getApplication: (universityId: string) => ApplicationEntry | undefined;
  addApplication: (universityId: string, programName?: string) => void;
  updateStatus: (universityId: string, status: AppStatus) => void;
  updateNote: (universityId: string, note: string) => void;
  removeApplication: (universityId: string) => void;
  isTracked: (universityId: string) => boolean;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<ApplicationEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setApplications(JSON.parse(raw));
    });
  }, []);

  const persist = useCallback((next: ApplicationEntry[]) => {
    setApplications(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const getApplication = useCallback(
    (universityId: string) => applications.find((a) => a.universityId === universityId),
    [applications]
  );

  const isTracked = useCallback(
    (universityId: string) => applications.some((a) => a.universityId === universityId),
    [applications]
  );

  const addApplication = useCallback(
    (universityId: string, programName?: string) => {
      if (applications.some((a) => a.universityId === universityId)) return;
      persist([
        ...applications,
        {
          universityId,
          status: "shortlisted",
          note: "",
          addedAt: Date.now(),
          programName,
        },
      ]);
    },
    [applications, persist]
  );

  const updateStatus = useCallback(
    (universityId: string, status: AppStatus) => {
      persist(
        applications.map((a) =>
          a.universityId === universityId ? { ...a, status } : a
        )
      );
    },
    [applications, persist]
  );

  const updateNote = useCallback(
    (universityId: string, note: string) => {
      persist(
        applications.map((a) =>
          a.universityId === universityId ? { ...a, note } : a
        )
      );
    },
    [applications, persist]
  );

  const removeApplication = useCallback(
    (universityId: string) => {
      persist(applications.filter((a) => a.universityId !== universityId));
    },
    [applications, persist]
  );

  return (
    <ApplicationsContext.Provider
      value={{
        applications,
        getApplication,
        addApplication,
        updateStatus,
        updateNote,
        removeApplication,
        isTracked,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error("useApplications must be used within ApplicationsProvider");
  return ctx;
}
