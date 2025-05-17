
import { ArtistDataFile, VideoDataFile, LegacyVideoDataFile } from './types';
import { convertLegacyDataToNewFormat } from './dataConverters';

/**
 * Initialize empty data files
 */
export const initializeVideoData = (): { artistData: ArtistDataFile, videoData: VideoDataFile } => {
  return {
    artistData: { artists: [] },
    videoData: { videos: [] }
  };
};

/**
 * Get current video and artist data or initialize if empty
 */
export const getVideoData = (): { artistData: ArtistDataFile, videoData: VideoDataFile } => {
  const artistDataString = localStorage.getItem('ARTIST_DATA_JSON');
  const videoDataString = localStorage.getItem('VIDEO_DATA_JSON');
  
  let artistData: ArtistDataFile = { artists: [] };
  let videoData: VideoDataFile = { videos: [] };
  
  // Try to parse stored artist data
  if (artistDataString) {
    try {
      artistData = JSON.parse(artistDataString);
    } catch (e) {
      console.error('Error parsing artist data from localStorage:', e);
      artistData = { artists: [] };
    }
  }
  
  // Try to parse stored video data
  if (videoDataString) {
    try {
      videoData = JSON.parse(videoDataString);
    } catch (e) {
      console.error('Error parsing video data from localStorage:', e);
      videoData = { videos: [] };
    }
  }
  
  // If no data exists yet, check for legacy data
  if (!artistDataString && !videoDataString) {
    const legacyDataString = localStorage.getItem('Video_Data_JSON');
    if (legacyDataString) {
      try {
        const legacyData: LegacyVideoDataFile = JSON.parse(legacyDataString);
        // Convert legacy data to new format
        return convertLegacyDataToNewFormat(legacyData);
      } catch (e) {
        console.error('Error parsing legacy data from localStorage:', e);
      }
    }
  }
  
  return { artistData, videoData };
};

/**
 * Save video and artist data to localStorage
 */
export const saveVideoData = (artistData: ArtistDataFile, videoData: VideoDataFile): void => {
  localStorage.setItem('ARTIST_DATA_JSON', JSON.stringify(artistData));
  localStorage.setItem('VIDEO_DATA_JSON', JSON.stringify(videoData));
};

/**
 * Utility function to get artist and video counts
 */
export const getCollectionStats = (): { artistCount: number, videoCount: number } => {
  const { artistData, videoData } = getVideoData();
  return {
    artistCount: artistData.artists.length,
    videoCount: videoData.videos.length
  };
};
