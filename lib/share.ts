import { Platform, Share } from "react-native";

/**
 * Share a post.
 *
 * The share control existed in `PostCard` with no `onPress` — a button that
 * looked live and did nothing. Rather than remove the affordance, this wires it
 * to the platform: the native share sheet on iOS/Android, the Web Share API
 * where the browser supports it, and a clipboard copy everywhere else.
 */
export interface ShareResult {
  ok: boolean;
  /** How the content left the app, for the confirmation message. */
  via: "sheet" | "clipboard" | "none";
}

export async function sharePost(input: {
  title: string;
  body: string;
  url?: string;
}): Promise<ShareResult> {
  const message = input.url ? `${input.title}\n\n${input.url}` : input.title;

  if (Platform.OS !== "web") {
    try {
      await Share.share({ title: input.title, message });
      return { ok: true, via: "sheet" };
    } catch {
      return { ok: false, via: "none" };
    }
  }

  if (typeof navigator === "undefined") return { ok: false, via: "none" };

  const webNavigator = navigator as Navigator & {
    share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
  };

  if (typeof webNavigator.share === "function") {
    try {
      await webNavigator.share({
        title: input.title,
        text: input.body.slice(0, 200),
        ...(input.url ? { url: input.url } : {}),
      });
      return { ok: true, via: "sheet" };
    } catch {
      // The user dismissed the sheet, or the browser refused. Fall through to
      // the clipboard rather than reporting a failure they did not cause.
    }
  }

  try {
    await navigator.clipboard?.writeText(message);
    return { ok: true, via: "clipboard" };
  } catch {
    return { ok: false, via: "none" };
  }
}
