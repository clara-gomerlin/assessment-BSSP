import { Question, QuestionOption, Scores, Dimension, QuizSettings } from "./types";

/**
 * Calculate scores by summing up the score values from each selected option.
 */
export function calculateScores(
  questions: Question[],
  answers: Record<string, string> // question_id -> selected option id
): Scores {
  const scores: Scores = { NE: 0, GE: 0, VD: 0, AM: 0, GT: 0 };

  for (const question of questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const option = question.options.find(
      (o: QuestionOption) => o.id === selectedOptionId
    );
    if (!option) continue;

    for (const [code, points] of Object.entries(option.scores)) {
      scores[code] = (scores[code] || 0) + points;
    }
  }

  return scores;
}

/**
 * Determine the winner archetype considering eligibility rules and tie-breaking.
 */
export function getWinnerArchetype(
  scores: Scores,
  answers: Record<string, string>,
  dimensions: Dimension[],
  settings: QuizSettings
): { primary: Dimension; secondary: Dimension; scores: Scores } {
  const answeredValues = Object.values(answers);

  // Check eligibility for each archetype
  const eligibility: Record<string, boolean> = {};
  for (const dim of dimensions) {
    const rule = settings.eligibility_rules?.[dim.code];
    if (!rule) {
      eligibility[dim.code] = true;
      continue;
    }

    const required = Array.isArray(rule.requires_answer)
      ? rule.requires_answer
      : [rule.requires_answer];
    eligibility[dim.code] = required.some((r) => answeredValues.includes(r));
  }

  // Filter eligible scores
  const eligibleEntries = Object.entries(scores).filter(
    ([code]) => eligibility[code]
  );

  // Fallback to GE if no eligible archetypes
  if (eligibleEntries.length === 0) {
    const ge = dimensions.find((d) => d.code === "GE")!;
    const fallback = dimensions.find((d) => d.code !== "GE")!;
    return { primary: ge, secondary: fallback, scores };
  }

  // Find max score among eligible
  const maxScore = Math.max(...eligibleEntries.map(([, v]) => v));
  const tied = eligibleEntries
    .filter(([, v]) => v === maxScore)
    .map(([code]) => code);

  // Tie-break using priority order
  const priority = settings.tie_break_priority || [
    "GT",
    "AM",
    "VD",
    "GE",
    "NE",
  ];
  const winnerCode = priority.find((code) => tied.includes(code)) || tied[0];

  // Find secondary (second highest score, eligible or not)
  const sortedAll = Object.entries(scores)
    .filter(([code]) => code !== winnerCode)
    .sort(([, a], [, b]) => b - a);
  const secondaryCode = sortedAll[0]?.[0] || winnerCode;

  const primary = dimensions.find((d) => d.code === winnerCode)!;
  const secondary = dimensions.find((d) => d.code === secondaryCode)!;

  return { primary, secondary, scores };
}
