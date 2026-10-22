import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowUpRight, Clock, Compass, Loader2, Target, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  conceptBreakdown,
  fetchLearningPathway,
  type QuizResponse,
} from "@/lib/tutor-api";

export function ConceptBreakdown({ responses }: { responses: QuizResponse[] }) {
  const rows = conceptBreakdown(responses);
  return (
    <div className="card-brutal p-6 md:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">Where you stand</p>
      <h2 className="mt-2 font-display text-4xl">Concept by concept</h2>
      <div className="mt-6 grid gap-4">
        {rows.map((r) => {
          const pct = Math.round((r.correct / r.total) * 100);
          const tone =
            pct === 100 ? "bg-success" : pct >= 50 ? "bg-highlight" : "bg-destructive";
          return (
            <div key={r.concept}>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="font-semibold">{r.concept}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {r.correct}/{r.total} correct
                </span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full border-2 border-ink bg-card">
                <div
                  className={`h-full ${tone} transition-all duration-700`}
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LearningPathwayPanel({
  domain,
  topic,
  responses,
  onPracticeWeak,
  practising,
}: {
  domain: string;
  topic: string;
  responses: QuizResponse[];
  onPracticeWeak: (concepts: string[]) => void;
  practising: boolean;
}) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pathway", domain, topic, responses.map((r) => `${r.questionId}:${r.selectedIndex}`)],
    queryFn: () => fetchLearningPathway({ domain, topic, responses }),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="card-brutal flex items-center gap-3 p-8">
        <Loader2 className="size-5 animate-spin text-primary" />
        <p>Your tutor is analysing your answers and building a learning pathway…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card-brutal flex flex-wrap items-center justify-between gap-4 p-8">
        <p>We couldn't build your pathway right now.</p>
        <Button variant="paper" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const weakConcepts = data.weakAreas.map((w) => w.concept);

  return (
    <div className="card-brutal shadow-brutal-lg overflow-hidden p-0">
      <div className="border-b-2 border-ink bg-ink p-6 text-paper md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-highlight">
            <Compass className="size-4" /> Your personalised pathway
          </p>
          <span className="rounded-full border-2 border-paper px-3 py-0.5 font-mono text-[11px] uppercase tracking-widest">
            Level · {data.level}
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed">{data.summary}</p>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-success">
            <Trophy className="size-4" /> Strengths
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.strengths.length ? (
              data.strengths.map((s) => (
                <span
                  key={s}
                  className="rounded-full border-2 border-ink bg-success px-3 py-1 text-sm text-success-foreground"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                Still building — follow the steps below.
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-destructive">
            <AlertTriangle className="size-4" /> Where you're lacking
          </p>
          {data.weakAreas.length ? (
            <ul className="mt-3 grid gap-2">
              {data.weakAreas.map((w) => (
                <li key={w.concept} className="rounded-lg border-2 border-ink bg-card p-3 text-sm">
                  <span className="font-semibold">{w.concept}</span>{" "}
                  <span className="font-mono text-xs text-muted-foreground">
                    · missed {w.missed}/{w.total}
                  </span>
                  <p className="mt-1 text-muted-foreground">{w.why}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No gaps found in this quiz.</p>
          )}
        </div>
      </div>

      <div className="border-t-2 border-ink p-6 md:p-8">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <Target className="size-4" /> What to learn next
        </p>
        <ol className="relative mt-6 grid gap-6 border-l-2 border-dashed border-ink pl-8">
          {data.steps.map((s, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[3.05rem] grid size-9 place-items-center rounded-full border-2 border-ink bg-primary font-display text-lg text-primary-foreground shadow-brutal-sm">
                {i + 1}
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold">{s.title}</h3>
                {s.duration && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> {s.duration}
                  </span>
                )}
              </div>
              <p className="mt-1 text-muted-foreground">{s.description}</p>
              {s.resources && s.resources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="press inline-flex items-center gap-1 rounded-full border-2 border-ink bg-card px-3 py-1 text-sm shadow-brutal-sm hover:bg-accent"
                    >
                      {r.title} <ArrowUpRight className="size-3.5" />
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>

        {weakConcepts.length > 0 && (
          <div className="mt-8">
            <Button
              variant="hero"
              size="xl"
              disabled={practising}
              onClick={() => onPracticeWeak(weakConcepts)}
            >
              {practising ? <Loader2 className="animate-spin" /> : <Target />} Practise my weak
              areas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
