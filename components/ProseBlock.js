import { Fragment } from "react";

// Renders a paragraph string with lightweight **bold** support.
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function ProseBlock({ heading, paragraphs = [], children }) {
  return (
    <div>
      {heading ? (
        <h2 className="font-sans text-[18px] font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mt-4 space-y-5 font-sans text-[16px] leading-relaxed text-subtle">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{renderInline(paragraph)}</p>
        ))}
        {children}
      </div>
    </div>
  );
}
