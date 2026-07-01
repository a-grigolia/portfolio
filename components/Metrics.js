import RichText from "./RichText";

function MetricCard({ value, label }) {
  return (
    <div className="rounded-2xl bg-card p-6">
      <p className="font-sans text-[16px] tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 font-sans text-[16px] text-subtle">{label}</p>
    </div>
  );
}

export default function Metrics({ cards = [], quote, layout }) {
  const isGrid = layout === "grid-3" && !quote;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
      {cards.length ? (
        isGrid ? (
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
            {cards.map((card, i) => (
              <MetricCard key={i} value={card.value} label={card.label} />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 sm:w-[240px] sm:flex-col">
            {cards.map((card, i) => (
              <div key={i} className="flex-1 sm:flex-none">
                <MetricCard value={card.value} label={card.label} />
              </div>
            ))}
          </div>
        )
      ) : null}

      {quote ? (
        <figure className="flex flex-1 flex-col justify-between gap-8 rounded-2xl bg-card p-6">
          <blockquote className="font-serif text-xl leading-snug tracking-tight text-foreground sm:text-2xl">
            {quote.text}
          </blockquote>
          {quote.attribution ? (
            <figcaption className="text-sm text-subtle">
              <RichText>{quote.attribution}</RichText>
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </div>
  );
}
