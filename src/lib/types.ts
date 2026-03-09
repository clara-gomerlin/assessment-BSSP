export interface Dimension {
  code: string;
  name: string;
  emoji: string;
  description: string;
}

export interface OptionScore {
  NE: number;
  GE: number;
  VD: number;
  AM: number;
  GT: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  emoji?: string;
  value?: number;
  scores: OptionScore;
}

export interface Question {
  id: string;
  quiz_id: string;
  order_index: number;
  text: string;
  type: "single_choice" | "scale" | "multiple_choice";
  category: string;
  options: QuestionOption[];
}

export interface QuizSettings {
  platform: string;
  duration: string;
  target_audience: string;
  eligibility_rules: Record<string, { requires_answer: string | string[] }>;
  tie_break_priority: string[];
}

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  dimensions: Dimension[];
  settings: QuizSettings;
  prompt_template: string;
  is_published: boolean;
}

export interface SubmitPayload {
  quiz_id: string;
  respondent_name: string;
  respondent_email: string;
  respondent_phone?: string;
  answers: Record<string, string>; // question_id -> selected option id
}

export type Scores = Record<string, number>;

export interface QuizResult {
  archetype: Dimension;
  scores: Scores;
  analysis: string;
}
