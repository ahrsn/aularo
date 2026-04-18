export const AUTOMATION_ICONS = [
  "lightning",
  "clock",
  "door-open",
  "door",
  "coffee",
  "bell",
  "calendar",
  "sparkle",
  "moon",
  "sun",
  "broadcast",
  "warning",
] as const;

export type AutomationIcon = (typeof AUTOMATION_ICONS)[number];
