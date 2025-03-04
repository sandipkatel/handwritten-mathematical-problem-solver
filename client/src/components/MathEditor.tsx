// components/MathEditor.tsx
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";

// Extend the Window interface to include MathQuill
declare global {
  interface Window {
    MathQuill?: any;
  }
}

// Dynamically import MathQuill components with no SSR
const EditableMathField = dynamic(
  () => import("react-mathquill").then((mod) => mod.EditableMathField),
  { ssr: false }
);

const StaticMathField = dynamic(
  () => import("react-mathquill").then((mod) => mod.StaticMathField),
  { ssr: false }
);

// Define prop types with explicit typing
interface MathEditorProps {
  initialLatex?: string;
  onLatexChange?: (latex: string) => void;
}

const MathEditor: React.FC<MathEditorProps> = ({
  initialLatex = "",
  onLatexChange,
}) => {
  const [latex, setLatex] = useState<string>(initialLatex);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [mathQuillLoaded, setMathQuillLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mathFieldRef = useRef<any>(null);

  // Load MathQuill manually
  useEffect(() => {
    const loadMathQuill = () => {
      // Dynamically load MathQuill CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href =
        "https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.css";
      document.head.appendChild(cssLink);

      // Dynamically load MathQuill JS
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js";
      script.async = true;

      script.onload = () => {
        if (window.MathQuill) {
          setMathQuillLoaded(true);
        } else {
          setLoadError("MathQuill failed to load completely");
        }
      };

      script.onerror = () => {
        setLoadError("Failed to load MathQuill script");
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
        document.head.removeChild(cssLink);
      };
    };

    if (typeof window !== "undefined" && !window.MathQuill) {
      loadMathQuill();
    } else if (window.MathQuill) {
      setMathQuillLoaded(true);
    }
  }, []);

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle changes from the math field
  const handleChange = (mathField: any) => {
    try {
      const newLatex = mathField.latex();
      setLatex(newLatex);
      if (onLatexChange) {
        onLatexChange(newLatex);
      }
    } catch (error) {
      console.error("Error updating LaTeX:", error);
    }
  };

  if (!isClient) {
    return <div className="p-4 border rounded-md">Loading math editor...</div>;
  }

  if (loadError) {
    return (
      <div className="p-4 border rounded-md text-red-500">
        Error: {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-md bg-gray-800">
        <h3 className="text-lg font-medium mb-3">Edit Expression</h3>
        <div className="border rounded p-2 bg-black text-white mathquill-editor caret-white">
          {mathQuillLoaded ? (
            <EditableMathField
              latex={latex}
              onChange={handleChange}
              mathquillDidMount={(mathField) => {
                mathFieldRef.current = mathField;
                // Set initial latex when field mounts
                if (initialLatex) {
                  try {
                    mathField.latex(initialLatex);
                  } catch (error) {
                    console.error("Error setting initial LaTeX:", error);
                  }
                }
              }}
            />
          ) : (
            <div className="text-white p-2">Loading MathQuill editor...</div>
          )}
        </div>
      </div>

      <div className="p-4 border rounded-md bg-gray-800">
        <h3 className="text-lg font-medium mb-3">Preview</h3>
        <div className="p-2 min-h-12 border rounded bg-gray-900">
          {latex && mathQuillLoaded ? (
            <StaticMathField>{latex}</StaticMathField>
          ) : (
            <span className="text-gray-400">
              {mathQuillLoaded ? "No latex entered" : "Loading preview..."}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 border rounded-md bg-gray-800">
        <h3 className="text-lg font-medium mb-3">LaTeX</h3>
        <div className="p-2 min-h-12 border rounded bg-gray-900 font-mono text-sm overflow-x-auto text-white">
          {latex || (
            <span className="text-gray-400">LaTeX will appear here</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MathEditor;
