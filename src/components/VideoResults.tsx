
import { Artist, MusicVideo, generateJsonDownload } from "@/services/musicApi";
import { Button } from "@/components/ui/button";
import VideoCard from "./VideoCard";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VideoResultsProps {
  artist: Artist;
  videos: MusicVideo[];
}

const VideoResults = ({ artist, videos }: VideoResultsProps) => {
  const { toast } = useToast();
  
  const handleDownload = () => {
    try {
      const jsonUrl = generateJsonDownload(artist, videos);
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = `${artist.name.replace(/\s+/g, '_')}_music_videos.json`;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{artist.name}</h2>
          <p className="text-muted-foreground">
            Found {videos.length} music video{videos.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button 
          onClick={handleDownload} 
          className="bg-music hover:bg-music-hover"
        >
          <Download className="mr-2 h-4 w-4" />
          Download JSON
        </Button>
      </div>
      
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.idTrack} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p>No music videos found for this artist</p>
        </div>
      )}
    </div>
  );
};

export default VideoResults;
