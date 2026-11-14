import type { MetadataRoute } from "next";
import { getCaseStudySlugs } from "@/content/case-studies";
import { siteUrl } from "@/content/site";

// Public pages only. /v1 and /lab stay out until they're meant to be found.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    { url: `${siteUrl}/breakaway` },
    ...getCaseStudySlugs().map((slug) => ({ url: `${siteUrl}/work/${slug}` })),
  ];
}
