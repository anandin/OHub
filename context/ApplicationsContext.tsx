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

export type AppStatus =
  | "shortlisted"
  | "applied"
  | "supp_sent"
  | "offer"
  | "accepted"
  | "declined";

export const APP_STATUS_ORDER: AppStatus[] = [
  "shortlisted",
  "applied",
  "supp_sent",
  "offer",
  "accepted",
  "declined",
];

/** Notes are user-authored free text; cap them so storage can't be filled. */
const MAX_NOTE_LENGTH = 2000;
const MAX_APPLICATIONS = 40;

const ApplicationEntrySchema = z.object({
  universityId: z.string().min(1).max(120),
  status: z.enum([
    "shortlisted",
    "applied",
    "supp_sent",
    "offer",
    "accepted",
    "declined",
  ]),
  note: z.string().max(MAX_NOTE_LENGTH).catch(""),
  addedAt: z.number().finite().nonnegative().catch(0),
  programName: z.string().max(200).optional(),
});

const ApplicationsSchema = z.array(ApplicationEntrySchema).max(MAX_APPLICATIONS);

export type ApplicationEntry = z.infer<typeof ApplicationEntrySchema>;

export const APP_STATUS_CONFIG: Record<
  AppStatus,
  { label: string; color: string; bg: string; icon: string; announce: string }
> = {
  shortlisted: { label: "Shortlisted", color: "#6366F1", bg: "#EEF2FF", icon: "bookmark",     announce: "Shortlisted" },
  applied:     { label: "Applied",     color: "#0EA5E9", bg: "#E0F2FE", icon: "send",         announce: "Applied" },
  supp_sent:   { label: "Supp. Sent",  color: "#B45309", bg: "#FFFBEB", icon: "file-text",    announce: "Supplementary application sent" },
  offer:       { label: "Offer!",      color: "#7C3AED", bg: "#F5F3FF", icon: "star",         announce: "Offer received" },
  accepted:    { label: "Accepted",    color: "#047857", bg: "#ECFDF5", icon: "check-circle", announce: "Accepted" },
  declined:    { label: "Declined",    color: "#4B5563", bg: "#F3F4F6", icon: "x-circle",     announce: "Declined" },
};

interface ApplicationsContextValue {
  applications: ApplicationEntry[];
  isLoading: boolean;
  getApplication: (universityId: string) => ApplicationEntry | undefined;
  addApplication: (universityId: string, programName?: string) => void;
  updateStatus: (universityId: string, status: AppStatus) => void;
  updateNote: (universityId: string, note: string) => void;
  removeApplication: (universityId: string) => void;
  isTracked: (universityId: string) => boolean;
  reset: () => void;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<ApplicationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    readValidated(StorageKeys.applications, ApplicationsSchema, [])
      .then((stored) => {
        if (mounted) setApplications(stored);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Functional updates keep the reducer honest when two taps land in the same
  // React batch — the previous implementation read stale `applications` from a
  // closure and could silently drop one of them.
  const mutate = useCallback(
    (fn: (prev: ApplicationEntry[]) => ApplicationEntry[]) => {
      setApplications((prev) => {
        const next = fn(prev);
        void write(StorageKeys.applications, next);
        return next;
      });
    },
    [],
  );

  const getApplication = useCallback(
    (universityId: string) =>
      applications.find((a) => a.universityId === universityId),
    [applications],
  );

  const isTracked = useCallback(
    (universityId: string) =>
      applications.some((a) => a.universityId === universityId),
    [applications],
  );

  const addApplication = useCallback(
    (universityId: string, programName?: string) => {
      mutate((prev) => {
        if (prev.some((a) => a.universityId === universityId)) return prev;
        if (prev.length >= MAX_APPLICATIONS) return prev;
        return [
          ...prev,
          {
            universityId,
            status: "shortlisted" as const,
            note: "",
            addedAt: Date.now(),
            ...(programName ? { programName: programName.slice(0, 200) } : {}),
          },
        ];
      });
    },
    [mutate],
  );

  const updateStatus = useCallback(
    (universityId: string, status: AppStatus) => {
      mutate((prev) =>
        prev.map((a) => (a.universityId === universityId ? { ...a, status } : a)),
      );
    },
    [mutate],
  );

  const updateNote = useCallback(
    (universityId: string, note: string) => {
      const trimmed = note.slice(0, MAX_NOTE_LENGTH);
      mutate((prev) =>
        prev.map((a) =>
          a.universityId === universityId ? { ...a, note: trimmed } : a,
        ),
      );
    },
    [mutate],
  );

  const removeApplication = useCallback(
    (universityId: string) => {
      mutate((prev) => prev.filter((a) => a.universityId !== universityId));
    },
    [mutate],
  );

  const reset = useCallback(() => mutate(() => []), [mutate]);

  const value = useMemo<ApplicationsContextValue>(
    () => ({
      applications,
      isLoading,
      getApplication,
      addApplication,
      updateStatus,
      updateNote,
      removeApplication,
      isTracked,
      reset,
    }),
    [
      applications,
      isLoading,
      getApplication,
      addApplication,
      updateStatus,
      updateNote,
      removeApplication,
      isTracked,
      reset,
    ],
  );

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx)
    throw new Error("useApplications must be used within ApplicationsProvider");
  return ctx;
}
