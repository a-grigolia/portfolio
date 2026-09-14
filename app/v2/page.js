import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";
import LocalClock from "@/components/LocalClock";
import ThemeToggle from "@/components/ThemeToggle";
import V2Chrome from "@/components/V2Chrome";
import V2ScrollCue from "@/components/V2ScrollCue";
import V2WorkGrid from "@/components/V2WorkGrid";
import { profile, work, sideProjects } from "@/content/site";

export const metadata = {
  title: "Avto, Product Designer — v2",
};

// Per-project media sizing from the Figma. Widths remain roughly half of each
// card while preserving the intentional variation between projects. Pixel caps
// keep the covers at their designed size on extra-wide screens.
const presentation = {
  "locale-3": {
    mediaWidth: "51.5%",
    mediaMaxWidth: "420px",
    aspect: "420 / 302",
    shadowColor: "#263a35",
  },
  "locale-2": {
    mediaWidth: "51.5%",
    mediaMaxWidth: "420px",
    aspect: "420 / 275",
    shadowColor: "#704942",
  },
  "locale-1": {
    mediaWidth: "51.5%",
    mediaMaxWidth: "420px",
    aspect: "420 / 302",
    shadowColor: "#6d573f",
  },
  "d-ford": {
    mediaWidth: "56%",
    mediaMaxWidth: "457px",
    aspect: "457 / 317",
    shadowColor: "#394b76",
  },
  "amya-agency": {
    mediaWidth: "55%",
    mediaMaxWidth: "448px",
    aspect: "448 / 280",
    shadowColor: "#3a3a3e",
  },
};

const items = [
  ...work.map((item) => ({ ...item, ...presentation[item.slug] })),
  ...sideProjects.map((item) => ({ ...item, ...presentation[item.slug] })),
  {
    slug: "tbs-design-gallery",
    title: "TBS Design Gallery",
    subtitle: "Coming soon",
    year: "2026",
    comingSoon: true,
    mediaWidth: "47.5%",
    mediaMaxWidth: "388px",
    aspect: "388 / 279",
  },
];

export default function V2Page() {
  return (
    <div className="flex min-h-dvh flex-col">
      <V2Chrome />

      {/* Hero: full viewport height, intro centered between hairline rails */}
      <section className="flex h-dvh flex-col px-6 md:px-12">
        <div className="relative flex min-h-0 flex-1 flex-col items-center border-x border-border">
          <div aria-hidden="true" className="relative min-h-0 flex-1 self-stretch">
            <span className="absolute inset-y-0 left-1/2 hidden border-l border-border min-[1100px]:block" />
          </div>

          <div className="flex w-full shrink-0 justify-center border-y border-border">
            <div className="flex w-[576px] max-w-full flex-col gap-12 p-6 sm:p-12 min-[1100px]:border-x min-[1100px]:border-border">
              <img
                src="/a.svg"
                alt="Avto logo"
                className="reveal h-[26px] w-6 dark:invert min-[1100px]:hidden"
              />
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
                style={{ "--reveal-delay": "80ms" }}
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

          <div aria-hidden="true" className="relative min-h-0 flex-1 self-stretch">
            <span className="absolute inset-y-0 left-1/2 hidden border-l border-border min-[1100px]:block" />
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

      {/* Mobile footer, matching the homepage pattern (<1100px) */}
      <footer className="flex w-full items-center justify-between px-6 py-6 text-[12px] leading-[20px] min-[1100px]:hidden">
        <LocalClock />
        <ThemeToggle />
      </footer>
    </div>
  );
}
