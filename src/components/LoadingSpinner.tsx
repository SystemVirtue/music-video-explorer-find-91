
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner = ({ size = 24, className = "" }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 
        className={`animate-spin text-music ${className}`} 
        size={size} 
      />
      <p className="mt-2 text-muted-foreground">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
