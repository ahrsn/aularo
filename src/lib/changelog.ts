import { readFileSync } from "node:fs";
import { join } from "node:path";
import "server-only";

export type ChangelogGroup = {
  title: string;
  icon: string;
  body: string[];
  items: string[];
};

export type ChangelogRelease = {
  version: string;
  date: string;
  lede: string[];
  groups: ChangelogGroup[];
};

const GROUP_ICONS: Record<string, string> = {
  slideshows: "images",
  displays: "monitor",
  schedule: "calendar-blank",
  media: "folder-simple",
  workspace: "buildings",
  billing: "credit-card",
  insights: "chart-line",
  auth: "shield-check",
  added: "sparkle",
  changed: "arrows-clockwise",
  fixed: "wrench",
  removed: "minus-circle",
};

function iconFor(title: string): string {
  const key = title.trim().toLowerCase();
  return GROUP_ICONS[key] ?? "sparkle";
}

function parseReleaseBlock(block: string): ChangelogRelease | null {
  const headerMatch = block.match(/^\[([^\]]+)\]\s*[—-]\s*(\d{4}-\d{2}-\d{2})/);
  if (!headerMatch) return null;
  const [, version, date] = headerMatch;

  const body = block.slice(block.indexOf("\n") + 1).trim();
  const parts = body.split(/^### /m);
  const ledeSource = parts.shift() ?? "";
  const lede = ledeSource
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !/^-{3,}$/.test(p));

  const groups: ChangelogGroup[] = parts.map((part) => {
    const newline = part.indexOf("\n");
    const title = part.slice(0, newline).trim();
    const rest = part.slice(newline + 1).trim();

    const lines = rest.split("\n");
    const body: string[] = [];
    const items: string[] = [];
    let inList = false;
    let paragraph: string[] = [];
    const flushParagraph = () => {
      if (paragraph.length) {
        body.push(paragraph.join(" ").trim());
        paragraph = [];
      }
    };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || /^-{3,}$/.test(line)) {
        if (!inList) flushParagraph();
        continue;
      }
      if (line.startsWith("- ")) {
        flushParagraph();
        inList = true;
        items.push(line.slice(2).trim());
      } else {
        inList = false;
        paragraph.push(line);
      }
    }
    flushParagraph();

    return { title, icon: iconFor(title), body, items };
  });

  return { version, date, lede, groups };
}

let cached: ChangelogRelease[] | null = null;

export function getChangelog(): ChangelogRelease[] {
  if (cached) return cached;
  const path = join(process.cwd(), "CHANGELOG.md");
  const raw = readFileSync(path, "utf8");
  const withoutComments = raw.replace(/<!--[\s\S]*?-->/g, "");
  const blocks = withoutComments
    .split(/^## /m)
    .slice(1)
    .map((b) => b.trim());
  const releases = blocks
    .map(parseReleaseBlock)
    .filter((r): r is ChangelogRelease => r !== null);
  cached = releases;
  return releases;
}

export function getReleaseForVersion(
  version: string,
): ChangelogRelease | null {
  return getChangelog().find((r) => r.version === version) ?? null;
}
