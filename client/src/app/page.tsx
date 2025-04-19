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
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

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
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [isCropping, setIsCropping] = useState(false);
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageReady, setImageReady] = useState<boolean>(false);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setImageReady(true); // Set image ready flag
      setRecognizedLatex("");
      setEditedLatex("");
      setIsSolved(false);
      setSolution(null);
      setError(null); // Clear previous errors
      setIsCropping(false); // Ensure not in cropping mode
      setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 }); // Reset crop
      setCompletedCrop(null);
    }
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setImageReady(true); // Set image ready flag
      setRecognizedLatex("");
      setEditedLatex("");
      setIsSolved(false);
      setSolution(null);
      setError(null); // Clear previous errors
      setIsCropping(false); // Ensure not in cropping mode
      setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 }); // Reset crop
      setCompletedCrop(null);
    }
  };

  const handleProcessClick = () => {
    if (file) {
      processImage(file);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop);
  };

  // Add this function to apply the crop
  const applyCrop = () => {
    if (
      imgRef.current &&
      completedCrop &&
      completedCrop.width &&
      completedCrop.height
    ) {
      const canvas = document.createElement("canvas");
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Calculate crop dimensions in pixels
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      // Ensure crop dimensions are positive
      if (cropWidth <= 0 || cropHeight <= 0) {
        console.error("Invalid crop dimensions");
        setError("Invalid crop dimensions. Please try cropping again.");
        setIsCropping(false); // Exit cropping mode on error
        return;
      }

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        // Convert the canvas to a blob and create a new File object
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File(
              [blob],
              file?.name || "cropped-image.png",
              {
                type: "image/png", // Use PNG for potentially better quality after crop
              }
            );

            // Update state with the cropped image
            setFile(croppedFile);
            // Revoke previous URL to prevent memory leaks
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(croppedFile));
            setIsCropping(false);
            setImageReady(true); // Cropped image is ready
            // Reset OCR results as the image has changed
            setRecognizedLatex("");
            setEditedLatex("");
            setIsSolved(false);
            setSolution(null);
          } else {
            setError("Failed to create cropped image blob.");
            setIsCropping(false); // Exit cropping mode on error
          }
        }, "image/png");
      } else {
        setError("Failed to get canvas context for cropping.");
        setIsCropping(false); // Exit cropping mode on error
      }
    } else {
      setError("Crop details or image reference missing.");
      setIsCropping(false); // Exit cropping mode on error
    }
  };

  // Add this function to cancel cropping
  const cancelCropping = () => {
    setIsCropping(false);
    setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 }); // Optionally reset crop state
    setCompletedCrop(null);
  };

  // Add this function to start cropping
  const startCropping = () => {
    if (!previewUrl) return; // Don't allow cropping if no image
    setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 }); // Reset crop on start
    setCompletedCrop(null);
    setIsCropping(true);
    setImageReady(false); // Image is not ready for processing while cropping
    // Clear previous OCR results when starting a new crop
    setRecognizedLatex("");
    setEditedLatex("");
    setIsSolved(false);
    setSolution(null);
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
    } catch (err) {
      console.error("Error processing image:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Clean up object URL
    }
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
    setImageReady(false);
    setIsCropping(false);
    setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 });
    setCompletedCrop(null);
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
      // Basic replacements for common math symbols, adjust as needed
      let normal = latex
        .replace(/\\frac{(.*?)}{(.*?)}/g, "($1)/($2)")
        .replace(/\\sqrt{(.*?)}/g, "sqrt($1)")
        .replace(/\\times/g, "*")
        .replace(/\\div/g, "/")
        .replace(/\\pm/g, "±")
        .replace(/\\mp/g, "∓")
        .replace(/\^\{(.*?)\}/g, "^($1)") // Handle exponents like x^{2+y}
        .replace(/\^{(.)}/g, "^$1") // Handle single char exponents x^2
        .replace(/\\sin/g, "sin")
        .replace(/\\cos/g, "cos")
        .replace(/\\tan/g, "tan")
        .replace(/\\log/g, "log")
        .replace(/\\ln/g, "ln")
        .replace(/\\pi/g, "π")
        .replace(/\\alpha/g, "α")
        .replace(/\\beta/g, "β")
        .replace(/\\gamma/g, "γ")
        // Add more replacements as needed
        .replace(/[{}]/g, ""); // Remove leftover braces
      // Attempt simplification with nerdamer if possible, otherwise return basic replacements
      try {
        const expression = nerdamer.convertFromLaTeX(latex);
        return expression.toString();
      } catch (nerdError) {
        console.warn("Nerdamer failed, using basic conversion:", nerdError);
        return normal; // Fallback to basic string replacements
      }
    } catch (error) {
      console.error("Error converting LaTeX:", error);
      return "Conversion Error"; // Return the original LaTeX if conversion fails
    }
  };

  // Start editing the LaTeX code
  const startEditing = () => {
    setIsEditing(true);
  };

  // Save the edited LaTeX
  const saveEdit = () => {
    // Update recognizedLatex only if editedLatex is different
    // This prevents unnecessary re-renders if nothing changed
    if (editedLatex !== recognizedLatex) {
      setRecognizedLatex(editedLatex);
      // Reset solved state if LaTeX changed
      setIsSolved(false);
      setSolution(null);
      setError(null); // Clear solve errors
    }
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
    if (editedLatex !== recognizedLatex) {
      setRecognizedLatex(editedLatex);
      // Reset solved state if LaTeX changed
      setIsSolved(false);
      setSolution(null);
      setError(null); // Clear solve errors
    }
    setIsRenderedEditing(false);
  };

  // Effect to clean up Object URL when component unmounts or previewUrl changes
  useEffect(() => {
    // This is a cleanup function that runs when the component unmounts
    // or before the effect runs again if previewUrl changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]); // Dependency array includes previewUrl

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
                  <div className={styles.previewWrapper}>
                    {" "}
                    {/* NEW WRAPPER */}
                    {/* --- Image/Crop Area --- */}
                    <div className={styles.imageDisplayArea}>
                      {isCropping ? (
                        <ReactCrop
                          crop={crop}
                          onChange={(c, percentCrop) => setCrop(percentCrop)} // Use percentCrop for consistency
                          onComplete={(c) => setCompletedCrop(c)}
                          aspect={undefined} // Allow freeform crop
                          minWidth={10} // Optional: Minimum crop size in pixels
                          minHeight={10} // Optional: Minimum crop size in pixels
                        >
                          <img
                            ref={imgRef}
                            src={previewUrl}
                            alt="Preview - Cropping"
                            style={{
                              display: "block",
                              maxWidth: "100%",
                              maxHeight: "400px",
                            }} // Important for ReactCrop
                            onLoad={(e) => {
                              // You might want to reset crop % here if image dimensions change
                              const { naturalWidth, naturalHeight } =
                                e.currentTarget;
                              if (
                                crop.unit === "%" &&
                                (crop.width > 100 || crop.height > 100)
                              ) {
                                setCrop({
                                  unit: "%",
                                  width: 100,
                                  height: 100,
                                  x: 0,
                                  y: 0,
                                });
                              }
                            }}
                          />
                        </ReactCrop>
                      ) : (
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={400} // Adjust as needed, or use layout="responsive"
                          height={300} // Adjust as needed
                          className={styles.previewImage}
                          // Make sure Next/Image renders an underlying img tag for ref if needed
                          // (It does by default, but good to be aware)
                        />
                      )}
                    </div>
                    {/* --- Action Buttons Area (Below Image/Crop) --- */}
                    <div className={styles.imageActionsBelow}>
                      {isCropping ? (
                        <div className={styles.cropControls}>
                          <button
                            className={`${styles.cropButton} ${styles.applyButton}`} // Add specific class if needed
                            onClick={applyCrop}
                            disabled={
                              !completedCrop ||
                              completedCrop.width === 0 ||
                              completedCrop.height === 0
                            }
                          >
                            <Save size={16} />
                            Apply Crop
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={cancelCropping}
                          >
                            Cancel Crop
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={styles.imageControls}>
                            <button
                              className={styles.cropButton}
                              onClick={startCropping}
                            >
                              <Edit size={16} />
                              Crop Image
                            </button>
                            <button
                              className={styles.resetButton}
                              onClick={handleReset}
                            >
                              <RefreshCw size={16} />
                              New Image
                            </button>
                          </div>

                          {imageReady &&
                            !isCropping && ( // Show process only when ready and not cropping
                              <button
                                className={styles.processButton}
                                onClick={handleProcessClick}
                                disabled={isProcessing || !file} // Disable if processing or no file
                              >
                                {isProcessing ? (
                                  <>
                                    <RefreshCw
                                      size={16}
                                      className={styles.spinningIcon}
                                    />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <FileText size={16} />
                                    Process Image
                                  </>
                                )}
                              </button>
                            )}
                        </>
                      )}
                    </div>
                  </div> // End previewWrapper
                ) : (
                  // Upload Prompt remains the same
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
                        accept="image/*" // Add HEIC/HEIF if needed
                        onChange={handleFileChange}
                        className={styles.fileInput}
                      />
                      <Camera size={16} />
                      Choose Image
                    </label>
                  </div>
                )}
              </div>

              {/* Processing Indicator and Error Message outside dropzone, but inside uploadSection */}
              {isProcessing &&
                !previewUrl && ( // Show spinner only if no preview (initial processing)
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

            {/* Result Section remains largely the same */}
            {recognizedLatex && (
              <section className={styles.resultSection}>
                {/* ... (rest of the result section: Recognized Expression, LaTeX/Normal view, Rendered View, Solve button) ... */}
                {/* Make sure the structure inside remains logical */}
                <div className={styles.recognizedHeader}>
                  <h2>Recognized Expression</h2>
                  {/* Optional: Add view toggle buttons here if desired */}
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
                            aria-label="Edit LaTeX code"
                          />
                          <div className={styles.mathEditingControls}>
                            <button
                              className={styles.saveButton}
                              onClick={saveEdit}
                              aria-label="Save LaTeX changes"
                            >
                              <Save size={16} />
                              Save
                            </button>
                            <button
                              className={styles.cancelButton}
                              onClick={() => {
                                setEditedLatex(recognizedLatex); // Revert changes
                                setIsEditing(false);
                              }}
                              aria-label="Cancel LaTeX editing"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.codeDisplay}>
                          <pre className={styles.codeBlock}>
                            {recognizedLatex}
                          </pre>
                          <div className={styles.codeActions}>
                            <button
                              className={styles.actionButton}
                              onClick={startEditing}
                              aria-label="Edit LaTeX code"
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
                              aria-label="Copy LaTeX code"
                            >
                              {copiedText === "latex" ? (
                                <>
                                  {" "}
                                  <Check size={16} /> Copied!{" "}
                                </>
                              ) : (
                                <>
                                  {" "}
                                  <Copy size={16} /> Copy LaTeX{" "}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.normalView}>
                      <p className={styles.normalText}>
                        {latexToNormalText(recognizedLatex)}
                      </p>
                      <button
                        className={styles.copyButton} // Reuse or create specific style
                        onClick={() =>
                          copyToClipboard(
                            latexToNormalText(recognizedLatex),
                            "normal"
                          )
                        }
                        aria-label="Copy normal text representation"
                      >
                        {copiedText === "normal" ? (
                          <>
                            {" "}
                            <Check size={16} /> Copied!{" "}
                          </>
                        ) : (
                          <>
                            {" "}
                            <Copy size={16} /> Copy Text{" "}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Rendered Math View & Editor */}
                  <div className={styles.renderedContainer}>
                    {isRenderedEditing ? (
                      <div className={styles.mathEditorContainer}>
                        <MathQuillEditor
                          value={editedLatex}
                          onChange={handleMathEditorChange}
                          // ref={mathEditorRef} // Assign ref if needed by MathQuillEditor
                        />
                        <div className={styles.mathEditingControls}>
                          <button
                            className={styles.saveButton}
                            onClick={saveRenderedEdit}
                            aria-label="Save changes from math editor"
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={() => {
                              setEditedLatex(recognizedLatex); // Revert
                              setIsRenderedEditing(false);
                            }}
                            aria-label="Cancel math editing"
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

                  {/* Solve Button */}
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.solveButton}
                      onClick={solveExpression}
                      disabled={
                        !editedLatex ||
                        isProcessing ||
                        isEditing ||
                        isRenderedEditing
                      } // Also disable if editing
                      aria-label="Solve the mathematical expression"
                    >
                      <svg /* Calculator or equals icon might be better */
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
                        <rect
                          x="4"
                          y="2"
                          width="16"
                          height="20"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="8" y1="6" x2="16" y2="6"></line>
                        <line x1="16" y1="14" x2="8" y2="14"></line>
                        <line x1="16" y1="18" x2="8" y2="18"></line>
                        <line x1="10" y1="10" x2="14" y2="10"></line>
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
                            // Only process points that are Maximum or Minimum
                            if (
                              point.type === "Maximum" ||
                              point.type === "Minimum"
                            ) {
                              // --- Coordinate Checks ---
                              const hasNumericX =
                                typeof point.point_numeric === "number" &&
                                !isNaN(point.point_numeric);
                              const hasLatexX =
                                point.point && point.point !== "N/A";
                              const hasNumericY =
                                typeof point.value_numeric === "number" &&
                                !isNaN(point.value_numeric);
                              const hasLatexY =
                                point.value && point.value !== "N/A";

                              // --- Formatted Numeric Values ---
                              const numericXFormatted = hasNumericX
                                ? point.point_numeric.toFixed(2)
                                : "N/A";
                              const numericYFormatted = hasNumericY
                                ? point.value_numeric.toFixed(2)
                                : "N/A";

                              // --- Determine if BOTH approximations exist ---
                              const showApproximation =
                                hasNumericX && hasNumericY;

                              return (
                                <li key={index}>
                                  {`${point.type} point: `}

                                  {/* Render (LaTeX_X, LaTeX_Y) part */}
                                  {`(`}
                                  {hasLatexX ? (
                                    <MathJax inline dynamic>
                                      {`\\(${point.point}\\)`}
                                    </MathJax>
                                  ) : (
                                    "?" // Placeholder if LaTeX X is missing
                                  )}
                                  {`, `}
                                  {hasLatexY ? (
                                    <MathJax inline dynamic>
                                      {`\\(${point.value}\\)`}
                                    </MathJax>
                                  ) : (
                                    "?" // Placeholder if LaTeX Y is missing
                                  )}
                                  {`)`}

                                  {/* Render ≈ (Numeric_X, Numeric_Y) part IFF both numeric values exist */}
                                  {showApproximation && (
                                    <>
                                      {` ≈ (`}
                                      {numericXFormatted}
                                      {`, `}
                                      {numericYFormatted}
                                      {`)`}
                                    </>
                                  )}
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
