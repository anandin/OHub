import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import {
  ApplicationsProvider,
  useApplications,
} from "@/context/ApplicationsContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { StorageKeys } from "@/lib/storage";

function withApplications({ children }: { children: React.ReactNode }) {
  return <ApplicationsProvider>{children}</ApplicationsProvider>;
}

function withUser({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}

describe("ApplicationsContext", () => {
  it("starts empty and finishes loading", async () => {
    const { result } = renderHook(() => useApplications(), {
      wrapper: withApplications,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.applications).toEqual([]);
  });

  it("tracks, advances and removes an application", async () => {
    const { result } = renderHook(() => useApplications(), {
      wrapper: withApplications,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addApplication("waterloo", "Software Engineering"));
    expect(result.current.isTracked("waterloo")).toBe(true);
    expect(result.current.getApplication("waterloo")?.status).toBe("shortlisted");

    act(() => result.current.updateStatus("waterloo", "applied"));
    expect(result.current.getApplication("waterloo")?.status).toBe("applied");

    act(() => result.current.removeApplication("waterloo"));
    expect(result.current.isTracked("waterloo")).toBe(false);
  });

  it("does not double-add the same university", async () => {
    const { result } = renderHook(() => useApplications(), {
      wrapper: withApplications,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addApplication("queens"));
    act(() => result.current.addApplication("queens"));

    expect(result.current.applications).toHaveLength(1);
  });

  it("keeps both writes when two adds land in the same batch", async () => {
    // The previous implementation read `applications` from a stale closure, so
    // the second add in a batch silently overwrote the first.
    const { result } = renderHook(() => useApplications(), {
      wrapper: withApplications,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addApplication("uoft");
      result.current.addApplication("mcmaster");
    });

    expect(result.current.applications.map((a) => a.universityId).sort()).toEqual(
      ["mcmaster", "uoft"],
    );
  });

  it("caps note length", async () => {
    const { result } = renderHook(() => useApplications(), {
      wrapper: withApplications,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addApplication("western"));
    act(() => result.current.updateNote("western", "x".repeat(9999)));

    expect(result.current.getApplication("western")?.note.length).toBe(2000);
  });

  it("rehydrates from storage", async () => {
    await AsyncStorage.setItem(
      StorageKeys.applications,
      JSON.stringify([
        { universityId: "queens", status: "offer", note: "", addedAt: 1 },
      ]),
    );

    const { result } = renderHook(() => useApplications(), {
      wrapper: withApplications,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.getApplication("queens")?.status).toBe("offer");
  });

  it("ignores a stored entry with an invalid status", async () => {
    await AsyncStorage.setItem(
      StorageKeys.applications,
      JSON.stringify([
        { universityId: "queens", status: "admitted-by-hacking", note: "" },
      ]),
    );

    const { result } = renderHook(() => useApplications(), {
      wrapper: withApplications,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.applications).toEqual([]);
  });
});

describe("UserContext", () => {
  it("starts with no fabricated identity", async () => {
    const { result } = renderHook(() => useUser(), { wrapper: withUser });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile.name).toBe("");
    expect(result.current.profile.avg).toBeNull();
    expect(result.current.hasProfile).toBe(false);
  });

  it("derives the average from entered marks", async () => {
    const { result } = renderHook(() => useUser(), { wrapper: withUser });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.updateMarks(["95", "94", "93", "91", "90", "92"]));

    expect(result.current.profile.avg).toBe(92.5);
  });

  it("clears the average back to null when marks are removed", async () => {
    const { result } = renderHook(() => useUser(), { wrapper: withUser });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.updateMarks(["90", "90"]));
    expect(result.current.profile.avg).toBe(90);

    act(() => result.current.updateMarks(["", "", "", "", "", ""]));
    expect(result.current.profile.avg).toBeNull();
  });

  it("sanitises and caps profile text", async () => {
    const { result } = renderHook(() => useUser(), { wrapper: withUser });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      result.current.updateProfile({ name: `  Adhvaith‮  `, school: "x".repeat(500) }),
    );

    expect(result.current.profile.name).toBe("Adhvaith");
    expect(result.current.profile.school.length).toBe(120);
    expect(result.current.hasProfile).toBe(true);
  });

  it("gives every added task a distinct id even in the same millisecond", async () => {
    const { result } = renderHook(() => useUser(), { wrapper: withUser });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addTask("First", "5 min", "high");
      result.current.addTask("Second", "5 min", "low");
    });

    const ids = result.current.tasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ignores an empty task label", async () => {
    const { result } = renderHook(() => useUser(), { wrapper: withUser });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const before = result.current.tasks.length;
    act(() => result.current.addTask("   ", "5 min", "med"));

    expect(result.current.tasks).toHaveLength(before);
  });
});
