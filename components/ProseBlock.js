import RichText from "./RichText";

export default function ProseBlock({ heading, paragraphs = [], children }) {
  return (
    <div className="px-0 pb-12 m-0 lg:px-12">
      {heading ? (
        <h2 className="font-sans text-[18px] font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mt-4 space-y-5 text-subtle">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="font-sans text-[16px] leading-snug">
            <RichText>{paragraph}</RichText>
          </p>
        ))}
        {children}
      </div>
    </div>
  );
}
