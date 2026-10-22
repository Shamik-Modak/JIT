import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

import { ConceptBreakdown, LearningPathwayPanel } from "@/components/learning-pathway";
import { Logo } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { DOMAINS } from "@/lib/domains";
import {
  checkAnswer,
  fetchQuestions,
  isUsingMockApi,
  QUESTION_COUNTS,
  type AnswerResult,
  type QuizQuestion,
  type QuizResponse,
} from "@/lib/tutor-api";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Start a quiz — Quizzly AI tutor" },
      {
        name: "description",
        content:
          "Pick a domain and topic, answer AI-generated questions, and get a personalised learning pathway.",
      },
      { property: "og:title", content: "Start a quiz — Quizzly AI tutor" },
      {
        property: "og:description",
        content: "Choose any domain and topic, take a quiz, and see exactly what to learn next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnPage,
});

type Step = "domain" | "topic" | "quiz" | "results";
type Answer = { question: QuizQuestion; selectedIndex: number; result: AnswerResult };

function LearnPage() {
  const [step, setStep] = useState<Step>("domain");
  const [domain, setDomain] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState<number>(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startQuiz(chosenTopic: string, focusConcepts?: string[]) {
    setTopic(chosenTopic);
    setLoading(true);
    setError(null);
    try {
      const qs = await fetchQuestions({ domain, topic: chosenTopic, count, focusConcepts });
      setQuestions(qs);
      setAnswers([]);
      setStep("quiz");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="paper-grain min-h-screen">
      <header className="border-b-2 border-ink bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <Logo />
          <Stepper step={step} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        {isUsingMockApi && (
          <p className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-ink bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <Sparkles className="size-3.5" /> Demo mode · sample questions until your AI is connected
          </p>
        )}

        {error && (
          <div className="mb-6 rounded-lg border-2 border-ink bg-destructive px-4 py-3 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        {step === "domain" && (
          <DomainStep
            onSelect={(d) => {
              setDomain(d);
              setStep("topic");
            }}
          />
        )}

        {step === "topic" && (
          <TopicStep
            domain={domain}
            loading={loading}
            count={count}
            onCountChange={setCount}
            onBack={() => setStep("domain")}
            onSelect={(t) => startQuiz(t)}
          />
        )}

        {step === "quiz" && (
          <QuizStep
            key={questions[0]?.id}
            domain={domain}
            topic={topic}
            questions={questions}
            onFinish={(a) => {
              setAnswers(a);
              setStep("results");
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {step === "results" && (
          <ResultsStep
            domain={domain}
            topic={topic}
            answers={answers}
            loading={loading}
            onRetry={() => startQuiz(topic)}
            onPracticeWeak={(concepts) => startQuiz(topic, concepts)}
            onNewTopic={() => setStep("topic")}
            onNewDomain={() => setStep("domain")}
          />
        )}
      </main>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "domain", label: "Domain" },
    { key: "topic", label: "Topic" },
    { key: "quiz", label: "Quiz" },
  ];
  const activeIndex = step === "results" ? 3 : steps.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
      {steps.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2">
          <span
            className={`grid size-6 place-items-center rounded-full border-2 border-ink ${
              i < activeIndex
                ? "bg-ink text-paper"
                : i === activeIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
            }`}
          >
            {i < activeIndex ? <Check className="size-3" /> : i + 1}
          </span>
          <span className="hidden sm:inline">{s.label}</span>
          {i < steps.length - 1 && <span className="hidden w-6 border-t-2 border-ink sm:block" />}
        </li>
      ))}
    </ol>
  );
}

function StepHeading({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
  return (
    <div className="animate-rise">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>
      <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">{title}</h1>
    </div>
  );
}

function CustomInput({
  placeholder,
  cta,
  loading,
  onSubmit,
}: {
  placeholder: string;
  cta: string;
  loading?: boolean;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="mt-8 flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={80}
        className="h-14 flex-1 rounded-full border-2 border-ink bg-card px-6 text-base shadow-brutal-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
      <Button type="submit" variant="hero" size="xl" disabled={!value.trim() || loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {cta} {!loading && <ArrowRight />}
      </Button>
    </form>
  );
}

function DomainStep({ onSelect }: { onSelect: (d: string) => void }) {
  return (
    <section>
      <StepHeading
        eyebrow="Step 1 of 3"
        title={
          <>
            What <em className="text-primary">domain</em> are we exploring?
          </>
        }
      />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {DOMAINS.map((d, i) => (
          <button
            key={d.name}
            onClick={() => onSelect(d.name)}
            style={{ animationDelay: `${i * 30}ms` }}
            className="card-brutal press flex animate-rise flex-col items-start gap-4 p-5 text-left hover:bg-accent"
          >
            <d.icon className="size-7 text-primary" />
            <span className="font-semibold leading-tight">{d.name}</span>
          </button>
        ))}
      </div>
      <p className="mt-10 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Or type your own
      </p>
      <CustomInput placeholder="e.g. Astronomy, Law, Cooking…" cta="Continue" onSubmit={onSelect} />
    </section>
  );
}

function TopicStep({
  domain,
  loading,
  count,
  onCountChange,
  onBack,
  onSelect,
}: {
  domain: string;
  loading: boolean;
  count: number;
  onCountChange: (n: number) => void;
  onBack: () => void;
  onSelect: (t: string) => void;
}) {
  const suggestions = DOMAINS.find((d) => d.name === domain)?.topics ?? [];
  return (
    <section>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-primary"
      >
        <ArrowLeft className="size-4" /> {domain}
      </button>
      <StepHeading
        eyebrow="Step 2 of 3"
        title={
          <>
            Which <em className="text-primary">topic</em> in {domain}?
          </>
        }
      />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Questions
        </span>
        <div role="radiogroup" aria-label="Number of questions" className="flex gap-2">
          {QUESTION_COUNTS.map((n) => (
            <button
              key={n}
              role="radio"
              aria-checked={count === n}
              onClick={() => onCountChange(n)}
              className={`size-11 rounded-full border-2 border-ink font-mono text-sm shadow-brutal-sm transition-colors ${
                count === n ? "bg-ink text-paper" : "bg-card hover:bg-accent"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {suggestions.map((t) => (
            <button
              key={t}
              disabled={loading}
              onClick={() => onSelect(t)}
              className="press rounded-full border-2 border-ink bg-card px-5 py-2.5 font-medium shadow-brutal-sm hover:bg-accent disabled:opacity-50"
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <p className="mt-10 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {suggestions.length ? "Or type a specific topic" : "Type a topic"}
      </p>
      <CustomInput
        placeholder="e.g. Binary trees, Photosynthesis, French Revolution…"
        cta="Generate quiz"
        loading={loading}
        onSubmit={onSelect}
      />
      {loading && (
        <p className="mt-6 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Your tutor is writing {count} questions…
        </p>
      )}
    </section>
  );
}

function QuizStep({
  domain,
  topic,
  questions,
  onFinish,
}: {
  domain: string;
  topic: string;
  questions: QuizQuestion[];
  onFinish: (answers: Answer[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const progress = ((index + (result ? 1 : 0)) / questions.length) * 100;

  async function choose(current: QuizQuestion, i: number) {
    if (result || checking) return;
    setSelected(i);
    setChecking(true);
    setError(null);
    try {
      const r = await checkAnswer({ domain, topic, question: current, selectedIndex: i });
      setResult(r);
      setAnswers((prev) => [...prev, { question: current, selectedIndex: i, result: r }]);
    } catch (e) {
      setSelected(null);
      setError(e instanceof Error ? e.message : "Couldn't check your answer.");
    } finally {
      setChecking(false);
    }
  }

  function next() {
    if (isLast) {
      onFinish(answers);
      return;
    }
    setIndex((n) => n + 1);
    setSelected(null);
    setResult(null);
  }

  if (!q) return null;

  return (
    <section>
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest">
        <span className="text-muted-foreground">
          {domain} · {topic}
        </span>
        <span>
          Q{index + 1} / {questions.length}
        </span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-card">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div key={q.id} className="card-brutal shadow-brutal-lg mt-8 animate-rise p-6 md:p-10">
        {q.concept && (
          <span className="inline-block rounded-full border-2 border-ink bg-accent px-3 py-0.5 font-mono text-[11px] uppercase tracking-widest">
            {q.concept}
          </span>
        )}
        <h2 className="mt-3 font-display text-3xl leading-snug md:text-4xl">{q.question}</h2>

        <div className="mt-8 grid gap-3">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = result && result.correctIndex === i;
            const isWrong = result && isSelected && !result.correct;
            const state = isCorrect
              ? "bg-success text-success-foreground"
              : isWrong
                ? "bg-destructive text-destructive-foreground"
                : isSelected
                  ? "bg-accent"
                  : "bg-card hover:bg-accent";
            return (
              <button
                key={i}
                onClick={() => choose(q, i)}
                disabled={!!result || checking}
                className={`flex items-center gap-4 rounded-xl border-2 border-ink px-5 py-4 text-left shadow-brutal-sm transition-colors disabled:cursor-default ${state} ${
                  !result && !checking ? "press" : ""
                }`}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-current font-mono text-sm">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 font-medium">{opt}</span>
                {checking && isSelected && <Loader2 className="size-5 animate-spin" />}
                {isCorrect && <Check className="size-5" />}
                {isWrong && <X className="size-5" />}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {result && (
          <div
            className={`mt-8 animate-rise rounded-xl border-2 border-ink p-5 ${
              result.correct ? "bg-card" : "border-dashed bg-accent"
            }`}
          >
            <p className="flex items-center gap-2 font-semibold">
              {result.correct ? (
                <>
                  <Check className="size-5 text-success" /> Correct!
                </>
              ) : (
                <>
                  <Sparkles className="size-5 text-primary" /> Not quite — here's the right answer
                </>
              )}
            </p>
            {!result.correct && (
              <p className="mt-2 font-mono text-sm">
                Correct answer: {String.fromCharCode(65 + result.correctIndex)}.{" "}
                {q.options[result.correctIndex]}
              </p>
            )}
            <p className="mt-3 leading-relaxed text-foreground/80">{result.explanation}</p>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button variant="ink" size="xl" onClick={next} disabled={!result}>
            {isLast ? "See results" : "Next question"} <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}

function toResponses(answers: Answer[]): QuizResponse[] {
  return answers.map((a) => ({
    questionId: a.question.id,
    question: a.question.question,
    options: a.question.options,
    concept: a.question.concept ?? "General",
    selectedIndex: a.selectedIndex,
    correctIndex: a.result.correctIndex,
    correct: a.result.correct,
  }));
}

function ResultsStep({
  domain,
  topic,
  answers,
  loading,
  onRetry,
  onPracticeWeak,
  onNewTopic,
  onNewDomain,
}: {
  domain: string;
  topic: string;
  answers: Answer[];
  loading: boolean;
  onRetry: () => void;
  onPracticeWeak: (concepts: string[]) => void;
  onNewTopic: () => void;
  onNewDomain: () => void;
}) {
  const responses = toResponses(answers);
  const score = answers.filter((a) => a.result.correct).length;
  const total = answers.length;
  const missed = answers.filter((a) => !a.result.correct);
  const pct = total ? Math.round((score / total) * 100) : 0;
  const verdict =
    pct === 100 ? "Flawless!" : pct >= 70 ? "Great work!" : pct >= 40 ? "Getting there!" : "Keep going!";

  return (
    <section>
      <div className="card-brutal shadow-brutal-lg animate-rise bg-primary p-8 text-primary-foreground md:p-12">
        <Trophy className="size-10" />
        <p className="mt-4 font-mono text-xs uppercase tracking-widest opacity-80">
          {domain} · {topic}
        </p>
        <h1 className="mt-2 font-display text-6xl md:text-7xl">{verdict}</h1>
        <p className="mt-4 text-xl">
          You scored{" "}
          <strong className="font-display text-4xl">
            {score}/{total}
          </strong>{" "}
          ({pct}%)
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="ink" size="xl" onClick={onRetry} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <RotateCcw />} New quiz on {topic}
          </Button>
          <Button variant="paper" size="xl" onClick={onNewTopic}>
            Another topic
          </Button>
          <Button variant="paper" size="xl" onClick={onNewDomain}>
            Change domain
          </Button>
        </div>
      </div>

      <div className="mt-10 animate-rise">
        <ConceptBreakdown responses={responses} />
      </div>

      <div className="mt-10 animate-rise">
        <LearningPathwayPanel
          domain={domain}
          topic={topic}
          responses={responses}
          onPracticeWeak={onPracticeWeak}
          practising={loading}
        />
      </div>

      {missed.length > 0 && (
        <div className="mt-14">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Review</p>
          <h2 className="mt-2 font-display text-4xl">Questions you missed</h2>
          <div className="mt-6 grid gap-5">
            {missed.map((a) => (
              <div key={a.question.id} className="card-brutal p-6">
                {a.question.concept && (
                  <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
                    {a.question.concept}
                  </span>
                )}
                <p className="mt-1 font-semibold">{a.question.question}</p>
                <div className="mt-4 grid gap-2 font-mono text-sm sm:grid-cols-2">
                  <span className="flex items-center gap-2 rounded-lg border-2 border-ink bg-destructive px-3 py-2 text-destructive-foreground">
                    <X className="size-4 shrink-0" /> {a.question.options[a.selectedIndex]}
                  </span>
                  <span className="flex items-center gap-2 rounded-lg border-2 border-ink bg-success px-3 py-2 text-success-foreground">
                    <Check className="size-4 shrink-0" /> {a.question.options[a.result.correctIndex]}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {a.result.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </div>
    </section>
  );
}
