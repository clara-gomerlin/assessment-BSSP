"use client";

import { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  selectedOption: string | string[] | undefined;
  onSelect: (optionId: string) => void;
  onMultiConfirm?: (optionIds: string[]) => void;
}

export default function QuestionCard({
  question,
  selectedOption,
  onSelect,
  onMultiConfirm,
}: QuestionCardProps) {
  const isMulti = question.type === "multiple_choice";
  const selectedArray = Array.isArray(selectedOption)
    ? selectedOption
    : selectedOption
    ? [selectedOption]
    : [];

  function handleClick(optionId: string) {
    if (isMulti) {
      // Toggle in multi-select mode — parent manages state via onSelect
      onSelect(optionId);
    } else {
      onSelect(optionId);
    }
  }

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
          className="question-text"
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#000",
            lineHeight: 1.3,
            textAlign: "center",
          }}
        >
          {question.text}
        </h2>
        {isMulti && (
          <p
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: "#64748b",
              marginTop: 4,
              textAlign: "center",
            }}
          >
            Selecione todas que se aplicam
          </p>
        )}
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
          const isSelected = selectedArray.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleClick(option.id)}
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
                  {/* Checkbox indicator for multi-select */}
                  {isMulti && (
                    <span
                      style={{
                        flexShrink: 0,
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: isSelected
                          ? "2px solid #2D3246"
                          : "2px solid #c4c7cc",
                        background: isSelected ? "#2D3246" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M3 7L6 10L11 4"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  )}
                  {option.emoji && isMulti && (
                    <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>
                      {option.emoji}
                    </span>
                  )}
                  {option.emoji && !isMulti && (
                    <span
                      style={{
                        flexShrink: 0,
                        padding: "0 2px",
                        minWidth: 26,
                        maxHeight: 26,
                        marginRight: 4,
                        fontSize: 24,
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
                        fontSize: 14,
                        fontWeight: 500,
                        color: isSelected ? "#2D3246" : "#000",
                        textAlign: "left",
                        lineHeight: 1.35,
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

      {/* Confirm button for multi-select */}
      {isMulti && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 20px",
            textAlign: "center",
            zIndex: 999,
            background:
              "linear-gradient(rgba(250,250,250,0.8) 0%, rgba(250,250,250,0) 92.42%), linear-gradient(90deg, rgba(80,186,246,0.12) 0%, rgba(151,88,231,0.12) 91.61%), rgb(250,250,250)",
            opacity: selectedArray.length > 0 ? 1 : 0.4,
            transition: "opacity 0.3s",
            pointerEvents: selectedArray.length > 0 ? "auto" : "none",
          }}
        >
          <button
            onClick={() => onMultiConfirm?.(selectedArray)}
            className="continue-button"
            style={{ maxWidth: 480 }}
          >
            Continuar {selectedArray.length > 0 && `(${selectedArray.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
