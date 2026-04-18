/**
 * Tiny CSV helpers. Properly escapes cells containing commas, quotes, or
 * newlines per RFC 4180. Returns a string ready to wrap in a Blob.
 */

export function toCsv(rows: Array<Record<string, unknown>>, columns?: string[]): string {
  if (rows.length === 0) return "";
  const cols = columns ?? Object.keys(rows[0]);
  const lines = [cols.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(cols.map((c) => csvCell(row[c])).join(","));
  }
  return lines.join("\n");
}

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
