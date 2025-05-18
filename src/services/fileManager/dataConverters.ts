
import { ArtistDataFile, VideoDataFile, LegacyVideoDataFile } from './types';
import { extractYouTubeVideoId } from './utils';
import { generateArtistDataFromVideos } from './dataGenerators';

/**
 * Convert legacy data format to new normalized format
 */
export const convertLegacyDataToNewFormat = (legacyData: LegacyVideoDataFile): { artistData: ArtistDataFile, videoData: VideoDataFile } => {
  const videoData: VideoDataFile = { videos: [] };
  
  // First, convert legacy MusicVideo objects to VideoDataEntry objects
  legacyData.videos.forEach(video => {
    const youtubeId = extractYouTubeVideoId(video.strMusicVid);
    
    if (youtubeId) {
      videoData.videos.push({
        strArtist: video.strArtist || "", // Add the strArtist field
        artistADID: video.idArtist,
        artistMBID: "", // Legacy data might not have this, will be updated later
        songADID: video.idTrack,
        songTitle: video.strTrack,
        videoURL: video.strMusicVid,
        thumbnailYTID: youtubeId
      });
    }
  });
  
  // Map legacy artists to artistMBIDs
  const mbidMap = new Map<string, string>();
  legacyData.artists.forEach(artist => {
    mbidMap.set(artist.name, artist.id); // Map artist name to MBID
  });
  
  // Update artistMBID in videos based on artist name
  videoData.videos.forEach(video => {
    // Find the matching artist in legacy data
    const matchingArtist = legacyData.artists.find(artist => 
      legacyData.videos.some(v => 
        v.idArtist === video.artistADID && v.strArtist === artist.name
      )
    );
    
    if (matchingArtist) {
      video.artistMBID = matchingArtist.id;
    }
  });
  
  // Generate artist data based on videos
  const artistData = generateArtistDataFromVideos(videoData);
  
  return { artistData, videoData };
};
