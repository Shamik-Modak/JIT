import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";

import heroImg from "@/assets/hero-book.jpg";
import { SiteHeader, Logo } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { DOMAINS } from "@/lib/domains";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quizzly — Learn any subject with your personal AI tutor" },
      {
        name: "description",
        content:
          "Choose a domain, pick a topic, and take an AI-generated quiz. Get the right answer and a clear explanation every time you slip.",
      },
      { property: "og:title", content: "Quizzly — Learn any subject with your personal AI tutor" },
      {
        property: "og:description",
        content: "Any domain. Any topic. Quizzes that teach you through your mistakes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Hero />
      <DomainMarquee />
      <HowItWorks />
      <FeedbackShowcase />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="paper-grain relative overflow-hidden border-b-2 border-ink">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-3 py-1 font-mono text-xs uppercase tracking-widest shadow-brutal-sm">
            <Sparkles className="size-3.5" /> Personal AI tutor
          </span>
          <h1 className="mt-6 font-display text-6xl leading-[0.95] md:text-8xl">
            Learn <em className="text-primary">anything</em>,
            <br />
            one <span className="marker">question</span> at a time.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Pick a domain, choose a topic, and take a quiz built just for you. Get it wrong? Your
            tutor shows the right answer and explains why.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild variant="hero" size="xl">
              <Link to="/learn">
                Start a quiz <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="paper" size="xl">
              <a href="#how">See how it works</a>
            </Button>
          </div>
          <div className="mt-10 flex gap-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span>
              <strong className="block font-display text-3xl normal-case tracking-normal text-foreground">
                ∞
              </strong>
              domains
            </span>
            <span>
              <strong className="block font-display text-3xl normal-case tracking-normal text-foreground">
                3
              </strong>
              steps
            </span>
            <span>
              <strong className="block font-display text-3xl normal-case tracking-normal text-foreground">
                100%
              </strong>
              explained
            </span>
          </div>
        </div>

        <div className="relative animate-rise [animation-delay:150ms]">
          <div className="card-brutal shadow-brutal-lg overflow-hidden p-0">
            <img
              src={heroImg}
              alt="Open book with subjects like science, maths, music and history flying out"
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="card-brutal absolute -bottom-8 -left-4 w-64 rotate-[-4deg] p-4 md:-left-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Physics · Q3 of 5
            </p>
            <p className="mt-1 text-sm font-semibold">What is the SI unit of force?</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border-2 border-ink bg-success px-3 py-1.5 text-sm text-success-foreground">
              <Check className="size-4" /> Newton
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DomainMarquee() {
  const items = [...DOMAINS, ...DOMAINS];
  return (
    <section id="domains" className="overflow-hidden border-b-2 border-ink bg-ink py-5 text-paper">
      <div className="flex w-max animate-marquee gap-10">
        {items.map((d, i) => (
          <span key={i} className="flex items-center gap-3 font-display text-3xl">
            <d.icon className="size-6 text-highlight" />
            {d.name}
            <span className="text-primary">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Choose your domain",
    body: "Computer science, medicine, history, music — or type in any field you like.",
  },
  {
    n: "02",
    title: "Pick a topic",
    body: "Go narrow or broad. Your tutor tailors every question to exactly what you want to learn.",
  },
  {
    n: "03",
    title: "Quiz & learn",
    body: "Answer one question at a time. Miss one and you instantly see the right answer with a clear explanation.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="border-b-2 border-ink">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">How it works</p>
        <h2 className="mt-3 max-w-2xl font-display text-5xl leading-tight md:text-6xl">
          Three steps from curious to confident.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={`card-brutal press p-7 ${i === 1 ? "bg-accent" : ""}`}
            >
              <span className="font-display text-6xl text-primary">{s.n}</span>
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeedbackShowcase() {
  const options = ["O(n)", "O(log n)", "O(n²)", "O(1)"];
  return (
    <section id="feedback" className="paper-grain border-b-2 border-ink">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Mistakes welcome
          </p>
          <h2 className="mt-3 font-display text-5xl leading-tight md:text-6xl">
            Every wrong answer becomes a <em>mini lesson</em>.
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            No more guessing why you got it wrong. Your AI tutor highlights the correct option and
            explains the reasoning in plain language, so it sticks next time.
          </p>
        </div>

        <div className="card-brutal shadow-brutal-lg p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Computer Science · Algorithms
          </p>
          <p className="mt-2 text-lg font-semibold">
            What is the time complexity of binary search on a sorted array?
          </p>
          <div className="mt-5 grid gap-2.5">
            {options.map((o, i) => {
              const wrong = i === 0;
              const right = i === 1;
              return (
                <div
                  key={o}
                  className={`flex items-center justify-between rounded-lg border-2 border-ink px-4 py-2.5 font-mono text-sm ${
                    wrong
                      ? "bg-destructive text-destructive-foreground"
                      : right
                        ? "bg-success text-success-foreground"
                        : "bg-card"
                  }`}
                >
                  {o}
                  {wrong && <X className="size-4" />}
                  {right && <Check className="size-4" />}
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-lg border-2 border-dashed border-ink bg-accent p-4 text-sm">
            <p className="font-semibold">Why O(log n)?</p>
            <p className="mt-1 text-accent-foreground/80">
              Binary search halves the search space on every step, so it needs at most log₂(n)
              comparisons — not one per element.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-b-2 border-ink bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-20 md:flex-row md:items-center">
        <h2 className="max-w-2xl font-display text-5xl leading-tight md:text-7xl">
          What do you want to master today?
        </h2>
        <Button asChild variant="ink" size="xl">
          <Link to="/learn">
            Start learning <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 md:flex-row">
      <Logo />
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        © {new Date().getFullYear()} Quizzly · Learn by doing
      </p>
    </footer>
  );
}
