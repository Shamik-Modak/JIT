/**
 * Tutor API client.
 *
 * Connect your own AI backend by setting VITE_TUTOR_API_URL. When it is not
 * set, a local mock is used so the whole flow works in the preview.
 *
 * Expected endpoints on your API:
 *   POST {BASE}/questions  body: { domain, topic, count, focusConcepts? }
 *        -> { questions: QuizQuestion[] }
 *   POST {BASE}/check      body: { domain, topic, question, selectedIndex }
 *        -> AnswerResult
 *   POST {BASE}/pathway    body: { domain, topic, responses: QuizResponse[] }
 *        -> LearningPathway
 */

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  /** Concept/sub-skill this question tests — used to find weak areas. */
  concept?: string;
};

export type AnswerResult = {
  correct: boolean;
  correctIndex: number;
  explanation: string;
};

/** One tracked learner response, sent to the AI to build the pathway. */
export type QuizResponse = {
  questionId: string;
  question: string;
  options: string[];
  concept: string;
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
};

export type PathwayResource = { title: string; url: string };

export type LearningPathway = {
  summary: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  strengths: string[];
  weakAreas: { concept: string; missed: number; total: number; why: string }[];
  steps: {
    title: string;
    description: string;
    concept?: string;
    duration?: string;
    resources?: PathwayResource[];
  }[];
};

export const QUESTION_COUNTS = [5, 10, 15] as const;

const API_BASE = (import.meta.env["VITE_TUTOR_API_URL"] as string | undefined)?.replace(
  /\/$/,
  "",
);

export const isUsingMockApi = !API_BASE;

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Tutor API error (${res.status})`);
  return (await res.json()) as T;
}

export async function fetchQuestions(params: {
  domain: string;
  topic: string;
  count?: number;
  focusConcepts?: string[] | undefined;
}): Promise<QuizQuestion[]> {
  const count = params.count ?? 5;
  if (!API_BASE) return mockQuestions(params.domain, params.topic, count, params.focusConcepts);
  const data = await post<{ questions: QuizQuestion[] }>("/questions", { ...params, count });
  return data.questions;
}

export async function checkAnswer(params: {
  domain: string;
  topic: string;
  question: QuizQuestion;
  selectedIndex: number;
}): Promise<AnswerResult> {
  if (!API_BASE) return mockCheck(params.question, params.selectedIndex, params.topic);
  return post<AnswerResult>("/check", params);
}

export async function fetchLearningPathway(params: {
  domain: string;
  topic: string;
  responses: QuizResponse[];
}): Promise<LearningPathway> {
  if (!API_BASE) return mockPathway(params.domain, params.topic, params.responses);
  return post<LearningPathway>("/pathway", params);
}

/** Per-concept tally of a learner's responses. */
export function conceptBreakdown(responses: QuizResponse[]) {
  const map = new Map<string, { concept: string; correct: number; total: number }>();
  for (const r of responses) {
    const row = map.get(r.concept) ?? { concept: r.concept, correct: 0, total: 0 };
    row.total += 1;
    if (r.correct) row.correct += 1;
    map.set(r.concept, row);
  }
  return [...map.values()].sort((a, b) => a.correct / a.total - b.correct / b.total);
}

/* ------------------------------------------------------------------ */
/* Mock — replaced automatically once VITE_TUTOR_API_URL is configured */
/* ------------------------------------------------------------------ */

const mockAnswerKey = new Map<string, number>();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Template = { concept: string; q: string; right: string; wrong: string[] };

function mockBank(domain: string, topic: string): Template[] {
  return [
    {
      concept: "Core definitions",
      q: `Which statement best describes the core idea of ${topic}?`,
      right: `A foundational idea in ${domain} explaining how its parts relate to a whole`,
      wrong: [
        `A historical term no longer used in ${domain}`,
        "A naming convention with no practical use",
        "An unrelated idea borrowed from another field",
      ],
    },
    {
      concept: "Core definitions",
      q: `Which term is most essential to understand before going deeper into ${topic}?`,
      right: "Its basic building-block definitions",
      wrong: ["Its most advanced edge cases", "Its history of naming", "Its popularity online"],
    },
    {
      concept: "Learning approach",
      q: `When starting ${topic}, what is usually the best first step?`,
      right: "Understand key definitions and work through a simple example",
      wrong: ["Memorise every edge case", "Jump to advanced problems", "Avoid practice until confident"],
    },
    {
      concept: "Common misconceptions",
      q: `Which of these is a common misconception about ${topic}?`,
      right: "It only matters to experts and never shows up in practice",
      wrong: ["It builds on earlier ideas", "It can be practised with examples", "It connects to other topics"],
    },
    {
      concept: "Common misconceptions",
      q: `A learner says "${topic} is just memorisation." What's wrong with this?`,
      right: "It ignores the reasoning and principles behind the facts",
      wrong: ["Nothing, it's accurate", "Memorisation is never useful", "It overstates how hard the topic is"],
    },
    {
      concept: "Application",
      q: `How would you best apply ${topic} to a new, unfamiliar problem?`,
      right: "Identify which core principle fits, then test it step by step",
      wrong: ["Reuse the last answer you saw", "Guess and move on", "Wait for a worked solution"],
    },
    {
      concept: "Application",
      q: `Which situation is the clearest real-world use of ${topic}?`,
      right: `A practical ${domain} task where its principle directly shapes the outcome`,
      wrong: ["A task unrelated to the field", "A purely decorative choice", "A random coincidence"],
    },
    {
      concept: "Problem solving",
      q: `You're stuck on a ${topic} problem. What should you do first?`,
      right: "Break it into smaller parts and check each against the basics",
      wrong: ["Give up and look at the answer", "Start over with a harder problem", "Change topics"],
    },
    {
      concept: "Problem solving",
      q: `Your answer to a ${topic} question seems off. What's the best check?`,
      right: "Test it with a simple case where you know the result",
      wrong: ["Assume it's right", "Round it to look neater", "Ask for a new question"],
    },
    {
      concept: "Connections",
      q: `How does ${topic} relate to the rest of ${domain}?`,
      right: "It builds on earlier ideas and supports more advanced ones",
      wrong: ["It stands completely alone", "It replaces everything before it", "It only matters for exams"],
    },
    {
      concept: "Connections",
      q: `Which skill transfers best from ${topic} to other areas?`,
      right: "Reasoning from first principles",
      wrong: ["Random memorisation", "Typing speed", "Neat handwriting"],
    },
    {
      concept: "Self-assessment",
      q: `How would an expert in ${domain} check their understanding of ${topic}?`,
      right: "Explain it simply and solve a fresh problem",
      wrong: ["Re-read notes once", "Guess answers quickly", "Avoid feedback"],
    },
  ];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export async function mockQuestions(
  domain: string,
  topic: string,
  count: number,
  focusConcepts?: string[],
): Promise<QuizQuestion[]> {
  await sleep(700);
  let bank = mockBank(domain, topic);
  if (focusConcepts?.length) {
    const focused = bank.filter((t) => focusConcepts.includes(t.concept));
    if (focused.length) bank = focused;
  }
  const pool = shuffle(bank);

  return Array.from({ length: count }, (_, i) => {
    const t = pool[i % pool.length]!;
    const round = Math.floor(i / pool.length);
    const options = shuffle([t.right, ...t.wrong]);
    const id = `${topic}-${i}-${Math.random().toString(36).slice(2, 7)}`;
    mockAnswerKey.set(id, options.indexOf(t.right));
    return {
      id,
      concept: t.concept,
      question: round > 0 ? `(Revisit) ${t.q}` : t.q,
      options,
    };
  });
}

export async function mockCheck(
  question: QuizQuestion,
  selectedIndex: number,
  topic: string,
): Promise<AnswerResult> {
  await sleep(500);
  const correctIndex = mockAnswerKey.get(question.id) ?? 0;
  const correct = selectedIndex === correctIndex;
  return {
    correct,
    correctIndex,
    explanation: correct
      ? `Spot on. "${question.options[correctIndex]}" captures the idea behind ${topic}.`
      : `The right answer is "${question.options[correctIndex]}". You chose "${question.options[selectedIndex]}", which misses the key point: ${topic} is best understood by starting from its core principle and testing it on a simple example. (This explanation will come from your AI API once it is connected.)`,
  };
}

function searchResources(domain: string, topic: string, concept: string): PathwayResource[] {
  const q = encodeURIComponent(`${topic} ${concept}`);
  const qd = encodeURIComponent(`${domain} ${topic} ${concept}`);
  return [
    { title: "Khan Academy", url: `https://www.khanacademy.org/search?page_search_query=${q}` },
    { title: "YouTube lessons", url: `https://www.youtube.com/results?search_query=${qd}+explained` },
    { title: "Wikipedia", url: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(topic)}` },
  ];
}

export async function mockPathway(
  domain: string,
  topic: string,
  responses: QuizResponse[],
): Promise<LearningPathway> {
  await sleep(900);
  const breakdown = conceptBreakdown(responses);
  const total = responses.length;
  const score = responses.filter((r) => r.correct).length;
  const pct = total ? score / total : 0;
  const level = pct >= 0.8 ? "Advanced" : pct >= 0.5 ? "Intermediate" : "Beginner";

  const weak = breakdown.filter((b) => b.correct < b.total);
  const strengths = breakdown.filter((b) => b.correct === b.total).map((b) => b.concept);

  const weakAreas = weak.map((b) => ({
    concept: b.concept,
    missed: b.total - b.correct,
    total: b.total,
    why:
      b.correct === 0
        ? `You missed every ${b.concept.toLowerCase()} question — this is the biggest gap to close first.`
        : `You got ${b.correct} of ${b.total} right — the idea is there but not yet solid.`,
  }));

  const steps: LearningPathway["steps"] = weak.map((b, i) => ({
    title: `${i === 0 ? "Start with" : "Then strengthen"}: ${b.concept}`,
    concept: b.concept,
    duration: b.correct === 0 ? "45 min" : "25 min",
    description: `Review ${b.concept.toLowerCase()} in ${topic}. Read a short explanation, then work through 2–3 simple examples before trying harder ones.`,
    resources: searchResources(domain, topic, b.concept),
  }));

  steps.push({
    title: weak.length ? "Practise your weak areas" : "Go deeper",
    duration: "15 min",
    description: weak.length
      ? `Take a focused quiz on ${weak.map((w) => w.concept.toLowerCase()).join(", ")} to lock in what you've reviewed.`
      : `You've got the basics of ${topic}. Try a longer quiz or move on to a more advanced topic in ${domain}.`,
  });

  return {
    level,
    strengths,
    weakAreas,
    steps,
    summary: weak.length
      ? `You scored ${score}/${total} on ${topic}. Your strongest areas are ${strengths.length ? strengths.join(", ").toLowerCase() : "still forming"}, but you're falling behind on ${weak.map((w) => w.concept.toLowerCase()).join(", ")}. Follow the steps below in order. (This plan will come from your AI once it's connected.)`
      : `Perfect score on ${topic}! You've shown a solid grasp of every concept tested. (This plan will come from your AI once it's connected.)`,
  };
}
