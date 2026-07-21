export default function BannerBlock({
  src,
  alt = "",
  color = "#f8f4f1",
  imageWidth = 330,
  fit,
  caption,
}) {
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
            className="max-h-full"
            style={{ width: imageWidth, maxWidth: "100%" }}
          />
        )}
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
