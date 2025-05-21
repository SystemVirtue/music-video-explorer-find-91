
import { useState, useEffect } from "react";
import { 
  ArtistDataFile, 
  VideoDataFile, 
  getVideoData,
  addSearchResultsToVideoData,
  initializeVideoData,
  deleteArtists
} from "@/services/fileManager";
import { Artist, MusicVideo, searchArtist, getMusicVideos } from "@/services/music";
import { useToast } from "@/components/ui/use-toast";

export function useVideoCollection() {
  const [artistData, setArtistData] = useState<ArtistDataFile>({ artists: [] });
  const [videoData, setVideoData] = useState<VideoDataFile>({ videos: [] });
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [videos, setVideos] = useState<MusicVideo[]>([]);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize video data on component mount
  useEffect(() => {
    const data = getVideoData();
    setArtistData(data.artistData);
    setVideoData(data.videoData);
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
      
      console.log("Found artist:", artist);
      
      // Step 2: Get music videos from AudioDB
      try {
        const fetchedVideos = await getMusicVideos(artist.id);
        
        console.log("Fetched videos:", fetchedVideos);
        
        if (fetchedVideos.length === 0) {
          console.log("No videos found for this artist");
          toast({
            title: "No videos found",
            description: `No music videos found for ${artist.name}`,
          });
        }
        
        // Step 3: Add to video data file
        const updatedData = addSearchResultsToVideoData(artist, fetchedVideos);
        setArtistData(updatedData.artistData);
        setVideoData(updatedData.videoData);
        
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
        setArtistData(updatedData.artistData);
        setVideoData(updatedData.videoData);
        
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

  const handleExtractArtists = (artists: string[]) => {
    if (artists.length === 0) return;
    
    // Add artists to processing queue
    setProcessingQueue(prev => [...prev, ...artists]);
    
    toast({
      title: "Processing started",
      description: `Added ${artists.length} artists to processing queue`,
    });
  };

  const handleReset = () => {
    // Reset the collection to empty
    const emptyData = initializeVideoData();
    setArtistData(emptyData.artistData);
    setVideoData(emptyData.videoData);
    localStorage.removeItem('ARTIST_DATA_JSON');
    localStorage.removeItem('VIDEO_DATA_JSON');
    localStorage.removeItem('Video_Data_JSON');
    
    // Reset UI state
    setCurrentArtist(null);
    setVideos([]);
    setError(null);
    
    toast({
      title: "Collection Reset",
      description: "All data has been cleared from the collection",
    });
  };

  const handleDeleteArtists = (artistADIDs: string[]) => {
    // Remove selected artists and their videos from the collection
    const updatedData = deleteArtists(artistADIDs);
    
    // Update state with new data
    setArtistData(updatedData.artistData);
    setVideoData(updatedData.videoData);
  };

  const refreshCollectionData = () => {
    // Update the data to ensure counts are current
    const updatedData = getVideoData();
    setArtistData(updatedData.artistData);
    setVideoData(updatedData.videoData);
  };

  return {
    artistData,
    videoData,
    currentArtist,
    videos,
    processingQueue,
    isProcessing,
    error,
    setError,
    setCurrentArtist,
    setVideos,
    searchAndProcessArtist,
    handleExtractArtists,
    handleReset,
    handleDeleteArtists,
    refreshCollectionData,
  };
}
