import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

// Open to every crawler, AI agents included, so recruiters' tools can read
// the portfolio. /lab also carries a noindex tag for crawlers that ignore this.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/v1", "/lab"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
