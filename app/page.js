import Timeline from "@/components/Timeline";
import CopyEmail from "@/components/CopyEmail";
import { profile, work, sideProjects } from "@/content/site";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[816px] px-6 py-16 sm:px-12 sm:py-24">
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-12">
          <div className="reveal flex flex-col gap-2">
            <h1 className="text-base font-semibold leading-tight text-foreground">
              {profile.name}
            </h1>
            <p className="text-base leading-6 text-foreground">
              Currently Founding Designer at{" "}
              <a
                href="https://www.shoplocale.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground underline underline-offset-2 transition-colors hover:text-accent"
              >
                Locale
              </a>
            </p>
          </div>

          <div className="reveal flex flex-col gap-2" style={{ "--reveal-delay": "80ms" }}>
            <h2 className="text-base font-semibold text-foreground">About</h2>
            {profile.about.map((paragraph, i) => (
              <p key={i} className="text-base leading-6 text-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section
          className="reveal flex flex-col gap-6"
          style={{ "--reveal-delay": "160ms" }}
        >
          <h2 className="text-base font-semibold text-foreground">Work</h2>
          <Timeline items={work} />
        </section>

        <section
          className="reveal flex flex-col gap-6"
          style={{ "--reveal-delay": "240ms" }}
        >
          <h2 className="text-base font-semibold text-foreground">
            Projects
          </h2>
          <Timeline items={sideProjects} />
        </section>

        <section
          className="reveal flex flex-col gap-2"
          style={{ "--reveal-delay": "320ms" }}
        >
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
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-foreground transition-colors hover:text-accent"
            >
              {profile.resumeLabel}
            </a>
            <CopyEmail email={profile.email} />
          </div>
        </section>
      </div>
    </div>
  );
}
