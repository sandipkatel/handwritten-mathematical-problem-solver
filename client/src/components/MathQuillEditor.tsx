import React, { useEffect } from "react";
import { addStyles, EditableMathField } from "react-mathquill";

// Load MathQuill's default styles
addStyles();

type Props = {
  value: string;
  onChange: (latex: string) => void;
};

const MathQuillEditor: React.FC<Props> = ({ value, onChange }) => {
  return (
    <EditableMathField
      latex={value}
      onChange={(mathField) => {
        onChange(mathField.latex());
      }}
      style={{
        minHeight: "2.5rem",
        padding: "0.5rem 0.75rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        background: "white",
        fontSize: "1.25rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    />
  );
};

export default MathQuillEditor;
