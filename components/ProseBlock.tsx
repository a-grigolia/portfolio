import type { ReactNode } from "react";
import RichText from "./RichText";
import type { ProseParagraph } from "@/content/case-studies";

interface ProseBlockProps {
  heading?: string;
  paragraphs?: ProseParagraph[];
  children?: ReactNode;
}

export default function ProseBlock({ heading, paragraphs = [], children }: ProseBlockProps) {
  return (
    <div className="mb-12 px-2 sm:px-12">
      {heading ? (
        <h2 className="mb-4 font-sans text-[16px] font-normal text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="space-y-5 text-subtle">
        {paragraphs.map((paragraph, i) =>
          typeof paragraph === "object" ? (
            <ol key={i} className="list-decimal space-y-0 pl-6 font-sans text-[15px] leading-6">
              {paragraph.list.map((item, j) => (
                <li key={j}>
                  <RichText>{item}</RichText>
                </li>
              ))}
            </ol>
          ) : (
            <p key={i} className="font-sans text-[15px] leading-6">
              <RichText>{paragraph}</RichText>
            </p>
          )
        )}
        {children}
      </div>
    </div>
  );
}
