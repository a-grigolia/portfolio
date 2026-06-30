import { profile } from "@/content/site";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-border/60">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-12 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <div className="flex items-center gap-6">
          <a
            href={`mailto:${profile.email}`}
            className="transition-colors hover:text-foreground"
          >
            {profile.email}
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            {profile.linkedinLabel}
          </a>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
