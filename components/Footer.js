import { profile } from "@/content/site";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  return (
    <footer className="mt-24">
      <div className="mx-auto flex max-w-[816px] flex-col gap-4 px-6 py-6 text-base leading-6 text-foreground sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <p>© {new Date().getFullYear()}</p>
        <div className="flex items-center gap-4">
          <a
            href={`mailto:${profile.email}`}
            className="transition-colors hover:text-accent"
          >
            {profile.email}
          </a>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
