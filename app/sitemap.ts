import type { MetadataRoute } from "next";
import { getCaseStudySlugs } from "@/content/case-studies";
import { siteUrl } from "@/content/site";

// Public pages only. /v1 stays out until it's meant to be found.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    { url: `${siteUrl}/breakaway` },
    { url: `${siteUrl}/strata` },
    { url: `${siteUrl}/proximity` },
    ...getCaseStudySlugs().map((slug) => ({ url: `${siteUrl}/work/${slug}` })),
  ];
}
