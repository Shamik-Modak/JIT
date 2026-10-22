import { describe, expect, it } from "vitest";

import {
  conceptBreakdown,
  mockCheck,
  mockPathway,
  mockQuestions,
  type QuizResponse,
} from "@/lib/tutor-api";

describe("tutor quiz answers", () => {
  it("a wrong answer returns the correct answer and an explanation", async () => {
    const q = (await mockQuestions("Physics", "Optics", 1))[0]!;
    const right = await mockCheck(q, 0, "Optics");
    const wrongIndex = right.correctIndex === 0 ? 1 : 0;
    const wrong = await mockCheck(q, wrongIndex, "Optics");

    expect(wrong.correct).toBe(false);
    expect(wrong.correctIndex).toBe(right.correctIndex);
    expect(wrong.explanation).toContain(q.options[right.correctIndex]);
  });

  it("returns as many questions as the learner asked for", async () => {
    expect(await mockQuestions("Biology", "Genetics", 15)).toHaveLength(15);
  });
});

const resp = (concept: string, correct: boolean, id: string): QuizResponse => ({
  questionId: id,
  question: "q",
  options: ["a", "b"],
  concept,
  selectedIndex: correct ? 0 : 1,
  correctIndex: 0,
  correct,
});

describe("personalised pathway", () => {
  const responses = [
    resp("Application", false, "1"),
    resp("Application", false, "2"),
    resp("Core definitions", true, "3"),
  ];

  it("tracks failures per concept", () => {
    const app = conceptBreakdown(responses).find((r) => r.concept === "Application");
    expect(app).toEqual({ concept: "Application", correct: 0, total: 2 });
  });

  it("lists missed concepts as weak areas and fully correct ones as strengths", async () => {
    const p = await mockPathway("Physics", "Optics", responses);
    expect(p.weakAreas.map((w) => w.concept)).toEqual(["Application"]);
    expect(p.strengths).toEqual(["Core definitions"]);
    expect(p.steps[0]?.concept).toBe("Application");
  });
});
