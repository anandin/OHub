import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { useColorScheme } from "react-native";

import { dark, light } from "@/constants/theme";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { StorageKeys } from "@/lib/storage";

jest.mock("react-native/Libraries/Utilities/useColorScheme");

const mockSystemScheme = (scheme: "light" | "dark" | null) => {
  (useColorScheme as unknown as jest.Mock).mockReturnValue(scheme);
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

beforeEach(() => mockSystemScheme("light"));

describe("ThemeProvider", () => {
  it("follows the device by default", async () => {
    mockSystemScheme("dark");
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.preference).toBe("system");
    expect(result.current.scheme).toBe("dark");
    expect(result.current.palette).toBe(dark);
  });

  it("falls back to light when the device reports no preference", async () => {
    mockSystemScheme(null);
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.scheme).toBe("light");
  });

  it("lets an explicit choice override the device", async () => {
    mockSystemScheme("dark");
    const { result } = renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setPreference("light"));

    expect(result.current.scheme).toBe("light");
    expect(result.current.palette).toBe(light);
  });

  it("persists the choice", async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setPreference("dark"));

    await waitFor(async () => {
      await expect(
        AsyncStorage.getItem(StorageKeys.themePreference),
      ).resolves.toBe('"dark"');
    });
  });

  it("restores a persisted choice on next launch", async () => {
    await AsyncStorage.setItem(StorageKeys.themePreference, '"dark"');
    mockSystemScheme("light");

    const { result } = renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.preference).toBe("dark");
    expect(result.current.scheme).toBe("dark");
  });

  it("ignores a corrupted stored value rather than crashing", async () => {
    await AsyncStorage.setItem(StorageKeys.themePreference, '"solarized"');

    const { result } = renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.preference).toBe("system");
  });

  it("returns to following the device when set back to system", async () => {
    mockSystemScheme("dark");
    const { result } = renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setPreference("light"));
    expect(result.current.scheme).toBe("light");

    act(() => result.current.setPreference("system"));
    expect(result.current.scheme).toBe("dark");
  });
});

describe("palette integrity", () => {
  it("defines exactly the same tokens in both themes", () => {
    // A token present in one palette and missing from the other renders as
    // `undefined` — which React Native silently treats as no colour at all.
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it("gives every token a real colour", () => {
    const notHex = Object.entries({ ...light, ...dark }).filter(
      ([, value]) => !/^#[0-9a-f]{6}$/i.test(value),
    );
    expect(notHex).toEqual([]);
  });
});
