import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/site";

function baseUrl() {
  return APP_URL;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${baseUrl()}/`, lastModified: now, priority: 1 },
    { url: `${baseUrl()}/login`, lastModified: now, priority: 0.5 },
    { url: `${baseUrl()}/signup`, lastModified: now, priority: 0.8 },
  ];
}
