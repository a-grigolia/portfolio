import Link from "next/link";
import Hero from "./Hero";
import SectionNav from "./SectionNav";
import ProseBlock from "./ProseBlock";
import ImageBlock from "./ImageBlock";
import BannerBlock from "./BannerBlock";
import Gallery from "./Gallery";
import Metrics from "./Metrics";
import LocaleDemo from "./locale-ds/LocaleDemo";
import PlusGrid from "./PlusGrid";
import ThemePill from "./ThemePill";

function Block({ block }) {
  switch (block.type) {
    case "prose":
      return <ProseBlock heading={block.heading} paragraphs={block.paragraphs} />;
    case "banner":
      return (
        <BannerBlock
          src={block.src}
          alt={block.alt}
          color={block.color}
          imageWidth={block.imageWidth}
        />
      );
    case "image":
      return (
        <ImageBlock
          src={block.src}
          srcDark={block.srcDark}
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
    case "plusGrid":
      return (
        <div className="flex flex-col items-center gap-12">
          <ThemePill />
          <PlusGrid />
        </div>
      );
    default:
      return null;
  }
}

export default function CaseStudyLayout({
  title,
  subtitle,
  stats = [],
  sections = [],
}) {
  const navSections = sections.map((s) => ({ id: s.id, label: s.label }));

  return (
    <article className="relative px-6 pb-8">
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-subtle"
      >
        <span aria-hidden="true">←</span> Back
      </Link>

      {/* Content column matches the homepage: 816px, text padded in to 720px */}
      <div className="mx-auto w-full max-w-[816px] pt-16 sm:pt-24">
        <Hero title={title} subtitle={subtitle} stats={stats} />

        {/* Section nav aligns with the top of the first (Context) section */}
        <div className="relative mt-12">
          <div>
            {sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className={`scroll-mt-24 ${i === 0 ? "" : section.className ?? "py-6"}`}
              >
                <div className="space-y-12">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="absolute inset-y-0 left-full ml-16 hidden xl:block">
            <div className="sticky top-24">
              <SectionNav sections={navSections} />
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
