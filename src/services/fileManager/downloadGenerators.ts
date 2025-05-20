
import { generateDownloads } from './dataGenerators';
import { getVideoData } from './storage';
import { extractYoutubeId } from '@/services/musicApi';

/**
 * Generate downloadable JSON for current artist data
 */
export const generateArtistDataJsonDownload = (): string => {
  return generateDownloads.artistData();
};

/**
 * Generate downloadable JSON for current video data
 */
export const generateVideoDataJsonDownload = (): string => {
  return generateDownloads.videoData();
};

/**
 * Generate downloadable JSON for combined data (for backward compatibility)
 */
export const generateCombinedDataJsonDownload = (): string => {
  return generateDownloads.combinedData();
};

/**
 * Generate downloadable JSON in legacy V2 format for Obie.Bar.v2 compatibility
 */
export const generateLegacyV2JsonDownload = (): string => {
  const { artistData, videoData } = getVideoData();
  
  // Transform data to legacy V2 format
  const legacyData = artistData.artists.map(artist => {
    // Find videos for this artist
    const artistVideos = videoData.videos.filter(
      video => video.artistADID === artist.artistADID
    );
    
    // Transform videos to legacy format
    const musicVideos = artistVideos.map(video => {
      // Generate YouTube URL from ID if available
      const youtubeUrl = video.thumbnailYTID ? 
        `https://www.youtube.com/watch?v=${video.thumbnailYTID}` : 
        video.videoURL;
      
      // Generate thumbnail URL from ID
      const trackThumb = video.thumbnailYTID ? 
        `https://img.youtube.com/vi/${video.thumbnailYTID}/default.jpg` : 
        null;
      
      return {
        title: video.songTitle,
        youtube_url: youtubeUrl,
        track_thumb: trackThumb
      };
    });
    
    return {
      artist_name: artist.artistName || artist.strArtist || `Artist (${artist.artistADID.substring(0, 8)}...)`,
      mbid: artist.artistMBID,
      music_videos: musicVideos
    };
  });
  
  const jsonString = JSON.stringify(legacyData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(blob);
};
