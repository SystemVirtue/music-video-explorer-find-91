
import React from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ProcessingStatusProps {
  isSearching: boolean;
  isProcessing: boolean;
  processingQueue: string[];
}

const ProcessingStatus = ({ isSearching, isProcessing, processingQueue }: ProcessingStatusProps) => {
  if (!isSearching && !isProcessing) {
    return null;
  }

  return (
    <div className="text-center py-8">
      <LoadingSpinner size={32} />
      <p className="mt-4 text-muted-foreground">
        {isProcessing 
          ? `Processing artist ${processingQueue[0]}... (${processingQueue.length} remaining)` 
          : 'Searching...'}
      </p>
    </div>
  );
};

export default ProcessingStatus;
