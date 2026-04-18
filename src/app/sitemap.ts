import type { MetadataRoute } from "next";

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://clarra.show";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${baseUrl()}/`, lastModified: now, priority: 1 },
    { url: `${baseUrl()}/login`, lastModified: now, priority: 0.5 },
    { url: `${baseUrl()}/signup`, lastModified: now, priority: 0.8 },
  ];
}
