import type { MetadataRoute } from "next";

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://clarra.show";
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
