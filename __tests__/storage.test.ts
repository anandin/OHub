import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

import { StorageKeys, clearAll, readValidated, write } from "@/lib/storage";

const Schema = z.array(z.string().min(1).max(20)).max(5);

describe("readValidated", () => {
  it("returns the fallback when nothing is stored", async () => {
    await expect(
      readValidated(StorageKeys.savedPosts, Schema, ["fallback"]),
    ).resolves.toEqual(["fallback"]);
  });

  it("round-trips a valid value", async () => {
    await write(StorageKeys.savedPosts, ["a", "b"]);
    await expect(
      readValidated(StorageKeys.savedPosts, Schema, []),
    ).resolves.toEqual(["a", "b"]);
  });

  it("falls back and clears the key when the JSON is malformed", async () => {
    await AsyncStorage.setItem(StorageKeys.savedPosts, "{not json");
    await expect(
      readValidated(StorageKeys.savedPosts, Schema, ["safe"]),
    ).resolves.toEqual(["safe"]);
    await expect(AsyncStorage.getItem(StorageKeys.savedPosts)).resolves.toBeNull();
  });

  it("falls back when the value has the wrong shape", async () => {
    // localStorage is user- and extension-writable; a number array here would
    // previously have been cast straight to string[] and rendered.
    await AsyncStorage.setItem(StorageKeys.savedPosts, JSON.stringify([1, 2, 3]));
    await expect(
      readValidated(StorageKeys.savedPosts, Schema, []),
    ).resolves.toEqual([]);
  });

  it("enforces the schema's size cap", async () => {
    await AsyncStorage.setItem(
      StorageKeys.savedPosts,
      JSON.stringify(Array.from({ length: 50 }, (_, i) => `id-${i}`)),
    );
    await expect(
      readValidated(StorageKeys.savedPosts, Schema, []),
    ).resolves.toEqual([]);
  });

  it("strips prototype-polluting keys before validating", async () => {
    const ObjectSchema = z.object({ safe: z.string() }).passthrough();
    await AsyncStorage.setItem(
      StorageKeys.profile,
      '{"safe":"ok","__proto__":{"polluted":true},"constructor":{"x":1}}',
    );

    const result = await readValidated(StorageKeys.profile, ObjectSchema, {
      safe: "",
    });

    expect(result.safe).toBe("ok");
    expect(Object.keys(result)).not.toContain("constructor");
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("migrates a value written by the pre-rename unihub build", async () => {
    await AsyncStorage.setItem(
      "@unihub_saved_posts",
      JSON.stringify(["legacy-post"]),
    );

    await expect(
      readValidated(StorageKeys.savedPosts, Schema, []),
    ).resolves.toEqual(["legacy-post"]);

    // Migrated forward and the old key cleaned up.
    await expect(AsyncStorage.getItem(StorageKeys.savedPosts)).resolves.toBe(
      JSON.stringify(["legacy-post"]),
    );
    await expect(AsyncStorage.getItem("@unihub_saved_posts")).resolves.toBeNull();
  });

  it("returns the fallback instead of throwing when storage is unavailable", async () => {
    const getItem = AsyncStorage.getItem as jest.Mock;
    getItem.mockRejectedValueOnce(new Error("QuotaExceededError"));

    await expect(
      readValidated(StorageKeys.savedPosts, Schema, ["safe"]),
    ).resolves.toEqual(["safe"]);
  });
});

describe("write", () => {
  it("reports failure rather than throwing when the store rejects", async () => {
    const setItem = AsyncStorage.setItem as jest.Mock;
    setItem.mockRejectedValueOnce(new Error("QuotaExceededError"));

    await expect(write(StorageKeys.savedPosts, ["a"])).resolves.toBe(false);
  });
});

describe("clearAll", () => {
  it("removes every oHub-owned key, current and legacy", async () => {
    await write(StorageKeys.savedPosts, ["a"]);
    await write(StorageKeys.profile, { name: "Test" });
    await AsyncStorage.setItem("@unihub_applications", "[]");

    await clearAll();

    await expect(AsyncStorage.getItem(StorageKeys.savedPosts)).resolves.toBeNull();
    await expect(AsyncStorage.getItem(StorageKeys.profile)).resolves.toBeNull();
    await expect(AsyncStorage.getItem("@unihub_applications")).resolves.toBeNull();
  });
});
