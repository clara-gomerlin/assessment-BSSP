"use client";

import { useState, useCallback } from "react";
import { Question, Quiz } from "@/lib/types";
import QuestionCard from "./QuestionCard";
import LeadCapture from "./LeadCapture";
import ResultView from "./ResultView";
import HeroScreen from "./HeroScreen";
import LoadingScreen from "./LoadingScreen";
import TransitionScreen from "./TransitionScreen";

interface QuizPlayerProps {
  quiz: Quiz;
  questions: Question[];
}

type Phase = "hero" | "questions" | "transition" | "lead_capture" | "loading" | "result";

// Define sections for the progress bar
const SECTIONS = [
  { label: "Perfil", categories: ["perfil"] },
  { label: "Desafios", categories: ["desafios"] },
  { label: "Objetivos", categories: ["objetivos"] },
];

// Transitions: before section starts and after section ends
const TRANSITIONS_BEFORE_SECTION: Record<number, string[]> = {
  0: ["after-perfil-1"], // "200 alunos" — shown before Perfil questions (right after Começar)
};

const TRANSITIONS_AFTER_SECTION: Record<number, string[]> = {
  0: ["after-perfil-2"], // "Mentoria de Carreira" — after Perfil questions
  1: ["after-desafios"], // "Acelera resultados" — after Desafios questions
};

function getSectionIndex(category: string): number {
  const cat = category.toLowerCase();
  for (let i = 0; i < SECTIONS.length; i++) {
    if (SECTIONS[i].categories.some((c) => cat.includes(c))) return i;
  }
  return 0;
}

function getSectionProgress(
  questions: Question[],
  currentIndex: number
): { sectionIndex: number; fills: number[] } {
  const currentCategory = questions[currentIndex]?.category || "";
  const sectionIndex = getSectionIndex(currentCategory);

  const fills = SECTIONS.map((_section, si) => {
    const sectionQuestions = questions.filter(
      (q) => getSectionIndex(q.category) === si
    );
    if (sectionQuestions.length === 0) return si < sectionIndex ? 1 : 0;

    if (si < sectionIndex) return 1;
    if (si > sectionIndex) return 0;

    const firstIdxInSection = questions.findIndex(
      (q) => getSectionIndex(q.category) === si
    );
    const positionInSection = currentIndex - firstIdxInSection;

    return Math.min(positionInSection / sectionQuestions.length, 1);
  });

  return { sectionIndex, fills };
}

export default function QuizPlayer({ quiz, questions }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("hero");
  const [resultMarkdown, setResultMarkdown] = useState("");
  const [respondentName, setRespondentName] = useState("");

  // Transition state
  const [transitionQueue, setTransitionQueue] = useState<string[]>([]);
  const [pendingNextIndex, setPendingNextIndex] = useState<number | null>(null);

  const [resultData, setResultData] = useState<{
    archetype: { code: string; name: string; emoji: string; description: string };
    secondary: { code: string; name: string; emoji: string; description: string };
    scores: Record<string, number>;
  } | null>(null);

  const currentQuestion = questions[currentIndex];

  // For progress bar: use pendingNextIndex during transitions to show completed section
  const progressIndex = phase === "transition" && pendingNextIndex !== null
    ? pendingNextIndex
    : currentIndex;
  const { sectionIndex, fills } = getSectionProgress(questions, progressIndex);
  const currentSectionLabel = SECTIONS[sectionIndex]?.label || "Perfil";

  function handleAnswer(questionId: string, optionId: string) {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);

    setTimeout(() => {
      const nextIndex = currentIndex + 1;

      if (nextIndex >= questions.length) {
        // Quiz done — check if there are transitions after the last section
        const lastSectionIdx = getSectionIndex(questions[currentIndex].category);
        const transitions = TRANSITIONS_AFTER_SECTION[lastSectionIdx];
        if (transitions?.length) {
          setTransitionQueue([...transitions]);
          setPendingNextIndex(null); // null = go to lead_capture after
          setPhase("transition");
        } else {
          setPhase("lead_capture");
        }
        return;
      }

      // Check if we're crossing a section boundary
      const currentSec = getSectionIndex(questions[currentIndex].category);
      const nextSec = getSectionIndex(questions[nextIndex].category);

      if (currentSec !== nextSec) {
        // Section boundary — show transitions
        const transitions = TRANSITIONS_AFTER_SECTION[currentSec];
        if (transitions?.length) {
          setTransitionQueue([...transitions]);
          setPendingNextIndex(nextIndex);
          setPhase("transition");
          return;
        }
      }

      setCurrentIndex(nextIndex);
    }, 400);
  }

  function handleTransitionContinue() {
    const remaining = transitionQueue.slice(1);

    if (remaining.length > 0) {
      setTransitionQueue(remaining);
      return;
    }

    // No more transitions
    if (pendingNextIndex !== null) {
      setCurrentIndex(pendingNextIndex);
      setPendingNextIndex(null);
      setPhase("questions");
    } else {
      setPhase("lead_capture");
    }
    setTransitionQueue([]);
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  const handleSubmit = useCallback(async (name: string, email: string, phone: string) => {
    setRespondentName(name);
    setPhase("loading");

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: quiz.id,
          respondent_name: name,
          respondent_email: email,
          respondent_phone: phone,
          answers,
        }),
      });

      if (!response.ok) throw new Error("Erro ao enviar respostas");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream não disponível");

      const decoder = new TextDecoder();
      let fullText = "";
      let metaReceived = false;

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
              setResultData(parsed);
              metaReceived = true;
              setPhase("result");
            } else if (parsed.type === "text") {
              fullText += parsed.content;
              setResultMarkdown(fullText);
            }
          } catch {
            // Skip non-JSON lines
          }
        }
      }

      if (!metaReceived) {
        setPhase("result");
      }
    } catch (error) {
      console.error(error);
      setPhase("lead_capture");
    }
  }, [quiz.id, answers]);

  // ========== RENDER PHASES ==========

  if (phase === "hero") {
    return (
      <HeroScreen
        onStart={() => {
          const beforeFirst = TRANSITIONS_BEFORE_SECTION[0];
          if (beforeFirst?.length) {
            setTransitionQueue([...beforeFirst]);
            setPendingNextIndex(0);
            setPhase("transition");
          } else {
            setPhase("questions");
          }
        }}
      />
    );
  }

  if (phase === "lead_capture") {
    return <LeadCapture onSubmit={handleSubmit} />;
  }

  if (phase === "loading") {
    return <LoadingScreen />;
  }

  if (phase === "result" && resultData) {
    return (
      <ResultView
        archetype={resultData.archetype}
        secondary={resultData.secondary}
        scores={resultData.scores}
        dimensions={quiz.dimensions}
        markdown={resultMarkdown}
        respondentName={respondentName}
      />
    );
  }

  // ========== QUIZ LAYOUT (questions + transitions share the same shell) ==========

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* Header with progress bar */}
      <header
        style={{
          position: "relative",
          padding: "12px 20px",
          borderBottom: "1px solid rgb(227, 228, 230)",
        }}
      >
        {/* Back button + section label */}
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
              backgroundColor:
                currentIndex > 0 && phase === "questions"
                  ? "rgb(230, 232, 236)"
                  : "transparent",
              border: "none",
              cursor:
                currentIndex > 0 && phase === "questions" ? "pointer" : "default",
              visibility:
                currentIndex > 0 || phase === "transition" ? "visible" : "hidden",
              pointerEvents: phase === "transition" ? "none" : "auto",
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
          <span style={{ fontSize: 18, fontWeight: 400, color: "#000" }}>
            {currentSectionLabel}
          </span>
          <div style={{ width: 45, visibility: "hidden" }}>
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Dot progress bar: 4 dots, 3 segments (one per section) */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {SECTIONS.map((_section, si) => (
            <div key={si} style={{ display: "contents" }}>
              <span
                className={`progress-dot ${si <= sectionIndex ? "active" : "pending"}`}
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
              sectionIndex >= SECTIONS.length - 1 && fills[SECTIONS.length - 1] >= 1
                ? "active"
                : "pending"
            }`}
          />
        </div>
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
            paddingBottom: 120,
          }}
        >
          <div style={{ marginTop: 24, width: "100%", maxWidth: 480 }}>
            <QuestionCard
              question={currentQuestion}
              selectedOption={answers[currentQuestion.id]}
              onSelect={(optionId) => handleAnswer(currentQuestion.id, optionId)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
