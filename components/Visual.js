import Placeholder from "./Placeholder";

// Renders a real image when `src` is provided, otherwise a labeled
// placeholder block. Always fills its (aspect-ratio'd) parent.
// Optional `srcDark` swaps in for dark mode (e.g. diagrams with light strokes).
export default function Visual({ src, srcDark, alt, color, label, fit = "cover" }) {
  if (src) {
    const fitClass = fit === "contain" ? "object-contain" : "object-cover";
    const altText = alt || label || "";

    if (srcDark) {
      return (
        <>
          <img
            src={src}
            alt={altText}
            loading="lazy"
            className={`h-full w-full dark:hidden ${fitClass}`}
          />
          <img
            src={srcDark}
            alt={altText}
            loading="lazy"
            className={`hidden h-full w-full dark:block ${fitClass}`}
          />
        </>
      );
    }

    return (
      <img
        src={src}
        alt={altText}
        loading="lazy"
        className={`h-full w-full ${fitClass}`}
      />
    );
  }
  return <Placeholder color={color} label={label} className="h-full w-full" />;
}
