import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "./Footer";
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
import type {
  Block as BlockData,
  LiveSite,
  Section,
  Stat,
} from "@/content/case-studies";

function Block({ block }: { block: BlockData }) {
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
          fit={block.fit}
          caption={block.caption}
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
      return (
        <figure>
          <LocaleDemo />
          <figcaption className="mt-3 text-center text-[12px] leading-4 text-subtle">
            Live demo
          </figcaption>
        </figure>
      );
    case "plusGrid":
      return (
        <div className="flex flex-col items-center gap-12">
          <ThemePill />
          <PlusGrid className="plus-grid" />
        </div>
      );
    default:
      return null;
  }
}

interface CaseStudyLayoutProps {
  title: string;
  subtitle?: ReactNode;
  stats?: Stat[];
  liveSite?: LiveSite;
  sections?: Section[];
}

export default function CaseStudyLayout({
  title,
  subtitle,
  stats = [],
  liveSite,
  sections = [],
}: CaseStudyLayoutProps) {
  const navSections = [
    { id: "intro", label: "Intro" },
    ...sections.map((s) => ({ id: s.id, label: s.label })),
  ];

  return (
    <article className="relative px-4 pb-8 sm:px-6">
      <Link
        href="/"
        aria-label="Home"
        className="absolute left-0 z-10 flex w-6 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 md:left-3 lg:fixed"
        style={{ top: "calc(12px + env(safe-area-inset-top))" }}
      >
        <img
          src="/a.svg"
          alt="Avto logo"
          className="h-[17px] w-4 dark:invert md:h-[26px] md:w-6"
        />
      </Link>

      <aside className="fixed left-3 top-1/2 z-10 hidden -translate-y-1/2 xl:block">
        <SectionNav sections={navSections} />
      </aside>

      {/* Content column matches the homepage: 816px, text padded in to 720px */}
      <div className="mx-auto w-full max-w-[816px] pb-[25svh]">
        <section
          id="intro"
          className="pb-12 pt-[30svh] md:flex md:min-h-svh md:flex-col md:justify-center md:pt-24"
        >
          <Hero title={title} subtitle={subtitle} stats={stats} liveSite={liveSite} />
        </section>

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

      <Footer />
    </article>
  );
}
