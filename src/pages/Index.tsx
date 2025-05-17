
import { useState, useEffect } from "react";
import { Artist, MusicVideo, searchArtist, getMusicVideos } from "@/services/musicApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import VideoResults from "@/components/VideoResults";
import { Search, Download } from "lucide-react";
import TaskSelector, { Task } from "@/components/TaskSelector";
import PlaylistExtractor from "@/components/tasks/PlaylistExtractor";
import JsonImporter from "@/components/tasks/JsonImporter";
import TextFileUploader from "@/components/tasks/TextFileUploader";
import { 
  getVideoData, 
  initializeVideoData, 
  addSearchResultsToVideoData, 
  VideoDataFile,
  generateVideoDataJsonDownload 
} from "@/services/fileManager";

const Index = () => {
  const [artistName, setArtistName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [videos, setVideos] = useState<MusicVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoDataFile>(initializeVideoData());
  const [selectedTask, setSelectedTask] = useState<Task>(null);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  // Initialize video data on component mount
  useEffect(() => {
    const data = getVideoData();
    setVideoData(data);
  }, []);

  // Process queue of artist names
  useEffect(() => {
    const processNextArtist = async () => {
      if (processingQueue.length === 0 || isProcessing) {
        return;
      }
      
      setIsProcessing(true);
      const nextArtist = processingQueue[0];
      
      try {
        await searchAndProcessArtist(nextArtist);
        // Remove processed artist from queue
        setProcessingQueue(prev => prev.slice(1));
      } catch (error) {
        console.error(`Error processing artist "${nextArtist}":`, error);
        // Still remove from queue to continue with next
        setProcessingQueue(prev => prev.slice(1));
        toast({
          title: `Failed to process "${nextArtist}"`,
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    processNextArtist();
  }, [processingQueue, isProcessing]);

  const searchAndProcessArtist = async (name: string): Promise<void> => {
    toast({
      title: "Processing artist",
      description: `Searching for "${name}"...`,
    });
    
    try {
      // Step 1: Search for artist in MusicBrainz
      const artist = await searchArtist(name);
      
      if (!artist) {
        toast({
          title: "Artist not found",
          description: `Could not find artist "${name}"`,
          variant: "destructive",
        });
        return;
      }
      
      // Step 2: Get music videos from AudioDB
      try {
        const fetchedVideos = await getMusicVideos(artist.id);
        
        // Step 3: Add to video data file
        const updatedData = addSearchResultsToVideoData(artist, fetchedVideos);
        setVideoData(updatedData);
        
        toast({
          title: "Search successful",
          description: `Found ${fetchedVideos.length} music videos for ${artist.name}`,
        });
        
        // Update current display
        setCurrentArtist(artist);
        setVideos(fetchedVideos);
      } catch (videoError) {
        console.error("Video fetch error:", videoError);
        
        // Still add artist to data, but with empty videos
        const updatedData = addSearchResultsToVideoData(artist, []);
        setVideoData(updatedData);
        
        toast({
          title: "Videos not available",
          description: `Found artist "${artist.name}" but couldn't load videos`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  };

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
      await searchAndProcessArtist(artistName);
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
  
  const handleExtractArtists = (artists: string[]) => {
    if (artists.length === 0) return;
    
    // Add artists to processing queue
    setProcessingQueue(prev => [...prev, ...artists]);
    setSelectedTask(null);
    
    toast({
      title: "Processing started",
      description: `Added ${artists.length} artists to processing queue`,
    });
  };
  
  const handleImportComplete = () => {
    // Refresh video data
    const updatedData = getVideoData();
    setVideoData(updatedData);
    setSelectedTask(null);
    
    toast({
      title: "Import complete",
      description: "Data has been imported and combined with existing data",
    });
  };
  
  const handleDownload = () => {
    try {
      const jsonUrl = generateVideoDataJsonDownload();
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = `music_videos_collection.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(jsonUrl), 100);
      
      toast({
        title: "Download started",
        description: "Your JSON file is being downloaded",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was an error generating your download",
        variant: "destructive",
      });
    }
  };

  const renderTaskComponent = () => {
    switch (selectedTask) {
      case 'search':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Search for an Artist</h2>
              <Button variant="ghost" onClick={() => setSelectedTask(null)}>Cancel</Button>
            </div>
            
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
        );
      case 'playlist':
        return <PlaylistExtractor onExtract={handleExtractArtists} onCancel={() => setSelectedTask(null)} />;
      case 'json':
        return <JsonImporter onImport={handleImportComplete} onCancel={() => setSelectedTask(null)} />;
      case 'txt':
        return <TextFileUploader onUpload={handleExtractArtists} onCancel={() => setSelectedTask(null)} />;
      default:
        return null;
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
        
        {/* Task selector or currently selected task */}
        {selectedTask === null ? (
          <TaskSelector videoData={videoData} onTaskSelect={setSelectedTask} />
        ) : (
          renderTaskComponent()
        )}
        
        {/* Display error if any */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 border border-destructive/50 bg-destructive/10 rounded-md text-center">
            {error}
          </div>
        )}
        
        {/* Display loading state */}
        {(isSearching || isProcessing) && (
          <div className="text-center py-8">
            <LoadingSpinner size={32} />
            <p className="mt-4 text-muted-foreground">
              {isProcessing 
                ? `Processing artist ${processingQueue[0]}... (${processingQueue.length} remaining)` 
                : 'Searching...'}
            </p>
          </div>
        )}
        
        {/* Display current results */}
        {!isSearching && currentArtist && (
          <VideoResults artist={currentArtist} videos={videos} />
        )}
        
        {/* Download JSON button */}
        {videoData.artistCount > 0 && !selectedTask && (
          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleDownload} 
              className="bg-music hover:bg-music-hover"
            >
              <Download className="mr-2 h-4 w-4" />
              Download All Data ({videoData.artistCount} artists, {videoData.videoCount} videos)
            </Button>
          </div>
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
