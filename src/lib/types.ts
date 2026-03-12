export interface Dimension {
  code: string;
  name: string;
  emoji: string;
  description: string;
}

// Generic score map — works for both archetype (NE/GE/VD/AM/GT) and diagnostic (PP/GD/EV/EB)
export type OptionScore = Record<string, number>;

export interface QuestionOption {
  id: string;
  label: string;
  emoji?: string;
  value?: number;
  scores: OptionScore;
  tag?: string; // for Q3 emotional tags
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
  quiz_type?: "archetype" | "diagnostic" | "iprt";
  company_code?: string;
  sections?: { label: string; categories: string[] }[];
  transitions_before_section?: Record<number, string[]>;
  transitions_after_section?: Record<number, string[]>;
  cta_whatsapp_url?: string;
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

// Answers can be string (single choice) or string[] (multi-select)
export type Answers = Record<string, string | string[]>;

export interface SubmitPayload {
  quiz_id: string;
  respondent_name: string;
  respondent_email: string;
  respondent_phone?: string;
  answers: Answers;
}

export type Scores = Record<string, number>;

// --- Archetype quiz result ---
export interface QuizResult {
  archetype: Dimension;
  scores: Scores;
  analysis: string;
}

// --- Diagnostic assessment result ---
export interface DimensionResult {
  code: string;
  name: string;
  emoji: string;
  rawScore: number;
  normalizedScore: number;
  label: string;
  color: string;
}

export interface DiagnosticResult {
  scoreGeral: number;
  scoreGeralLabel: string;
  scoreGeralColor: string;
  dimensions: DimensionResult[];
  strongest: DimensionResult;
  weakest: DimensionResult;
  qualification: {
    faturamento: string;
    papel: string;
    emocionalTags: string[];
    crm: string;
  };
}

// --- IPRT assessment result ---
export interface IPRTDimensionResult {
  code: string;
  name: string;
  emoji: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  weight: number;
}

export interface IPRTResult {
  iprtScore: number;
  stage: string;
  stageColor: string;
  dimensions: IPRTDimensionResult[];
  weakestDimension: IPRTDimensionResult;
  qualification: {
    perfil: string;       // Q1
    perfilCode: string;
    numClientes: string;  // Q2
    formacao: string;     // Q3
    formacaoCode: string;
  };
  leadScore: number;
  leadCategory: string;
  // Computed from answers for neutralizers
  errosNormativos: number;
  totalNormativos: number;
  aguardandoPreparacao: boolean;
  // Q12 checklist count
  acoesRealizadas: number;
}
