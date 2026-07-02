import Timeline from "@/components/Timeline";
import { profile, work } from "@/content/site";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[816px] px-6 py-16 sm:px-12 sm:py-24">
      <div className="flex flex-col gap-16">
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-semibold leading-tight text-foreground">
              {profile.name}
            </h1>
            <p className="text-base leading-6 text-foreground">
              Currently Founding Designer at{" "}
              <a
                href="https://www.shoplocale.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-subtle underline underline-offset-2 transition-colors hover:text-accent"
              >
                Locale
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">About</h2>
            {profile.about.map((paragraph, i) => (
              <p key={i} className="text-base leading-6 text-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-base font-semibold text-foreground">Work</h2>
          <Timeline items={work} />
        </section>

        {/* Side Projects section temporarily hidden
        <section className="flex flex-col gap-6">
          <h2 className="text-base font-semibold text-foreground">
            Side Projects
          </h2>
          <Timeline items={sideProjects} />
        </section>
        */}

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">Connect</h2>
          <div className="flex flex-col text-base leading-6">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-foreground transition-colors hover:text-accent"
            >
              {profile.linkedinLabel}
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="w-fit text-foreground transition-colors hover:text-accent"
            >
              Email
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
