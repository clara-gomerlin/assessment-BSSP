"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Question, Quiz, Answers } from "@/lib/types";
import QuestionCard from "./QuestionCard";
import LeadCapture from "./LeadCapture";
import ResultView from "./ResultView";
import DiagnosticResultView from "./DiagnosticResultView";
import IPRTResultView from "./IPRTResultView";
import HeroScreen from "./HeroScreen";
import LoadingScreen from "./LoadingScreen";
import TransitionScreen from "./TransitionScreen";

interface QuizPlayerProps {
  quiz: Quiz;
  questions: Question[];
}

type Phase = "hero" | "questions" | "transition" | "lead_capture" | "loading" | "submitting" | "result";

// === Default sections for archetype quiz (backward compat) ===
const DEFAULT_SECTIONS = [
  { label: "Perfil", categories: ["perfil"] },
  { label: "Desafios", categories: ["desafios"] },
  { label: "Objetivos", categories: ["objetivos"] },
];

const DEFAULT_TRANSITIONS_BEFORE: Record<number, string[]> = {
  0: ["after-perfil-1"],
};
const DEFAULT_TRANSITIONS_AFTER: Record<number, string[]> = {
  0: ["after-perfil-2"],
  1: ["after-desafios"],
};

// === Helpers ===

function buildSectionIndex(
  sections: { label: string; categories: string[] }[]
) {
  return (category: string): number => {
    const cat = category.toLowerCase();
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].categories.some((c) => cat.includes(c))) return i;
    }
    return 0;
  };
}

function computeFills(
  questions: Question[],
  currentIndex: number,
  sections: { label: string; categories: string[] }[],
  getSectionIdx: (cat: string) => number
): { sectionIndex: number; fills: number[] } {
  const currentCategory = questions[currentIndex]?.category || "";
  const sectionIndex = getSectionIdx(currentCategory);

  const fills = sections.map((_section, si) => {
    const sectionQuestions = questions.filter(
      (q) => getSectionIdx(q.category) === si
    );
    if (sectionQuestions.length === 0) return si < sectionIndex ? 1 : 0;
    if (si < sectionIndex) return 1;
    if (si > sectionIndex) return 0;

    const firstIdxInSection = questions.findIndex(
      (q) => getSectionIdx(q.category) === si
    );
    const positionInSection = currentIndex - firstIdxInSection;
    return Math.min(positionInSection / sectionQuestions.length, 1);
  });

  return { sectionIndex, fills };
}

export default function QuizPlayer({ quiz, questions }: QuizPlayerProps) {
  const quizType = quiz.settings?.quiz_type || "archetype";
  const isDiagnostic = quizType === "diagnostic";
  const isIPRT = quizType === "iprt";

  // Derive sections and transitions from quiz settings (or use defaults)
  const sections = useMemo(
    () => quiz.settings?.sections || DEFAULT_SECTIONS,
    [quiz.settings?.sections]
  );
  const transitionsBefore = useMemo(
    () => {
      const raw = quiz.settings?.transitions_before_section || DEFAULT_TRANSITIONS_BEFORE;
      // Parse string keys to numbers
      const result: Record<number, string[]> = {};
      for (const [k, v] of Object.entries(raw)) {
        result[Number(k)] = v;
      }
      return result;
    },
    [quiz.settings?.transitions_before_section]
  );
  const transitionsAfter = useMemo(
    () => {
      const raw = quiz.settings?.transitions_after_section || DEFAULT_TRANSITIONS_AFTER;
      const result: Record<number, string[]> = {};
      for (const [k, v] of Object.entries(raw)) {
        result[Number(k)] = v;
      }
      return result;
    },
    [quiz.settings?.transitions_after_section]
  );

  const getSectionIdx = useMemo(() => buildSectionIndex(sections), [sections]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<Phase>("hero");
  const [resultMarkdown, setResultMarkdown] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");

  // Transition state
  const [transitionQueue, setTransitionQueue] = useState<string[]>([]);
  const [pendingNextIndex, setPendingNextIndex] = useState<number | null>(null);

  const [apiReady, setApiReady] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const generationStarted = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultData, setResultData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [hubspotContactId, setHubspotContactId] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];

  // Progress bar
  const progressIndex =
    phase === "transition" && pendingNextIndex !== null
      ? pendingNextIndex
      : currentIndex;
  const { sectionIndex, fills } = computeFills(
    questions,
    progressIndex,
    sections,
    getSectionIdx
  );
  const currentSectionLabel = sections[sectionIndex]?.label || "";

  // Diagnostic/IPRT progress: per-section question counts
  const diagnosticProgress = useMemo(() => {
    if (!isDiagnostic && !isIPRT) return null;
    const sectionQuestions = questions.filter(
      (q) => getSectionIdx(q.category) === sectionIndex
    );
    const firstInSection = questions.findIndex(
      (q) => getSectionIdx(q.category) === sectionIndex
    );
    const posInSection = progressIndex - firstInSection + 1;
    return {
      current: posInSection,
      totalInSection: sectionQuestions.length,
      globalCurrent: progressIndex + 1,
      globalTotal: questions.length,
    };
  }, [isDiagnostic, isIPRT, questions, progressIndex, sectionIndex, getSectionIdx]);

  // --- Loading screen copy based on quiz type ---
  const loadingLabels = isDiagnostic
    ? ["Analisando sua máquina de receita", "Calculando score por alavanca", "Gerando diagnóstico personalizado"]
    : isIPRT
    ? ["Calculando seu Índice de Prontidão", "Analisando suas 4 dimensões", "Gerando diagnóstico personalizado"]
    : undefined;

  function advanceToNext(nextIndex: number) {
    if (nextIndex >= questions.length) {
      const lastSectionIdx = getSectionIdx(questions[currentIndex].category);
      const transitions = transitionsAfter[lastSectionIdx];
      if (transitions?.length) {
        setTransitionQueue([...transitions]);
        setPendingNextIndex(null);
        setPhase("transition");
      } else {
        setPhase("loading");
      }
      return;
    }

    const currentSec = getSectionIdx(questions[currentIndex].category);
    const nextSec = getSectionIdx(questions[nextIndex].category);

    if (currentSec !== nextSec) {
      const transitions = transitionsAfter[currentSec];
      if (transitions?.length) {
        setTransitionQueue([...transitions]);
        setPendingNextIndex(nextIndex);
        setPhase("transition");
        return;
      }
    }

    setCurrentIndex(nextIndex);
  }

  function handleAnswer(questionId: string, optionId: string) {
    const question = questions[currentIndex];

    if (question.type === "multiple_choice") {
      // Toggle multi-select
      const current = (answers[questionId] as string[]) || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      setAnswers({ ...answers, [questionId]: updated });
      return; // Don't auto-advance for multi-select
    }

    // Single choice — save and advance
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);

    setTimeout(() => {
      advanceToNext(currentIndex + 1);
    }, 400);
  }

  function handleMultiConfirm(optionIds: string[]) {
    const newAnswers = { ...answers, [currentQuestion.id]: optionIds };
    setAnswers(newAnswers);
    setTimeout(() => {
      advanceToNext(currentIndex + 1);
    }, 200);
  }

  function handleTransitionContinue() {
    const remaining = transitionQueue.slice(1);

    if (remaining.length > 0) {
      setTransitionQueue(remaining);
      return;
    }

    if (pendingNextIndex !== null) {
      setCurrentIndex(pendingNextIndex);
      setPendingNextIndex(null);
      setPhase("questions");
    } else {
      setPhase("loading");
    }
    setTransitionQueue([]);
  }

  function handleBack() {
    if (phase === "transition") {
      // During transition, go back to the current question
      setTransitionQueue([]);
      setPendingNextIndex(null);
      setPhase("questions");
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // First question — go back to hero
      setPhase("hero");
    }
  }

  // Start result generation (called when entering loading phase, without lead data)
  const startResultGeneration = useCallback(
    async () => {
      try {
        const response = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quiz_id: quiz.id,
            answers,
          }),
        });

        if (!response.ok) throw new Error("Erro ao enviar respostas");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Stream não disponível");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "meta") {
                if (parsed.response_id) setResponseId(parsed.response_id);
                setResultData(parsed);
              } else if (parsed.type === "analysis") {
                setAnalysisData(parsed);
              } else if (parsed.type === "text") {
                fullText += parsed.content;
                setResultMarkdown(fullText);
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }

        setApiReady(true);
      } catch (error) {
        console.error(error);
      }
    },
    [quiz.id, answers]
  );

  // Handle lead capture submission (update lead data + show result)
  const handleLeadSubmit = useCallback(
    async (name: string, email: string, phone: string) => {
      setRespondentName(name);
      setRespondentEmail(email);

      // Update lead data in the existing response record + sync to HubSpot
      if (responseId) {
        try {
          const res = await fetch("/api/quiz/update-lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              response_id: responseId,
              quiz_id: quiz.id,
              respondent_name: name,
              respondent_email: email,
              respondent_phone: phone,
            }),
          });
          const data = await res.json();
          if (data.hubspot_contact_id) {
            setHubspotContactId(data.hubspot_contact_id);
          }
        } catch (error) {
          console.error("Failed to update lead data:", error);
        }
      }

      setPhase("result");
    },
    [quiz.id, responseId]
  );

  // Start result generation when entering loading phase
  useEffect(() => {
    if (phase === "loading" && !generationStarted.current) {
      generationStarted.current = true;
      startResultGeneration();
    }
  }, [phase, startResultGeneration]);

  // ========== RENDER PHASES ==========

  if (phase === "hero") {
    return (
      <div className={isIPRT ? "bssp-theme" : ""}>
        <HeroScreen
          quiz={quiz}
          onStart={() => {
            const beforeFirst = transitionsBefore[0];
            if (beforeFirst?.length) {
              setTransitionQueue([...beforeFirst]);
              setPendingNextIndex(0);
              setPhase("transition");
            } else {
              setPhase("questions");
            }
          }}
        />
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className={isIPRT ? "bssp-theme" : ""}>
        <LoadingScreen
          apiReady={true}
          onContinue={() => setPhase("lead_capture")}
          labels={loadingLabels}
          quizType={quizType}
        />
      </div>
    );
  }

  if (phase === "lead_capture") {
    return (
      <div className={isIPRT ? "bssp-theme" : ""}>
        <LeadCapture onSubmit={handleLeadSubmit} quizType={quizType} />
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className={isIPRT ? "bssp-theme" : ""}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: isIPRT ? "#031D31" : "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 16, fontWeight: 500, color: "#334155" }}>Gerando seu resultado...</p>
        </div>
      </div>
    );
  }

  // If result phase but API not ready yet, show spinner
  if (phase === "result" && !resultData) {
    return (
      <div className={isIPRT ? "bssp-theme" : ""}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: isIPRT ? "#031D31" : "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 16, fontWeight: 500, color: "#334155" }}>Finalizando seu resultado...</p>
        </div>
      </div>
    );
  }

  if (phase === "result" && resultData) {
    if (isIPRT) {
      return (
        <div className="bssp-theme">
          <IPRTResultView
            result={resultData}
            analysis={analysisData}
            markdown={resultMarkdown}
            respondentName={respondentName}
            respondentEmail={respondentEmail}
            quizSlug={quiz.slug}
            quizId={quiz.id}
            responseId={responseId}
            ctaWhatsappUrl={quiz.settings.cta_whatsapp_url}
            hubspotContactId={hubspotContactId}
            quizTitle={quiz.title}
          />
        </div>
      );
    }
    if (isDiagnostic) {
      return (
        <DiagnosticResultView
          result={resultData}
          analysis={analysisData}
          markdown={resultMarkdown}
          respondentName={respondentName}
          respondentEmail={respondentEmail}
          quizSlug={quiz.slug}
          quizId={quiz.id}
          responseId={responseId}
          ctaWhatsappUrl={quiz.settings.cta_whatsapp_url}
          hubspotContactId={hubspotContactId}
          quizTitle={quiz.title}
        />
      );
    }
    return (
      <ResultView
        archetype={resultData.archetype}
        secondary={resultData.secondary}
        scores={resultData.scores}
        dimensions={quiz.dimensions}
        markdown={resultMarkdown}
        respondentName={respondentName}
        respondentEmail={respondentEmail}
        quizId={quiz.id}
        responseId={responseId}
        ctaWhatsappUrl={quiz.settings.cta_whatsapp_url}
        hubspotContactId={hubspotContactId}
        quizTitle={quiz.title}
      />
    );
  }

  // ========== QUIZ LAYOUT ==========

  return (
    <div
      className={isIPRT ? "bssp-theme" : ""}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* BSSP logo bar */}
      {isIPRT && (
        <div
          style={{
            padding: "10px 20px",
            display: "flex",
            justifyContent: "center",
            borderBottom: "1px solid rgb(227, 228, 230)",
          }}
        >
          <img
            src="/logos/bssp-pos-graduacao.png"
            alt="BSSP Pós-Graduação"
            style={{ height: 36 }}
          />
        </div>
      )}

      {/* Header with progress bar */}
      <header
        style={{
          position: "relative",
          padding: "12px 20px",
          borderBottom: "1px solid rgb(227, 228, 230)",
        }}
      >
        {isDiagnostic && diagnosticProgress ? (
          <>
            {/* Diagnostic header: back + centered section label */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                height: 32,
              }}
            >
              <button
                onClick={handleBack}
                style={{
                  width: 32,
                  height: 32,
                  padding: 4,
                  borderRadius: 8,
                  backgroundColor: "rgb(230, 232, 236)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    fill="#222"
                    fillRule="evenodd"
                    d="M15.279 6.579a1 1 0 0 0 0-1.424l-.469-.462a1 1 0 0 0-1.404 0L6.72 11.288a1 1 0 0 0 0 1.424l6.685 6.595a1 1 0 0 0 1.404 0l.468-.462a1 1 0 0 0 0-1.423L9.785 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#000", fontFamily: isIPRT ? "'Montserrat', system-ui, sans-serif" : "var(--font-quiz)" }}>
                {diagnosticProgress ? `${diagnosticProgress.globalCurrent}/${diagnosticProgress.globalTotal} - ` : ""}{currentSectionLabel}
              </span>
              <div style={{ width: 32, visibility: "hidden" }} />
            </div>

            {/* Dot progress bar */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {sections.map((_section, si) => (
                <div key={si} style={{ display: "contents" }}>
                  <span
                    className={`progress-dot ${
                      si <= sectionIndex ? "active" : "pending"
                    }`}
                  />
                  {si < sections.length - 1 && (
                    <div className="progress-segment">
                      <div
                        className="progress-fill"
                        style={{
                          transform: `translateX(${-(1 - fills[si]) * 100}%)`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Archetype header: back + section label + dot progress */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                height: 32,
              }}
            >
              <button
                onClick={handleBack}
                style={{
                  width: 32,
                  height: 32,
                  padding: 4,
                  borderRadius: 8,
                  backgroundColor: "rgb(230, 232, 236)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    fill="#222"
                    fillRule="evenodd"
                    d="M15.279 6.579a1 1 0 0 0 0-1.424l-.469-.462a1 1 0 0 0-1.404 0L6.72 11.288a1 1 0 0 0 0 1.424l6.685 6.595a1 1 0 0 0 1.404 0l.468-.462a1 1 0 0 0 0-1.423L9.785 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#000" }}>
                {currentSectionLabel}
              </span>
              <div style={{ width: 45, visibility: "hidden" }}>
                {currentIndex + 1} / {questions.length}
              </div>
            </div>

            {/* Dot progress bar */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {sections.map((_section, si) => (
                <div key={si} style={{ display: "contents" }}>
                  <span
                    className={`progress-dot ${
                      si <= sectionIndex ? "active" : "pending"
                    }`}
                  />
                  <div className="progress-segment">
                    <div
                      className="progress-fill"
                      style={{
                        transform: `translateX(${-(1 - fills[si]) * 100}%)`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <span
                className={`progress-dot ${
                  sectionIndex >= sections.length - 1 &&
                  fills[sections.length - 1] >= 1
                    ? "active"
                    : "pending"
                }`}
              />
            </div>
          </>
        )}
      </header>

      {/* Content: either question or transition */}
      {phase === "transition" && transitionQueue.length > 0 ? (
        <TransitionScreen
          key={transitionQueue[0]}
          id={transitionQueue[0]}
          onContinue={handleTransitionContinue}
        />
      ) : (
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "0px 20px",
            flexGrow: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 24,
            paddingBottom: currentQuestion?.type === "multiple_choice" ? 140 : 120,
          }}
        >
          <div style={{ marginTop: 24, width: "100%", maxWidth: 480 }}>
            <QuestionCard
              question={currentQuestion}
              selectedOption={answers[currentQuestion.id]}
              onSelect={(optionId) =>
                handleAnswer(currentQuestion.id, optionId)
              }
              onMultiConfirm={handleMultiConfirm}
              subtitle={
                isDiagnostic && currentSectionLabel.toLowerCase().includes("confian")
                  ? "Selecione a resposta mais adequada a sua realidade"
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
