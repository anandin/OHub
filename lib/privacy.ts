/**
 * Display helpers for personal data.
 *
 * oHub stores a student's name, school, OUAC reference number and marks — in
 * their account, and cached on each device they sign in on. Access control is
 * not the whole problem: an OUAC reference identifies a real application, and
 * these screens get shown over shoulders in classrooms and screenshotted into
 * group chats. Being the only person entitled to read it does not help if it
 * is legible from the next desk.
 */

/**
 * Mask an OUAC reference for display, keeping the last four digits so the
 * student can still tell it is theirs.
 *
 * `2026-1093478` → `••••-•••3478`
 */
export function maskOuacRef(ref: string | undefined | null): string {
  if (typeof ref !== "string") return "Not set";

  const trimmed = ref.trim();
  if (trimmed === "") return "Not set";

  const visible = 4;
  if (trimmed.length <= visible) return trimmed;

  const tail = trimmed.slice(-visible);
  const head = trimmed
    .slice(0, -visible)
    .replace(/[^\s-]/g, "•");

  return `${head}${tail}`;
}

/**
 * Strip control and invisible characters from free text before it is stored or
 * rendered.
 *
 * Guards against bidi-override and zero-width characters being pasted into a
 * name or a note, which can make displayed text read differently from the text
 * that was actually saved.
 */
export function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .trim()
    .slice(0, maxLength);
}
