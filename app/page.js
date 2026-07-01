import Timeline from "@/components/Timeline";
import { profile, work } from "@/content/site";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16 sm:py-24">
      <div className="space-y-12">
        <section className="space-y-6">
          <h1 className="text-4xl mb-4 font-bold leading-tight text-foreground">
            {profile.name}
          </h1>
          <p className="text-base mb-8 leading-6 text-foreground">
            Currently {profile.role} at{" "}
            <a
              href={profile.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline underline-offset-2 transition-colors hover:text-accent"
            >
              {profile.company}
            </a>
          </p>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">About</h2>
            {profile.about.map((paragraph, i) => (
              <p key={i} className="text-base leading-6 text-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="space-y-6 mb-16">
          <h2 className="text-lg font-semibold text-foreground">Work</h2>
          <Timeline items={work} />
        </section>

        <section className="space-y-6 mb-12">
          <h2 className="text-lg font-semibold text-foreground">Connect</h2>
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
