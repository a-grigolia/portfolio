import Link from "next/link";
import { Fragment } from "react";
import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (linkMatch) {
      const label = linkMatch[1] ?? "";
      const href = linkMatch[2] ?? "";
      const isBold = label.startsWith("**") && label.endsWith("**");
      const text = isBold ? label.slice(2, -2) : label;
      const className = `underline underline-offset-2 transition-colors hover:text-accent ${
        isBold ? "font-semibold text-foreground" : ""
      }`;

      if (href.startsWith("/")) {
        return (
          <Link key={i} href={href} className={className}>
            {text}
          </Link>
        );
      }

      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
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

interface RichTextProps {
  children: string;
}

export default function RichText({ children }: RichTextProps) {
  return renderInline(children);
}
