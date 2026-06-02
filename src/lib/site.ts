/**
 * Public product, domain, and marketing-link constants.
 *
 * Keep user-facing brand/domain strings here so the marketing site, dashboard,
 * pairing flow, metadata, and docs links do not drift.
 */

export const SITE_NAME = "Aularo";
export const FORMER_SITE_NAME = "Clarra";
export const SITE_TAGLINE =
  "slideshow software for events, galleries, and kiosks";
export const SITE_DESCRIPTION =
  "Run beautiful slideshows across every screen at your event. Pair a display in seconds. Schedule the night. Sync from Drive or Dropbox.";

export const DEFAULT_APP_URL = "https://aularo.com";
export const DEFAULT_SCREEN_URL = "https://screen.aularo.com";
export const DEFAULT_DASHBOARD_URL = DEFAULT_SCREEN_URL;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const APP_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL,
);
export const SCREEN_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SCREEN_URL ?? DEFAULT_SCREEN_URL,
);
export const DASHBOARD_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_DASHBOARD_URL ??
    process.env.NEXT_PUBLIC_SCREEN_URL ??
    DEFAULT_DASHBOARD_URL,
);

export const APP_HOST = new URL(APP_URL).host;
export const SCREEN_HOST = new URL(SCREEN_URL).host;
export const DASHBOARD_HOST = new URL(DASHBOARD_URL).host;
export const APP_DISPLAY_URL = APP_URL.replace(/^https?:\/\//, "");
export const SCREEN_DISPLAY_URL = SCREEN_URL.replace(/^https?:\/\//, "");
export const DASHBOARD_DISPLAY_URL = DASHBOARD_URL.replace(/^https?:\/\//, "");

export function claimUrl(workspaceSlug: string, shortCode: string): string {
  return `${SCREEN_URL}/d/${workspaceSlug}/${shortCode}`;
}

/** Public GitHub repo. Empty until the Community Edition is published. */
export const GITHUB_URL = "";

/** Public docs site. Empty until one exists. */
export const DOCS_URL = "";

/** Where "open source / self-host" CTAs point right now. */
export const OPEN_SOURCE_HREF = GITHUB_URL || "#open-source";

/** Where "Docs" links point right now. */
export const DOCS_HREF = DOCS_URL || "#open-source";

/** True once the public repo link is configured. */
export const HAS_PUBLIC_REPO = GITHUB_URL.length > 0;
