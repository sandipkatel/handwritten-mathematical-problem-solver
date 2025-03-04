"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import {
  Camera,
  Upload,
  Check,
  RefreshCw,
  Download,
  Copy,
  FileText,
  Code,
} from "lucide-react";
import styles from "@/app/page.module.css";

export default function HandwritingConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedLatex, setRecognizedLatex] = useState<string>("");
  const [displayMode, setDisplayMode] = useState<"latex" | "normal">("normal");
  const [error, setError] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      await processImage(selectedFile);
    }
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      await processImage(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Process the image with the OCR model
  const processImage = async (imageFile: File) => {
    setIsProcessing(true);
    setError(null);
    setIsSolved(false);
    setSolution(null);

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch("http://localhost:5000/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert image");
      }

      const data = await response.json();
      setRecognizedLatex(data.latex);
      setIsProcessing(false);
    } catch (err) {
      console.error("Error processing image:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsProcessing(false);
    }
  };

  // Solve the recognized expression
  const solveExpression = async () => {
    if (!recognizedLatex) return;

    setIsSolved(false);

    try {
      // Uncomment for actual API implementation

      const response = await fetch("http://localhost:5000/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latex: recognizedLatex }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate solution");
      }

      const result = await response.json();
      setSolution(result.solution);
      setIsSolved(true);
    } catch (error) {
      console.error("Error solving expression:", error);
      setError("Failed to solve the expression");
    }
  };

  // Handle reset to clear all states
  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setRecognizedLatex("");
    setError(null);
    setIsSolved(false);
    setSolution(null);
    setCopiedText(null);
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

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

  return (
    <MathJaxContext>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Handwriting to LaTeX Converter</h1>
          <p>Convert your handwritten math expressions to LaTeX format</p>
        </header>

        <main className={styles.mainContent}>
          <section className={styles.uploadSection}>
            <div
              className={styles.dropZone}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {previewUrl ? (
                <div className={styles.previewContainer}>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={400}
                    height={300}
                    className={styles.previewImage}
                  />
                  <button className={styles.resetButton} onClick={handleReset}>
                    <RefreshCw size={16} />
                    New Image
                  </button>
                </div>
              ) : (
                <div className={styles.uploadPrompt}>
                  <div className={styles.uploadIcon}>
                    <Upload size={48} />
                  </div>
                  <h3>Drag & Drop or Click to Upload</h3>
                  <p>Supported formats: JPG, PNG, JPEG (max 5MB)</p>
                  <label className={styles.fileInputLabel}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <Camera size={16} />
                    Choose Image
                  </label>
                </div>
              )}
            </div>

            {isProcessing && (
              <div className={styles.processingIndicator}>
                <div className={styles.spinner}></div>
                <p>Processing your image...</p>
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                <p>Error: {error}</p>
              </div>
            )}
          </section>

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
        </main>

        <footer className={styles.footer}>
          <p>Handwriting to LaTeX OCR Tool © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </MathJaxContext>
  );
}
