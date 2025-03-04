// components/RecognizedSection.tsx
"use client";

import React from "react";
import { MathJax } from "better-react-mathjax";
import { Check, Copy, Download, FileText, Code } from "lucide-react";
import styles from "@/app/page.module.css";

interface RecognizedSectionProps {
  recognizedLatex: string;
  displayMode: "latex" | "normal";
  setDisplayMode: (mode: "latex" | "normal") => void;
  copyToClipboard: (text: string, type: string) => void;
  copiedText: string | null;
  solveExpression: () => void;
  isProcessing: boolean;
}

// Convert LaTeX to normal text (simplified version)
const latexToNormalText = (latex: string): string => {
  if (!latex) return "";

  // This is a simplified conversion - a real implementation would be more comprehensive
  let normalText = latex
    .replace(/\^(\d+|{.+?})/g, (match, p1) => {
      // Handle superscripts
      if (p1.startsWith("{") && p1.endsWith("}")) {
        return `^(${p1.substring(1, p1.length - 1)})`;
      }
      return `^(${p1})`;
    })
    .replace(/\\frac{(.+?)}{(.+?)}/g, "$1/$2")
    .replace(/\\sqrt{(.+?)}/g, "√($1)")
    .replace(/\\cdot/g, "×")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷");

  return normalText;
};

const RecognizedSection: React.FC<RecognizedSectionProps> = ({
  recognizedLatex,
  displayMode,
  setDisplayMode,
  copyToClipboard,
  copiedText,
  solveExpression,
  isProcessing,
}) => {
  return (
    <>
      {recognizedLatex && (
        <section className={styles.recognizedSection}>
          <div className={styles.recognizedHeader}>
            <h2>Recognized Expression</h2>
            <div className={styles.displayToggle}>
              <button
                className={`${styles.toggleButton} ${
                  displayMode === "normal" ? styles.active : ""
                }`}
                onClick={() => setDisplayMode("normal")}
              >
                <FileText size={16} />
                Normal
              </button>
              <button
                className={`${styles.toggleButton} ${
                  displayMode === "latex" ? styles.active : ""
                }`}
                onClick={() => setDisplayMode("latex")}
              >
                <Code size={16} />
                LaTeX
              </button>
            </div>
          </div>

          <div className={styles.recognizedContent}>
            {displayMode === "latex" ? (
              <div className={styles.latexView}>
                <pre className={styles.codeBlock}>{recognizedLatex}</pre>
                <button
                  className={styles.copyButton}
                  onClick={() => copyToClipboard(recognizedLatex, "latex")}
                >
                  {copiedText === "latex" ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                  {copiedText === "latex" ? "Copied!" : "Copy LaTeX"}
                </button>
              </div>
            ) : (
              <div className={styles.normalView}>
                <p className={styles.normalText}>
                  {latexToNormalText(recognizedLatex)}
                </p>
                <button
                  className={styles.copyButton}
                  onClick={() =>
                    copyToClipboard(
                      latexToNormalText(recognizedLatex),
                      "normal"
                    )
                  }
                >
                  {copiedText === "normal" ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                  {copiedText === "normal" ? "Copied!" : "Copy Text"}
                </button>
              </div>
            )}

            <div className={styles.renderedMath}>
              <h3>Rendered Expression</h3>
              <div className={styles.mathDisplay}>
                <MathJax>{"$$" + recognizedLatex + "$$"}</MathJax>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                className={styles.solveButton}
                onClick={solveExpression}
                disabled={!recognizedLatex || isProcessing}
              >
                Solve Expression
              </button>

              <button
                className={styles.downloadButton}
                onClick={() => {
                  const blob = new Blob([recognizedLatex], {
                    type: "text/plain",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "expression.tex";
                  a.click();
                }}
              >
                <Download size={16} />
                Download LaTeX
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default RecognizedSection;
