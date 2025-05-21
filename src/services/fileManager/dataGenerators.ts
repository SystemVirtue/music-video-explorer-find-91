
import { ArtistDataFile, VideoDataFile, ArtistDataEntry, VideoDataEntry } from './types';
import { extractYouTubeVideoId } from './utils';
import { getVideoData } from './storage';

/**
 * Generate artist data based on video data
 */
export const generateArtistDataFromVideos = (videoData: VideoDataFile): ArtistDataFile => {
  const artistMap = new Map<string, ArtistDataEntry>();
  
  videoData.videos.forEach(video => {
    if (!artistMap.has(video.artistADID)) {
      // Try to extract artist name from song title
      let artistName = "";
      const titleParts = video.songTitle.split(' - ');
      if (titleParts.length > 1) {
        artistName = titleParts[0].trim();
      } else {
        artistName = `Artist (ID: ${video.artistADID.substring(0, 8)}...)`;
      }
      
      artistMap.set(video.artistADID, {
        artistMBID: video.artistMBID,
        artistADID: video.artistADID,
        artistName: artistName,
        strArtist: video.strArtist || artistName,
        artistVideoCount: 1,
        strArtistThumb: video.thumbnailYTID,
        strArtistBanner: '',
        strArtistLogo: '',
        strArtistWideThumb: '',
        strGenre: '',
        strMood: '',
        strStyle: ''
      });
    } else {
      const artist = artistMap.get(video.artistADID)!;
      artist.artistVideoCount += 1;
      // Update strArtist if it's not set yet but exists in the video
      if (!artist.strArtist && video.strArtist) {
        artist.strArtist = video.strArtist;
      }
    }
  });
  
  return {
    artists: Array.from(artistMap.values())
  };
};

/**
 * Generate downloadable JSON for the search results
 */
export const generateDownloads = {
  /**
   * Generate downloadable JSON for current artist data
   */
  artistData: (): string => {
    const { artistData } = getVideoData();
    const jsonString = JSON.stringify(artistData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    return URL.createObjectURL(blob);
  },

  /**
   * Generate downloadable JSON for current video data
   */
  videoData: (): string => {
    const { videoData } = getVideoData();
    const jsonString = JSON.stringify(videoData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    return URL.createObjectURL(blob);
  },

  /**
   * Generate downloadable JSON for combined data (for backward compatibility)
   */
  combinedData: (): string => {
    const { artistData, videoData } = getVideoData();
    
    const combinedData = {
      artistData,
      videoData,
      timestamp: new Date().toISOString(),
      artistCount: artistData.artists.length,
      videoCount: videoData.videos.length
    };
    
    const jsonString = JSON.stringify(combinedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }
};
