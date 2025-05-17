
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractArtistsFromPlaylist } from "@/services/fileManager";
import { useToast } from "@/components/ui/use-toast";
import { List, Home } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

// YouTube API Key (for demo purposes only - in a production app, this would be handled securely)
const YOUTUBE_API_KEY = "AIzaSyC12QKbzGaKZw9VD3-ulxU_mrd0htZBiI4";

interface PlaylistExtractorProps {
  onExtract: (artists: string[]) => void;
  onCancel: () => void;
  onGoHome?: () => void;
}

const PlaylistExtractor = ({ onExtract, onCancel, onGoHome }: PlaylistExtractorProps) => {
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
      // Extract playlist ID from URL if needed
      const playlistId = extractPlaylistId(playlistUrl);
      
      if (!playlistId) {
        throw new Error("Invalid YouTube playlist URL or ID");
      }
      
      // In a real implementation, we would use the YouTube API here
      // For now, we'll use the mock extraction function
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
  
  // Helper function to extract playlist ID from various YouTube URL formats
  const extractPlaylistId = (url: string): string | null => {
    // Direct playlist ID
    if (url.match(/^PL[a-zA-Z0-9_-]{16,}$/)) {
      return url;
    }
    
    // URL formats
    const regex = /(?:list=)([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Extract Artists from Playlist</h2>
        <div className="flex gap-2">
          {onGoHome && (
            <Button 
              variant="outline" 
              onClick={onGoHome} 
              className="flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
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
          <strong>Note:</strong> This functionality currently demonstrates the UI flow but requires the YouTube API to actually extract data from playlists.
        </p>
      </div>
    </div>
  );
};

export default PlaylistExtractor;
