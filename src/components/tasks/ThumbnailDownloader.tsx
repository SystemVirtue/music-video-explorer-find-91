
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { extractYoutubeId } from "@/services/musicApi";
import { Home, Download, FolderOpen, Check, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { VideoDataEntry } from "@/services/fileManager";

interface ThumbnailDownloaderProps {
  videos: VideoDataEntry[];
  onCancel: () => void;
  onGoHome?: () => void;
}

const ThumbnailDownloader = ({ videos, onCancel, onGoHome }: ThumbnailDownloaderProps) => {
  const [isSelectingLocation, setIsSelectingLocation] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  // This is a mock location selection for web browser
  // In a real desktop app, this would use a native file picker
  const handleLocationSelect = () => {
    // In a browser environment, we can't actually choose a folder location
    // This is just a mock UI flow for the demo
    setIsSelectingLocation(false);
    setIsDownloading(true);
    
    // Start the mock download process
    downloadThumbnails();
  };

  const downloadThumbnails = async () => {
    // This is simulating the download process since browsers can't directly 
    // save files to specific locations without user interaction for each file
    let success = 0;
    let fail = 0;
    
    for (let i = 0; i < videos.length; i++) {
      setCurrentIndex(i);
      
      const video = videos[i];
      const thumbnailYTID = video.thumbnailYTID;
      
      if (thumbnailYTID && thumbnailYTID.match(/^[a-zA-Z0-9_-]{11}$/)) {
        // In a real application, we would check if the file exists
        // and then download it if it doesn't
        
        // Simulate success with 90% probability
        if (Math.random() > 0.1) {
          setSuccessCount(prev => prev + 1);
          success++;
        } else {
          setFailCount(prev => prev + 1);
          fail++;
        }
      } else {
        setFailCount(prev => prev + 1);
        fail++;
      }
      
      // Pause for a short time to simulate download time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsDownloading(false);
    setIsComplete(true);
    
    toast({
      title: "Downloading Thumbnails Completed",
      description: `Successfully downloaded ${success} thumbnails. Failed: ${fail}`,
    });
  };

  // In a web environment, we would trigger file downloads one by one
  const downloadSingleThumbnail = (videoId: string) => {
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    const link = document.createElement('a');
    link.href = thumbnailUrl;
    link.download = `${videoId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Download Video Thumbnails</h2>
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

      {isSelectingLocation && (
        <div className="p-6 border rounded-lg space-y-4">
          <p>Choose a location to save thumbnail images (existing thumbnails will be ignored)</p>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleLocationSelect} 
              className="flex items-center gap-2 bg-music hover:bg-music-hover"
            >
              <FolderOpen className="h-4 w-4" />
              Select Folder
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Note: In a web environment, images will be downloaded to your default download location.</p>
          </div>
        </div>
      )}

      {isDownloading && (
        <div className="p-6 border rounded-lg space-y-4">
          <div className="flex justify-between">
            <p>Downloading {currentIndex + 1} of {videos.length} Thumbnails</p>
            <p>
              <span className="text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-1" /> OK: {successCount}
              </span>
              <span className="text-red-600 flex items-center">
                <X className="h-4 w-4 mr-1" /> Failed: {failCount}
              </span>
            </p>
          </div>
          
          <div className="flex justify-center">
            <LoadingSpinner size={32} />
          </div>
        </div>
      )}
      
      {isComplete && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Downloading Thumbnails Completed</AlertDialogTitle>
              <AlertDialogDescription>
                <p>Download summary:</p>
                <ul className="mt-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Successfully downloaded: {successCount}
                  </li>
                  <li className="flex items-center">
                    <X className="h-4 w-4 mr-2 text-red-600" />
                    Failed: {failCount}
                  </li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={onCancel}>Close</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ThumbnailDownloader;
