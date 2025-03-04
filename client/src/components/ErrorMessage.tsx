// components/ErrorMessage.tsx
import React from "react";
import styles from "@/app/page.module.css";

interface ErrorMessageProps {
  error: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return (
    <>
      {error && (
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
        </div>
      )}
    </>
  );
};

export default ErrorMessage;
