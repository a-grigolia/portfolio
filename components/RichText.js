import { Fragment } from "react";

function renderInline(text) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isBold = label.startsWith("**") && label.endsWith("**");
      const text = isBold ? label.slice(2, -2) : label;

      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline underline-offset-2 transition-colors hover:text-accent ${
            isBold ? "font-semibold text-foreground" : ""
          }`}
        >
          {text}
        </a>
      );
    }

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

export default function RichText({ children }) {
  return renderInline(children);
}
