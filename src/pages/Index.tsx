
import { useState } from "react";
import { Artist, MusicVideo, searchArtist, getMusicVideos } from "@/services/musicApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import VideoResults from "@/components/VideoResults";
import { Search } from "lucide-react";

const Index = () => {
  const [artistName, setArtistName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [videos, setVideos] = useState<MusicVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!artistName.trim()) {
      toast({
        title: "Please enter an artist name",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setError(null);
    setCurrentArtist(null);
    setVideos([]);
    
    try {
      console.log(`Searching for artist: "${artistName}"`);
      // Step 1: Search for the artist in MusicBrainz
      const artist = await searchArtist(artistName);
      
      if (!artist) {
        setError(`No artist found with the name "${artistName}"`);
        toast({
          title: "Artist not found",
          description: `We couldn't find any artist with the name "${artistName}"`,
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }
      
      console.log(`Artist found: ${artist.name} (ID: ${artist.id})`);
      setCurrentArtist(artist);
      
      try {
        // Step 2: Get videos from AudioDB using the MusicBrainz ID
        const fetchedVideos = await getMusicVideos(artist.id);
        setVideos(fetchedVideos);
        
        if (fetchedVideos.length === 0) {
          console.log(`No videos found for artist: ${artist.name}`);
          toast({
            title: "No music videos found",
            description: `We couldn't find any music videos for ${artist.name}`,
          });
        } else {
          console.log(`Found ${fetchedVideos.length} videos for artist: ${artist.name}`);
          toast({
            title: "Search successful",
            description: `Found ${fetchedVideos.length} music videos for ${artist.name}`,
          });
        }
      } catch (audioDbError) {
        console.error("AudioDB error:", audioDbError);
        // Still show artist, but inform about video fetch failure
        toast({
          title: "Videos not available",
          description: `Found artist "${artist.name}" but couldn't load videos. AudioDB service may be down.`,
          variant: "destructive",
        });
        setError("Could not retrieve music videos. The AudioDB service may be unavailable.");
      }
    } catch (error) {
      console.error("Search error:", error);
      let errorMessage = "An error occurred while searching. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      setError(errorMessage);
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero section */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-music-gradient">
            Music Video Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Search for music videos by your favorite artists using MusicBrainz and AudioDB
          </p>
        </div>
        
        {/* Search form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Enter artist or band name..."
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="pr-10 bg-muted border-muted focus:border-music"
                disabled={isSearching}
                aria-label="Artist name"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSearching} 
              className="bg-music hover:bg-music-hover min-w-[100px]"
            >
              {isSearching ? (
                <LoadingSpinner size={16} className="mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </form>
        </div>
        
        {/* Display error if any */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 border border-destructive/50 bg-destructive/10 rounded-md text-center">
            {error}
          </div>
        )}
        
        {/* Display loading state */}
        {isSearching && <LoadingSpinner size={32} />}
        
        {/* Display results */}
        {!isSearching && currentArtist && (
          <VideoResults artist={currentArtist} videos={videos} />
        )}
        
        <footer className="text-center text-muted-foreground text-sm mt-12 pb-6">
          <p>
            Powered by MusicBrainz and TheAudioDB. Created with Lovable.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
