import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyLayout from "@/components/CaseStudyLayout";
import { getCaseStudy, getCaseStudySlugs } from "@/content/case-studies";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: `${study.title} — Avto`,
    description:
      study.metaDescription ??
      (typeof study.subtitle === "string" ? study.subtitle : undefined),
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <CaseStudyLayout
      title={study.title}
      subtitle={study.subtitle}
      stats={study.stats}
      liveSite={study.liveSite}
      sections={study.sections}
    />
  );
}
