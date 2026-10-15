import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  return (
    <footer className="mt-24">
      <div className="mx-auto flex max-w-[816px] flex-row items-center justify-between px-6 py-6 text-[14px] text-foreground sm:px-12">
        <p>© {new Date().getFullYear()}</p>
        <ThemeToggle />
      </div>
    </footer>
  );
}
