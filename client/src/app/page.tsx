"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import {
  Upload,
  Camera,
  RefreshCw,
  Copy,
  Check,
  Download,
  Edit,
  Save,
  FileText,
  Code,
  Moon,
  Sun,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import styles from "@/app/page.module.css";
import nerdamer from "nerdamer";
import "nerdamer/all";
import Script from "next/script";

// MathLive needs to be imported this way to prevent SSR issues
const MathQuillEditor = dynamic(() => import("../components/MathQuillEditor"), {
  ssr: false,
});

export default function HandwritingConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedLatex, setRecognizedLatex] = useState<string>("");
  const [editedLatex, setEditedLatex] = useState<string>("");
  const [displayMode, setDisplayMode] = useState<"latex" | "normal">("latex");
  const [error, setError] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRenderedEditing, setIsRenderedEditing] = useState(false);
  const mathEditorRef = useRef<any>(null);
  const [plotUrl, setPlotUrl] = useState<string | null>(null);
  // In page.tsx, near other useState hooks
  const [criticalPointsAnalysis, setCriticalPointsAnalysis] = useState<
    any[] | null
  >(null);

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
      const response = await fetch("http://localhost:8080/api/convert/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert image");
      }

      const data = await response.json();
      setRecognizedLatex(data.latex);
      setEditedLatex(data.latex);
      setIsProcessing(false);
    } catch (err) {
      console.error("Error processing image:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsProcessing(false);
    }
  };

  // In page.tsx

  const solveExpression = async () => {
    if (!editedLatex) return;

    setIsSolved(false);
    setSolution(null);
    setPlotUrl(null);
    setError(null);
    setCriticalPointsAnalysis(null); // Reset critical points state

    try {
      const response = await fetch("http://localhost:8080/api/solve/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latex: editedLatex }),
      });

      const result = await response.json();

      console.log("Received Result:", JSON.stringify(result, null, 2));
      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to calculate solution");
      }

      console.log("Solver Result:", result); // Log the result for debugging

      let latexSolutions: string = "";
      const resultType = result.type; // Get the type from the result

      // --- Handle Different Result Types ---

      if (resultType === "system_of_equations") {
        // Existing logic for systems seems okay, maybe simplify formatting slightly
        if (Array.isArray(result.solution) && result.solution.length > 0) {
          latexSolutions = result.solution
            .map((sol: any, i: number) => {
              const parts = Object.entries(sol)
                .map(([key, val]) => `${key} = ${String(val)}`) // Use variable name directly
                .join(", \\enspace "); // Use space instead of comma if preferred
              return `\\text{Set ${i + 1}}: \\{ ${parts} \\}`; // Format as a set
            })
            .join(" \\\\ ");
        } else {
          latexSolutions =
            "\\text{No solution found or unique solution format differs.}"; // Handle no solution case
          if (result.status) latexSolutions = `\\text{${result.status}}`;
        }
      } else if (
        resultType === "linear_equation" ||
        resultType === "polynomial_equation" ||
        resultType === "polynomial_analysis"
      ) {
        // Handle single equations (linear or polynomial)
        const variable = result.variable || "x"; // Default variable if missing
        if (Array.isArray(result.solution) && result.solution.length > 0) {
          if (result.solution.length === 1) {
            latexSolutions = `${variable} = ${result.solution[0]}`;
          } else {
            // Join multiple solutions with commas
            latexSolutions = `${variable} = ${result.solution.join(",\\ ")}`;
          }
        } else {
          latexSolutions = "\\text{No solution found.}";
        }
        // Note: polynomial_analysis also returns roots in 'solution'
      } else if (resultType === "derivative") {
        latexSolutions = result.solution; // The main solution is the derivative itself
        // Store the critical points analysis separately
        if (result.critical_points_analysis) {
          setCriticalPointsAnalysis(result.critical_points_analysis);
        }
        // Optionally include the final formatted string if desired
        // latexSolutions = result.final_result || result.solution;
      } else if (
        resultType === "indefinite_integral" ||
        resultType === "definite_integral"
      ) {
        latexSolutions = result.solution; // The main solution is the integral result
        // Optionally include the final formatted string if desired
        // latexSolutions = result.final_result || result.solution;
        if (resultType === "indefinite_integral") latexSolutions += " + C"; // Add constant for indefinite
      } else if (resultType === "matrix_operation") {
        latexSolutions =
          result.result_matrix ||
          result.determinant ||
          result.inverse_matrix ||
          "\\text{Matrix result unavailable}";
      } else if (resultType === "arithmetic_simplification") {
        latexSolutions =
          result.result || "\\text{Simplification result unavailable}";
      }
      // --- Fallback for unknown types or direct results ---
      else {
        // Use the 'solution' field if available, otherwise the whole result
        latexSolutions = String(
          result.solution ?? result.result ?? JSON.stringify(result)
        );
        console.warn("Unhandled result type or format:", result);
      }

      setSolution(latexSolutions);
      setPlotUrl(result.plot_url || null);
      setIsSolved(true);
    } catch (error: any) {
      console.error("Error solving expression:", error);
      setError(error.message || "Failed to solve the expression");
      setIsSolved(false); // Ensure isSolved is false on error
    }
  };

  // Handle reset to clear all states
  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setRecognizedLatex("");
    setEditedLatex("");
    setError(null);
    setIsSolved(false);
    setSolution(null);
    setCopiedText(null);
    setIsEditing(false);
    setIsRenderedEditing(false);
    setCriticalPointsAnalysis(null);
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Convert LaTeX to more readable normal text (simplified version)
  const latexToNormalText = (latex: string): string => {
    try {
      const expression = nerdamer.convertFromLaTeX(latex);
      return expression.toString();
    } catch (error) {
      console.error("Error converting LaTeX:", error);
      return "Invalid expression";
    }
  };

  // Start editing the LaTeX code
  const startEditing = () => {
    setIsEditing(true);
  };

  // Save the edited LaTeX
  const saveEdit = () => {
    setRecognizedLatex(editedLatex);
    setIsEditing(false);
  };

  // Start editing the rendered expression
  const startRenderedEditing = () => {
    setIsRenderedEditing(true);
  };

  // Handle math editor changes
  const handleMathEditorChange = (latex: string) => {
    setEditedLatex(latex);
  };

  // Save the rendered math edit
  const saveRenderedEdit = () => {
    setRecognizedLatex(editedLatex);
    setIsRenderedEditing(false);
  };

  return (
    <>
      <Script
        src="https://unpkg.com/mathlive/dist/mathlive.min.js"
        strategy="beforeInteractive"
      />
      <MathJaxContext>
        <div className={styles.pageContainer}>
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
                    <button
                      className={styles.resetButton}
                      onClick={handleReset}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                        <path d="M16 21h5v-5"></path>
                      </svg>
                      New Image
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <div className={styles.uploadIcon}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <h3>Drag & Drop or Click to Upload</h3>
                    <p>Supported formats: JPG, PNG, JPEG (max 5MB)</p>
                    <label className={styles.uploadButton}>
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
              <section className={styles.resultSection}>
                <div className={styles.recognizedHeader}>
                  <h2>Recognized Expression</h2>
                </div>

                <div className={styles.recognizedContent}>
                  {displayMode === "latex" ? (
                    <div className={styles.latexContainer}>
                      {isEditing ? (
                        <div className={styles.editContainer}>
                          <textarea
                            className={styles.editTextarea}
                            value={editedLatex}
                            onChange={(e) => setEditedLatex(e.target.value)}
                            rows={4}
                          />
                          <div className={styles.mathEditingControls}>
                            <button
                              className={styles.saveButton}
                              onClick={saveEdit}
                            >
                              <Save size={16} />
                              Save
                            </button>
                            <button
                              className={styles.cancelButton}
                              onClick={() => {
                                setEditedLatex(recognizedLatex);
                                setIsEditing(false);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={styles.codeDisplay}>
                            <pre className={styles.codeBlock}>
                              {recognizedLatex}
                            </pre>
                            <div className={styles.codeActions}>
                              <button
                                className={styles.actionButton}
                                onClick={startEditing}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                              </button>
                              <button
                                className={styles.actionButton}
                                onClick={() =>
                                  copyToClipboard(recognizedLatex, "latex")
                                }
                              >
                                {copiedText === "latex" ? (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect
                                        x="9"
                                        y="9"
                                        width="13"
                                        height="13"
                                        rx="2"
                                        ry="2"
                                      ></rect>
                                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    Copy LaTeX
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
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

                  <div className={styles.renderedContainer}>
                    {isRenderedEditing ? (
                      <div className={styles.mathEditorContainer}>
                        <MathQuillEditor
                          value={editedLatex}
                          onChange={handleMathEditorChange}
                        />
                        <div className={styles.mathEditingControls}>
                          <button
                            className={styles.saveButton}
                            onClick={saveRenderedEdit}
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={() => {
                              setEditedLatex(recognizedLatex);
                              setIsRenderedEditing(false);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={styles.mathDisplay}
                        onClick={startRenderedEditing}
                        role="button"
                        tabIndex={0}
                        aria-label="Click to edit math expression"
                      >
                        <MathJax>{"$$" + recognizedLatex + "$$"}</MathJax>
                        <div className={styles.editOverlay}>
                          <Edit size={16} />
                          <span>Click to edit</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      className={styles.solveButton}
                      onClick={solveExpression}
                      disabled={!recognizedLatex || isProcessing}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Solve Expression
                    </button>
                  </div>
                </div>
              </section>
            )}

            {isSolved && (
              <section className={styles.solutionSection}>
                <h2>Solution</h2>
                <div className={styles.solutionContent}>
                  {solution ? (
                    <MathJax dynamic>{"\\[" + solution + "\\]"}</MathJax>
                  ) : (
                    <p>No solution could be displayed.</p> // Changed message slightly
                  )}

                  {/* Display Critical Points Analysis if available */}

                  {criticalPointsAnalysis &&
                    criticalPointsAnalysis.length > 0 && (
                      <div className={styles.criticalPointsSection}>
                        <h4>Critical Points Analysis</h4>
                        <ul>
                          {criticalPointsAnalysis.map((point, index) => {
                            // Check if the point type is Maximum or Minimum
                            if (
                              point.type === "Maximum" ||
                              point.type === "Minimum"
                            ) {
                              let xCoord: React.ReactNode = point.point; // Default to original LaTeX
                              let yCoord: React.ReactNode = point.value; // Default to original LaTeX

                              // Try to parse and round the x-coordinate (point)
                              if (point.point) {
                                // Check if point.point exists
                                const xNum = parseFloat(point.point);
                                if (!isNaN(xNum)) {
                                  // Check if parsing was successful
                                  xCoord = xNum.toFixed(2); // Round to 2 decimal places
                                } else {
                                  // If parsing failed, wrap original LaTeX in MathJax
                                  xCoord = (
                                    <MathJax inline dynamic>
                                      {point.point}
                                    </MathJax>
                                  );
                                }
                              } else {
                                xCoord = "N/A"; // Handle null/undefined case
                              }

                              // Try to parse and round the y-coordinate (value)
                              if (point.value) {
                                // Check if point.value exists
                                const yNum = parseFloat(point.value);
                                if (!isNaN(yNum)) {
                                  // Check if parsing was successful
                                  yCoord = yNum.toFixed(2); // Round to 2 decimal places
                                } else {
                                  // If parsing failed, wrap original LaTeX in MathJax
                                  yCoord = (
                                    <MathJax inline dynamic>
                                      {point.value}
                                    </MathJax>
                                  );
                                }
                              } else {
                                yCoord = "N/A"; // Handle null/undefined case
                              }

                              return (
                                <li key={index}>
                                  {/* Display "Maximum point" or "Minimum point" */}
                                  {`${point.type} point: (`}
                                  {/* Render the potentially rounded x-coordinate */}
                                  {xCoord}
                                  {/* Add comma and space */}
                                  {", "}
                                  {/* Render the potentially rounded y-coordinate */}
                                  {yCoord}
                                  {/* Closing parenthesis */}
                                  {`)`}
                                </li>
                              );
                            }
                            return null; // Don't render list items for other types
                          })}
                        </ul>
                      </div>
                    )}

                  {/* Plot Rendering (existing code) */}
                  {plotUrl && (
                    <div className={styles.plotContainer}>
                      <h3>Graph</h3>
                      <img
                        src={`http://localhost:8080/api/${plotUrl}?t=${Date.now()}`} // Add timestamp to prevent caching issues
                        alt="Plot of the function/solution"
                        className={styles.plotImage}
                        onError={(e) => {
                          console.error("Failed to load plot image");
                          e.currentTarget.style.display = "none";
                          // Add error message more robustly
                          const errorMsgId = "plot-error-msg";
                          let errorMessage =
                            e.currentTarget.parentNode?.querySelector(
                              `#${errorMsgId}`
                            );
                          if (!errorMessage) {
                            errorMessage = document.createElement("p");
                            errorMessage.id = errorMsgId;
                            errorMessage.textContent =
                              "Error loading graph. Please ensure the backend generated it correctly.";
                            e.currentTarget.parentNode?.appendChild(
                              errorMessage
                            );
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </MathJaxContext>
    </>
  );
}
