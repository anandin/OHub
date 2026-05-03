import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  DEFAULT_PROFILE,
  DEFAULT_TASKS,
  Task,
  UserProfile,
} from '@/data/userData';

const PROFILE_KEY = '@unihub_user_profile';
const TASKS_KEY   = '@unihub_tasks_done';
const TASKS_DATA_KEY = '@unihub_tasks_list';

interface UserContextValue {
  profile: UserProfile;
  tasks: Task[];
  doneTasks: Set<string>;
  toggleTask: (id: string) => void;
  addTask: (label: string, est: string, priority: 'high' | 'med' | 'low') => void;
  deleteTask: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateMarks: (marks: string[]) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then((raw) => {
      if (raw) {
        try { setProfile((p) => ({ ...p, ...JSON.parse(raw) })); } catch {}
      }
    });
    AsyncStorage.getItem(TASKS_KEY).then((raw) => {
      if (raw) {
        try { setDoneTasks(new Set(JSON.parse(raw))); } catch {}
      }
    });
    AsyncStorage.getItem(TASKS_DATA_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved) && saved.length > 0) setTasks(saved);
        } catch {}
      }
    });
  }, []);

  const toggleTask = useCallback((id: string) => {
    setDoneTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(TASKS_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const addTask = useCallback((label: string, est: string, priority: 'high' | 'med' | 'low') => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      label: label.trim(),
      est: est.trim() || '5 min',
      priority,
    };
    setTasks((prev) => {
      const next = [...prev, newTask];
      AsyncStorage.setItem(TASKS_DATA_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      AsyncStorage.setItem(TASKS_DATA_KEY, JSON.stringify(next));
      return next;
    });
    setDoneTasks((prev) => {
      const next = new Set(prev);
      next.delete(id);
      AsyncStorage.setItem(TASKS_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((p) => {
      const next = { ...p, ...updates };
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateMarks = useCallback(
    (marks: string[]) => {
      const parsed = marks.map((m) => parseFloat(m)).filter((m) => !isNaN(m) && m > 0);
      const avg = parsed.length > 0 ? parsed.reduce((a, b) => a + b, 0) / parsed.length : profile.avg;
      updateProfile({ marks, avg: Math.round(avg * 10) / 10 });
    },
    [profile.avg, updateProfile],
  );

  return (
    <UserContext.Provider value={{
      profile, tasks, doneTasks,
      toggleTask, addTask, deleteTask,
      updateProfile, updateMarks,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
