import Placeholder from "./Placeholder";

// Renders a real image when `src` is provided, otherwise a labeled
// placeholder block. Always fills its (aspect-ratio'd) parent.
export default function Visual({ src, alt, color, label, fit = "cover" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || label || ""}
        loading="lazy"
        className={`h-full w-full ${
          fit === "contain" ? "object-contain" : "object-cover"
        }`}
      />
    );
  }
  return <Placeholder color={color} label={label} className="h-full w-full" />;
}
