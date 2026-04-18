// Maps internal error codes thrown by server actions into copy the user can read.
// Add new entries here rather than translating at each call site.

const MESSAGES: Record<string, string> = {
  // Displays
  DISPLAY_LIMIT_REACHED:
    "You've hit your display limit. Upgrade your plan to add more.",
  DISPLAY_NOT_FOUND: "That display no longer exists.",
  CODE_TAKEN: "That code is already used by another display.",
  CODE_NOT_FOUND: "That code doesn't match any display.",
  WORKSPACE_SLUG_REQUIRED:
    "Set a workspace slug in settings before creating a display.",
  WORKSPACE_NOT_FOUND: "That workspace doesn't exist.",
  SLUG_NOT_FOUND: "That workspace link doesn't exist.",

  // Content
  SLIDESHOW_NOT_FOUND: "That slideshow no longer exists.",
  SUBMISSION_NOT_FOUND: "That submission no longer exists.",

  // Invites
  INVITE_NOT_FOUND: "That invite link is invalid.",
  INVITE_EXPIRED: "That invite has expired. Ask for a new one.",

  // Plan gates
  PLAN_REQUIRED: "Upgrade your plan to use this.",
  PLAN_LIMIT: "You've hit your plan limit. Upgrade to add more.",
  STORAGE_LIMIT: "You're out of storage. Upgrade or delete old media.",
};

const CODE_SHAPE = /^[A-Z][A-Z0-9_]{2,}$/;

const UPGRADE_CODES = new Set([
  "DISPLAY_LIMIT_REACHED",
  "PLAN_LIMIT",
  "PLAN_REQUIRED",
  "STORAGE_LIMIT",
]);

export type ErrorState = {
  text: string;
  upgrade: boolean;
};

export function toErrorState(err: unknown, fallback?: string): ErrorState {
  const code = errorCode(err);
  return {
    text: humanizeError(err, fallback),
    upgrade: code ? UPGRADE_CODES.has(code) : false,
  };
}

export function isUpgradeError(err: unknown): boolean {
  const code = errorCode(err);
  return code ? UPGRADE_CODES.has(code) : false;
}

export function humanizeError(
  err: unknown,
  fallback = "Something went wrong. Try again.",
): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";
  if (!raw) return fallback;
  if (MESSAGES[raw]) return MESSAGES[raw];
  // Internal code shape (e.g. FOO_BAR_BAZ) that isn't mapped — don't leak it.
  if (CODE_SHAPE.test(raw)) return fallback;
  return raw;
}

export function errorCode(err: unknown): string | null {
  const raw = err instanceof Error ? err.message : "";
  return CODE_SHAPE.test(raw) ? raw : null;
}
