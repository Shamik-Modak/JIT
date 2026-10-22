import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-9 place-items-center rounded-full border-2 border-ink bg-primary font-display text-xl text-primary-foreground shadow-brutal-sm">
        Q
      </span>
      <span className="font-display text-2xl">Quizzly</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest md:flex">
          <a href="/#how" className="hover:text-primary">
            How it works
          </a>
          <a href="/#domains" className="hover:text-primary">
            Domains
          </a>
          <a href="/#feedback" className="hover:text-primary">
            Feedback
          </a>
        </nav>
        <Button asChild variant="ink" size="sm" className="h-9 px-4">
          <Link to="/learn">Start learning</Link>
        </Button>
      </div>
    </header>
  );
}
