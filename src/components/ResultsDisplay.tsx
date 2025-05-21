
import React from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import VideoResults from "@/components/VideoResults";
import { Artist, MusicVideo } from "@/services/music";

interface ResultsDisplayProps {
  currentArtist: Artist | null;
  videos: MusicVideo[];
  onGoHome: () => void;
  isSearching: boolean;
}

const ResultsDisplay = ({ currentArtist, videos, onGoHome, isSearching }: ResultsDisplayProps) => {
  if (isSearching || !currentArtist) {
    return null;
  }

  return (
    <div className="space-y-6">
      <VideoResults artist={currentArtist} videos={videos} />
      
      <div className="flex justify-center mt-4">
        <Button 
          onClick={onGoHome} 
          variant="outline" 
          className="flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
