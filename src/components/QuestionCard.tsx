"use client";

import { useState } from "react";
import { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  selectedOption: string | string[] | undefined;
  onSelect: (optionId: string) => void;
  onMultiConfirm?: (optionIds: string[]) => void;
  subtitle?: string;
  onOtherText?: (questionId: string, text: string) => void;
}

export default function QuestionCard({
  question,
  selectedOption,
  onSelect,
  onMultiConfirm,
  subtitle,
  onOtherText,
}: QuestionCardProps) {
  const isMulti = question.type === "multiple_choice";
  const selectedArray = Array.isArray(selectedOption)
    ? selectedOption
    : selectedOption
    ? [selectedOption]
    : [];

  // "Outro (qual)" free text support
  const [otherText, setOtherText] = useState("");
  const otherOption = question.options.find((o) =>
    o.label.toLowerCase().startsWith("outro")
  );
  const isOtherSelected = otherOption
    ? selectedArray.includes(otherOption.id)
    : false;

  function handleClick(optionId: string) {
    if (isMulti) {
      onSelect(optionId);
    } else {
      // If clicking "Outro" option, don't auto-advance — wait for text input
      if (otherOption && optionId === otherOption.id) {
        onSelect(optionId);
        return;
      }
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
            fontFamily: "var(--font-quiz)",
            fontSize: 22,
            fontWeight: 700,
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
              fontFamily: "var(--font-quiz)",
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
        {!isMulti && subtitle && (
          <p
            style={{
              fontFamily: "var(--font-quiz)",
              fontSize: 14,
              fontWeight: 400,
              color: "#5F687B",
              marginTop: 6,
              textAlign: "center",
            }}
          >
            {subtitle}
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
                        fontFamily: "var(--font-quiz)",
                        fontSize: 16,
                        fontWeight: 400,
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

      {/* "Outro (qual)" text input */}
      {isOtherSelected && !isMulti && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 16,
            width: "100%",
            maxWidth: 480,
          }}
        >
          <input
            type="text"
            value={otherText}
            onChange={(e) => {
              setOtherText(e.target.value);
              onOtherText?.(question.id, e.target.value);
            }}
            placeholder="Digite sua resposta..."
            autoFocus
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: "1.5px solid #c4c7cc",
              fontSize: 16,
              fontFamily: "var(--font-quiz)",
              color: "#000",
              outline: "none",
              background: "#fff",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2D3246")}
            onBlur={(e) => (e.target.style.borderColor = "#c4c7cc")}
          />
          <button
            onClick={() => {
              if (otherText.trim()) {
                onOtherText?.(question.id, otherText.trim());
                onSelect(otherOption!.id);
              }
            }}
            className="continue-button"
            style={{
              maxWidth: 480,
              opacity: otherText.trim() ? 1 : 0.4,
              pointerEvents: otherText.trim() ? "auto" : "none",
            }}
          >
            Continuar
          </button>
        </div>
      )}

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
