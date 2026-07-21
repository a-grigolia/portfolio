export default function BannerBlock({
  src,
  alt = "",
  color = "#f8f4f1",
  imageWidth = 330,
}) {
  return (
    <div
      className="flex h-[320px] w-full items-center justify-center rounded-2xl p-8 sm:h-[480px] sm:p-12"
      style={{ backgroundColor: color }}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-full"
        style={{ width: imageWidth, maxWidth: "100%" }}
      />
    </div>
  );
}
