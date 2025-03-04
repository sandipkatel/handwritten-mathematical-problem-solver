// components/ProcessingIndicator.tsx
import React from "react";
import styles from "@/app/page.module.css";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  isProcessing,
}) => {
  return (
    <>
      {isProcessing && (
        <div className={styles.processingIndicator}>
          <div className={styles.spinner}></div>
          <p>Processing your image...</p>
        </div>
      )}
    </>
  );
};

export default ProcessingIndicator;
