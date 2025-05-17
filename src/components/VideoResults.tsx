
import { Artist, MusicVideo } from "@/services/musicApi";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateVideoDataJsonDownload, generateArtistDataJsonDownload, generateCombinedDataJsonDownload } from "@/services/fileManager";

interface VideoResultsProps {
  artist: Artist;
  videos: MusicVideo[];
}

const VideoResults = ({ artist, videos }: VideoResultsProps) => {
  const { toast } = useToast();
  
  const handleCombinedDownload = () => {
    try {
      const jsonUrl = generateCombinedDataJsonDownload();
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = `${artist.name.replace(/\s+/g, '_')}_combined_data.json`;
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

  const handleDownloadArtistData = () => {
    try {
      const jsonUrl = generateArtistDataJsonDownload();
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = `ARTIST_DATA.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(jsonUrl), 100);
      
      toast({
        title: "Artist data download started",
        description: "Your ARTIST_DATA.json file is being downloaded",
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

  const handleDownloadVideoData = () => {
    try {
      const jsonUrl = generateVideoDataJsonDownload();
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = `VIDEO_DATA.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(jsonUrl), 100);
      
      toast({
        title: "Video data download started",
        description: "Your VIDEO_DATA.json file is being downloaded",
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
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleDownloadArtistData} 
            className="bg-music hover:bg-music-hover"
          >
            <Download className="mr-2 h-4 w-4" />
            ARTIST_DATA.json
          </Button>
          <Button 
            onClick={handleDownloadVideoData} 
            className="bg-music hover:bg-music-hover"
          >
            <Download className="mr-2 h-4 w-4" />
            VIDEO_DATA.json
          </Button>
          <Button 
            onClick={handleCombinedDownload} 
            className="bg-music hover:bg-music-hover"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Combined JSON
          </Button>
        </div>
      </div>
      
      {videos.length > 0 ? (
        <div className="space-y-2">
          {videos.map((video) => (
            <div key={video.idTrack} className="border p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{video.strTrack}</h3>
              <p className="text-muted-foreground">{video.strArtist}</p>
              {video.strMusicVid && (
                <div className="mt-2">
                  <a 
                    href={video.strMusicVid} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-music hover:underline text-sm"
                  >
                    Watch on YouTube
                  </a>
                </div>
              )}
            </div>
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
