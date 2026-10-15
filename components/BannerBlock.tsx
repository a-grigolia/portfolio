import type { MediaFit } from "@/content/case-studies";

interface BannerBlockProps {
  src: string;
  alt?: string;
  color?: string;
  imageWidth?: string | number;
  fit?: MediaFit;
  caption?: string;
}

export default function BannerBlock({
  src,
  alt = "",
  color = "#f8f4f1",
  imageWidth = 330,
  fit,
  caption,
}: BannerBlockProps) {
  return (
    <figure>
      <div
        className={`h-[320px] w-full overflow-hidden rounded-2xl sm:h-[480px] ${
          fit === "cover"
            ? ""
            : "flex items-center justify-center p-8 sm:p-12"
        }`}
        style={{ backgroundColor: color }}
      >
        {fit === "cover" ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <img
            src={src}
            alt={alt}
            className="max-h-full object-contain"
            style={{ width: imageWidth, maxWidth: "100%" }}
          />
        )}
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-[12px] leading-4 text-subtle">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
