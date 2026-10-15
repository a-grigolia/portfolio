import type { CSSProperties } from "react";
import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";
import V2Chrome from "@/components/V2Chrome";
import V2ScrollCue from "@/components/V2ScrollCue";
import V2WorkGrid from "@/components/V2WorkGrid";
import { profile, work, sideProjects } from "@/content/site";

// CSSProperties is closed to custom properties, so extend it for the
// `--reveal-delay` variable used by the reveal animation.
type RevealStyle = CSSProperties & { "--reveal-delay": string };

// Media sizing pulled from the Figma for each project card.
interface CardPresentation {
  mediaWidth: string;
  mediaMaxWidth: string;
  aspect: string;
  mediaVariant?: "plusGrid" | "logo";
}

// Per-project media sizing from the Figma. Widths remain roughly half of each
// card while preserving the intentional variation between projects. Pixel caps
// keep the covers at their designed size on extra-wide screens.
const presentation: Record<string, CardPresentation> = {
  "locale-3": {
    mediaWidth: "51.5%",
    mediaMaxWidth: "420px",
    aspect: "1280 / 802",
  },
  "locale-2": {
    mediaWidth: "51.5%",
    mediaMaxWidth: "420px",
    aspect: "1024 / 575",
  },
  "locale-1": {
    mediaWidth: "51.5%",
    mediaMaxWidth: "420px",
    aspect: "1280 / 802",
  },
  "d-ford": {
    mediaWidth: "40%",
    mediaMaxWidth: "320px",
    aspect: "1024 / 369",
    mediaVariant: "logo",
  },
  "amya-agency": {
    mediaWidth: "62%",
    mediaMaxWidth: "504px",
    aspect: "448 / 280",
    mediaVariant: "plusGrid",
  },
  "tbs-design-gallery": {
    mediaWidth: "47.5%",
    mediaMaxWidth: "388px",
    aspect: "1280 / 676",
  },
};

const order = [
  "locale-3",
  "locale-2",
  "locale-1",
  "tbs-design-gallery",
  "amya-agency",
  "d-ford",
];

const items = [...work, ...sideProjects]
  .sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
  .map((item) => ({ ...item, ...presentation[item.slug] }));

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <V2Chrome />

      {/* Hero: full viewport height, intro centered between hairline rails */}
      <section className="flex h-svh flex-col px-6 md:px-12">
        <div className="relative flex min-h-0 flex-1 flex-col items-center border border-border">
          <div aria-hidden="true" className="grid min-h-0 flex-1 grid-cols-2 self-stretch">
            <div className="border-border min-[1100px]:border-r" />
          </div>

          <div className="flex w-full shrink-0 justify-center border-y border-border">
            <div className="flex w-[576px] max-w-full flex-col gap-12 p-6 md:p-12 min-[1100px]:border-x min-[1100px]:border-border">
              <div className="reveal flex flex-col gap-2">
                <h1 className="text-sm font-semibold leading-6 text-foreground">
                  {profile.name}
                </h1>
                <div className="flex flex-col gap-5 text-sm leading-5 text-foreground">
                  <p>Product designer drawn to 0→1 problems.</p>
                  <p>
                    I&rsquo;ve been the solo founding designer at {" "}
                    <a
                      href="https://www.shoplocale.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 transition-colors hover:text-accent"
                    >
                      Locale
                    </a>{" "}
                    since 2020, owning design and front-end engineering through
                    the company&rsquo;s evolution, building design systems and
                    brand identities from scratch. Before that I was at{" "}
                    <Link
                      href="/work/d-ford"
                      className="underline underline-offset-2 transition-colors hover:text-accent"
                    >
                      Ford&rsquo;s Greenfield Labs
                    </Link>
                    .
                  </p>
                  <p>
                    Everything I make starts with the customer and ends with
                    shipped code.
                  </p>
                </div>
              </div>

              <div
                className="reveal flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-5"
                style={{ "--reveal-delay": "80ms" } as RevealStyle}
              >
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground transition-colors hover:text-accent"
                >
                  {profile.linkedinLabel}
                </a>
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground transition-colors hover:text-accent"
                >
                  {profile.resumeLabel}
                </a>
                <CopyEmail email={profile.email} size="sm" />
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="grid min-h-0 flex-1 grid-cols-2 self-stretch">
            <div className="border-border min-[1100px]:border-r" />
          </div>

          {/* Scroll cue: the grid lives below the fold */}
          <V2ScrollCue />
        </div>
      </section>

      {/* Case studies: square cells, half the rail width each on desktop */}
      <section id="work" className="px-6 md:px-12">
        <div className="border-x border-border">
          <V2WorkGrid items={items} />
        </div>
      </section>
    </div>
  );
}
