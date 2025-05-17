
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractArtistsFromPlaylist } from "@/services/fileManager";
import { useToast } from "@/components/ui/use-toast";
import { List } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface PlaylistExtractorProps {
  onExtract: (artists: string[]) => void;
  onCancel: () => void;
}

const PlaylistExtractor = ({ onExtract, onCancel }: PlaylistExtractorProps) => {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playlistUrl.trim()) {
      toast({
        title: "Please enter a YouTube playlist URL or ID",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    
    try {
      const artistNames = await extractArtistsFromPlaylist(playlistUrl);
      
      if (artistNames.length === 0) {
        toast({
          title: "No artists found",
          description: "Could not extract any artists from the provided playlist",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Artists extracted",
          description: `Extracted ${artistNames.length} artists from playlist`,
        });
        onExtract(artistNames);
      }
    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Failed to extract artists from playlist",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Extract Artists from Playlist</h2>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
      
      <form onSubmit={handleExtract} className="space-y-4">
        <div>
          <label htmlFor="playlist-url" className="block text-sm font-medium mb-2">
            YouTube Playlist URL or ID
          </label>
          <Input
            id="playlist-url"
            type="text"
            placeholder="https://www.youtube.com/playlist?list=PLxxxxxx or PLxxxxxx"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            className="bg-muted border-muted focus:border-music"
            disabled={isExtracting}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isExtracting} 
          className="bg-music hover:bg-music-hover w-full"
        >
          {isExtracting ? (
            <>
              <LoadingSpinner size={16} className="mr-2" />
              Extracting...
            </>
          ) : (
            <>
              <List className="h-4 w-4 mr-2" />
              Extract Artists
            </>
          )}
        </Button>
      </form>
      
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> This functionality currently demonstrates the UI flow but requires YouTube API integration for actual data extraction.
        </p>
      </div>
    </div>
  );
};

export default PlaylistExtractor;
