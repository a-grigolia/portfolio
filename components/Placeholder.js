// Solid color block standing in for a real screenshot.
// Swap these out for <img> / next/image once assets exist.
export default function Placeholder({ color = "#d8d2c6", label, className = "" }) {
  return (
    <div
      style={{ backgroundColor: color }}
      className={`grid place-items-center rounded-lg ${className}`}
    >
      <div className="px-4 text-center">
        <span className="block text-xs font-medium uppercase tracking-[0.16em] text-black/45">
          Screenshot
        </span>
        {label ? (
          <span className="mt-1 block text-sm font-medium text-black/65">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
