import Link from "next/link";
import Hero from "./Hero";
import SectionNav from "./SectionNav";
import ProseBlock from "./ProseBlock";
import ImageBlock from "./ImageBlock";
import Gallery from "./Gallery";
import Metrics from "./Metrics";
import LocaleDemo from "./locale-ds/LocaleDemo";

function Block({ block }) {
  switch (block.type) {
    case "prose":
      return <ProseBlock heading={block.heading} paragraphs={block.paragraphs} />;
    case "image":
      return (
        <ImageBlock
          src={block.src}
          color={block.color}
          label={block.label}
          caption={block.caption}
          ratio={block.ratio}
          fit={block.fit}
          shadow={block.shadow}
          border={block.border}
          radius={block.radius}
        />
      );
    case "gallery":
      return (
        <Gallery items={block.items} caption={block.caption} layout={block.layout} />
      );
    case "metrics":
      return (
        <Metrics cards={block.cards} quote={block.quote} layout={block.layout} />
      );
    case "demo":
      return <LocaleDemo />;
    default:
      return null;
  }
}

export default function CaseStudyLayout({
  eyebrow,
  title,
  subtitle,
  stats = [],
  sections = [],
}) {
  const navSections = sections.map((s) => ({ id: s.id, label: s.label }));

  return (
    <article className="relative mx-auto max-w-6xl px-6 pt-12 pb-8 sm:pt-16">
      {/* Centered content + image column */}
      <div className="mx-auto max-w-[720px]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-12 text-sm text-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span> Back
        </Link>

        <div className="mt-10">
          <Hero eyebrow={eyebrow} title={title} subtitle={subtitle} stats={stats} />
        </div>

        <div className="mt-20">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 border-t border-border/60 py-12 first:border-t-0 first:pt-0"
            >
              <div className="space-y-12">
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Section nav floats in the right margin, offset from the centered column */}
      <aside className="absolute inset-y-0 right-6 hidden xl:block">
        <div className="sticky top-32">
          <SectionNav sections={navSections} />
        </div>
      </aside>
    </article>
  );
}
