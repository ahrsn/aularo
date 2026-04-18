export const HOUR_START = 7;
export const HOUR_END = 24;
export const HOURS = HOUR_END - HOUR_START;

export function hourToPct(h: number): number {
  return ((h - HOUR_START) / HOURS) * 100;
}

export function fmtHour(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function todayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function currentDecimalHour(): number {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}

export function addDaysKey(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function formatDayLabel(iso: string): { date: string; weekday: string } {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    weekday: date.toLocaleDateString("en", { weekday: "short" }),
    date: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
  };
}
