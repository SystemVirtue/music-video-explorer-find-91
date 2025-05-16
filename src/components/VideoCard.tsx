
import { useState } from "react";
import { MusicVideo, extractYoutubeId, getYoutubeThumbnail } from "@/services/musicApi";

interface VideoCardProps {
  video: MusicVideo;
}

const VideoCard = ({ video }: VideoCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const youtubeId = extractYoutubeId(video.strMusicVid);
  let thumbnailUrl = video.strTrackThumb || getYoutubeThumbnail(youtubeId);
  
  // If there's an error loading the image, use YouTube thumbnail
  if (imageError && youtubeId) {
    thumbnailUrl = getYoutubeThumbnail(youtubeId);
  }

  const youtubeUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : video.strMusicVid;

  return (
    <div className="music-card">
      <a 
        href={youtubeUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-video w-full">
          <img
            src={thumbnailUrl}
            alt={`${video.strTrack} by ${video.strArtist}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              {/* Triangle play icon */}
              <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[16px] border-l-music ml-1.5"></div>
            </div>
          </div>
        </div>
      </a>
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{video.strTrack}</h3>
        <p className="text-muted-foreground">{video.strArtist}</p>
      </div>
    </div>
  );
};

export default VideoCard;
