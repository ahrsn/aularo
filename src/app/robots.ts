import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/site";

function baseUrl() {
  return APP_URL;
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup"],
        disallow: ["/app/", "/api/", "/screen/", "/onboarding"],
      },
    ],
    sitemap: `${baseUrl()}/sitemap.xml`,
    host: baseUrl(),
  };
}
