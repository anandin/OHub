import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { z } from 'zod';

import {
  DEFAULT_PROFILE,
  DEFAULT_TASKS,
  EMPTY_MARKS,
  Task,
  UserProfile,
} from '@/data/userData';
import { computeAverage } from '@/lib/admissions';
import { sanitizeText } from '@/lib/privacy';
import { StorageKeys, readValidated, write } from '@/lib/storage';

/** Field caps: user-authored text must not be able to fill the storage quota. */
const MAX_NAME = 80;
const MAX_SCHOOL = 120;
const MAX_OUAC_REF = 32;
const MAX_TASK_LABEL = 160;
const MAX_TASKS = 100;

const ProfileSchema = z.object({
  name: z.string().max(MAX_NAME).catch(''),
  school: z.string().max(MAX_SCHOOL).catch(''),
  ouacRef: z.string().max(MAX_OUAC_REF).catch(''),
  avg: z.number().min(0).max(100).nullable().catch(null),
  marks: z.array(z.string().max(6)).max(12).catch([...EMPTY_MARKS]),
  courseCodes: z.array(z.string().max(12)).max(12).catch([...EMPTY_MARKS]),
});

const TaskSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(MAX_TASK_LABEL),
  est: z.string().max(32).catch(''),
  priority: z.enum(['high', 'med', 'low']).catch('med'),
});

const TasksSchema = z.array(TaskSchema).max(MAX_TASKS);
const DoneTasksSchema = z.array(z.string().max(64)).max(MAX_TASKS);

interface UserContextValue {
  profile: UserProfile;
  tasks: Task[];
  doneTasks: Set<string>;
  isLoading: boolean;
  /** True once the student has told us who they are. Drives onboarding copy. */
  hasProfile: boolean;
  toggleTask: (id: string) => void;
  addTask: (label: string, est: string, priority: 'high' | 'med' | 'low') => void;
  deleteTask: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateMarks: (marks: string[], courseCodes?: string[]) => void;
  reset: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

/** Monotonic id source — `Date.now()` collides when two tasks are added fast. */
let taskCounter = 0;
function nextTaskId(): string {
  taskCounter += 1;
  return `task-${Date.now().toString(36)}-${taskCounter}`;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      readValidated(StorageKeys.profile, ProfileSchema.partial(), {}),
      readValidated(StorageKeys.tasksDone, DoneTasksSchema, []),
      readValidated(StorageKeys.tasksList, TasksSchema, []),
    ])
      .then(([storedProfile, storedDone, storedTasks]) => {
        if (!mounted) return;
        setProfile((current) => ({ ...current, ...storedProfile }));
        setDoneTasks(new Set(storedDone));
        if (storedTasks.length > 0) setTasks(storedTasks);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleTask = useCallback((id: string) => {
    setDoneTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      void write(StorageKeys.tasksDone, [...next]);
      return next;
    });
  }, []);

  const addTask = useCallback(
    (label: string, est: string, priority: 'high' | 'med' | 'low') => {
      const cleanLabel = sanitizeText(label, MAX_TASK_LABEL);
      if (cleanLabel === '') return;

      setTasks((prev) => {
        if (prev.length >= MAX_TASKS) return prev;
        const next = [
          ...prev,
          {
            id: nextTaskId(),
            label: cleanLabel,
            est: est.trim().slice(0, 32) || '5 min',
            priority,
          },
        ];
        void write(StorageKeys.tasksList, next);
        return next;
      });
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      void write(StorageKeys.tasksList, next);
      return next;
    });
    setDoneTasks((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      void write(StorageKeys.tasksDone, [...next]);
      return next;
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next: UserProfile = {
        ...prev,
        ...updates,
        name: sanitizeText(updates.name ?? prev.name, MAX_NAME),
        school: sanitizeText(updates.school ?? prev.school, MAX_SCHOOL),
        ouacRef: sanitizeText(updates.ouacRef ?? prev.ouacRef, MAX_OUAC_REF),
      };
      void write(StorageKeys.profile, next);
      return next;
    });
  }, []);

  const updateMarks = useCallback(
    (marks: string[], courseCodes?: string[]) => {
      const cleanMarks = marks.slice(0, 12).map((m) => m.slice(0, 6));
      updateProfile({
        marks: cleanMarks,
        avg: computeAverage(cleanMarks),
        ...(courseCodes
          ? { courseCodes: courseCodes.slice(0, 12).map((c) => c.slice(0, 12)) }
          : {}),
      });
    },
    [updateProfile],
  );

  const reset = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    setTasks(DEFAULT_TASKS);
    setDoneTasks(new Set());
    void write(StorageKeys.profile, DEFAULT_PROFILE);
    void write(StorageKeys.tasksList, DEFAULT_TASKS);
    void write(StorageKeys.tasksDone, []);
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      profile,
      tasks,
      doneTasks,
      isLoading,
      hasProfile: profile.name.trim() !== '',
      toggleTask,
      addTask,
      deleteTask,
      updateProfile,
      updateMarks,
      reset,
    }),
    [
      profile,
      tasks,
      doneTasks,
      isLoading,
      toggleTask,
      addTask,
      deleteTask,
      updateProfile,
      updateMarks,
      reset,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
