// components/SolutionSection.tsx
"use client";

import React from "react";
import { Check, Copy } from "lucide-react";
import styles from "@/app/page.module.css";

interface SolutionSectionProps {
  solution: string | null;
  copyToClipboard: (text: string, type: string) => void;
  copiedText: string | null;
  isSolved: boolean;
}

const SolutionSection: React.FC<SolutionSectionProps> = ({
  solution,
  copyToClipboard,
  copiedText,
  isSolved,
}) => {
  return (
    <>
      {isSolved && solution && (
        <section className={styles.solutionSection}>
          <h2>Solution</h2>
          <div className={styles.solutionContent}>
            <pre className={styles.solutionSteps}>{solution}</pre>
            <button
              className={styles.copyButton}
              onClick={() => copyToClipboard(solution, "solution")}
            >
              {copiedText === "solution" ? (
                <Check size={16} />
              ) : (
                <Copy size={16} />
              )}
              {copiedText === "solution" ? "Copied!" : "Copy Solution"}
            </button>
          </div>
        </section>
      )}
    </>
  );
};

export default SolutionSection;
