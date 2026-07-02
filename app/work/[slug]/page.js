import { notFound } from "next/navigation";
import CaseStudyLayout from "@/components/CaseStudyLayout";
import { getCaseStudy, getCaseStudySlugs } from "@/content/case-studies";

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: `${study.title} — Avto`,
    description: study.metaDescription ?? study.subtitle,
  };
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <CaseStudyLayout
      eyebrow={study.eyebrow}
      title={study.title}
      subtitle={study.subtitle}
      stats={study.stats}
      sections={study.sections}
    />
  );
}
