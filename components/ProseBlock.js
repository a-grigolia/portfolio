import RichText from "./RichText";

export default function ProseBlock({ heading, paragraphs = [], children }) {
  return (
    <div className="mb-12 px-2 sm:px-12">
      {heading ? (
        <h2 className="font-sans text-[18px] font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mt-4 space-y-5 text-subtle">
        {paragraphs.map((paragraph, i) =>
          paragraph && typeof paragraph === "object" && paragraph.list ? (
            <ol key={i} className="list-decimal space-y-0 pl-6 font-sans text-[16px] leading-6">
              {paragraph.list.map((item, j) => (
                <li key={j}>
                  <RichText>{item}</RichText>
                </li>
              ))}
            </ol>
          ) : (
            <p key={i} className="font-sans text-[16px] leading-6">
              <RichText>{paragraph}</RichText>
            </p>
          )
        )}
        {children}
      </div>
    </div>
  );
}
