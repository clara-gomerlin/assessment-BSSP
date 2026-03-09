"use client";

import { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  selectedOption: string | undefined;
  onSelect: (optionId: string) => void;
}

export default function QuestionCard({
  question,
  selectedOption,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="animate-fade-in">
      {/* Question title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          margin: "24px auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#000",
            lineHeight: 1.3,
            textAlign: "center",
          }}
        >
          {question.text}
        </h2>
      </div>

      {/* Options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          width: "100%",
          maxWidth: 480,
          margin: "12px 0 0",
        }}
      >
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`quiz-option ${isSelected ? "selected" : ""}`}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {option.emoji && (
                    <span
                      style={{
                        flexShrink: 0,
                        padding: "0 4px",
                        minWidth: 32,
                        maxHeight: 32,
                        marginRight: 4,
                        fontSize: 32,
                        lineHeight: 1,
                        overflow: "hidden",
                      }}
                    >
                      {option.emoji}
                    </span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: isSelected ? "#2D3246" : "#000",
                        textAlign: "left",
                        lineHeight: 1.3,
                        letterSpacing: "0.192px",
                      }}
                    >
                      {option.label}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
