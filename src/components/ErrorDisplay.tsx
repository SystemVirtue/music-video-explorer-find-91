
import React from "react";

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  if (!error) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 border border-destructive/50 bg-destructive/10 rounded-md text-center">
      {error}
    </div>
  );
};

export default ErrorDisplay;
