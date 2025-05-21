import { Artist, MusicVideo, getArtistDetails } from "@/services/musicApi";
import { ArtistDataFile, VideoDataFile, ArtistDataEntry } from './types';
import { extractYouTubeVideoId } from './utils';
import { getVideoData, saveVideoData } from './storage';
import { generateArtistDataFromVideos } from './dataGenerators';

/**
 * Add new search results to video and artist data
 */
export const addSearchResultsToVideoData = (artist: Artist, videos: MusicVideo[]): { artistData: ArtistDataFile, videoData: VideoDataFile } => {
  const { artistData, videoData } = getVideoData();
  
  // Process videos first
  videos.forEach(video => {
    const youtubeId = extractYouTubeVideoId(video.strMusicVid);
    
    if (!youtubeId) return; // Skip videos without valid YouTube URLs
    
    // Check if this video already exists
    const existingVideoIndex = videoData.videos.findIndex(v => v.songADID === video.idTrack);
    
    if (existingVideoIndex === -1) {
      // Add new video
      videoData.videos.push({
        strArtist: video.strArtist || artist.name || "", // Add the strArtist field
        artistADID: video.idArtist,
        artistMBID: artist.id, // Use the artist's MusicBrainz ID
        songADID: video.idTrack,
        songTitle: video.strTrack,
        videoURL: video.strMusicVid,
        thumbnailYTID: youtubeId
      });
    }
  });
  
  // Update or create artist entry
  const existingArtistIndex = artistData.artists.findIndex(a => a.artistADID === videos[0]?.idArtist);
  
  if (existingArtistIndex === -1 && videos.length > 0) {
    // Get all videos for this artist
    const artistVideos = videoData.videos.filter(v => v.artistADID === videos[0].idArtist);
    
    // Add new artist with name
    artistData.artists.push({
      artistMBID: artist.id,
      artistADID: videos[0].idArtist,
      artistName: artist.name, // Add the artist name
      strArtist: artist.name || videos[0].strArtist || "", // Add the strArtist field
      artistVideoCount: artistVideos.length,
      strArtistThumb: "", // Update from artistThumb
      strArtistBanner: "", // Update from banner
      strArtistLogo: "", // Update from logo
      strArtistWideThumb: "", // Update from thumbnail
      strGenre: "", // Update from genre
      strMood: "", // Update from mood
      strStyle: "" // Update from style
    });
  } else if (videos.length > 0) {
    // Update existing artist's video count
    const artistVideos = videoData.videos.filter(v => v.artistADID === videos[0].idArtist);
    artistData.artists[existingArtistIndex].artistVideoCount = artistVideos.length;
    // Ensure artist name is set
    if (!artistData.artists[existingArtistIndex].artistName) {
      artistData.artists[existingArtistIndex].artistName = artist.name;
    }
    // Ensure strArtist is set
    if (!artistData.artists[existingArtistIndex].strArtist) {
      artistData.artists[existingArtistIndex].strArtist = artist.name || videos[0].strArtist || "";
    }
  }
  
  // Save updated data
  saveVideoData(artistData, videoData);
  
  return { artistData, videoData };
};

/**
 * Delete artists and their associated videos
 */
export const deleteArtists = (artistADIDs: string[]): { artistData: ArtistDataFile, videoData: VideoDataFile } => {
  const { artistData, videoData } = getVideoData();
  
  // Remove selected artists
  artistData.artists = artistData.artists.filter(
    artist => !artistADIDs.includes(artist.artistADID)
  );
  
  // Remove videos belonging to those artists
  videoData.videos = videoData.videos.filter(
    video => !artistADIDs.includes(video.artistADID)
  );
  
  // Save updated data
  saveVideoData(artistData, videoData);
  
  return { artistData, videoData };
};

/**
 * Enrich a single artist's data with details from AudioDB
 */
export const enrichArtistData = async (artistADID: string): Promise<ArtistDataEntry | null> => {
  const { artistData, videoData } = getVideoData();
  const artistIndex = artistData.artists.findIndex(a => a.artistADID === artistADID);
  
  if (artistIndex === -1) return null;
  
  try {
    const artistDetails = await getArtistDetails(artistADID);
    if (!artistDetails) return null;
    
    // Update artist data with new fields
    const updatedArtist = {
      ...artistData.artists[artistIndex],
      strArtistThumb: artistDetails.strArtistThumb || artistData.artists[artistIndex].strArtistThumb || '',
      strArtistBanner: artistDetails.strArtistBanner || artistData.artists[artistIndex].strArtistBanner || '',
      strArtistLogo: artistDetails.strArtistLogo || artistData.artists[artistIndex].strArtistLogo || '',
      strArtistWideThumb: artistDetails.strArtistWideThumb || artistData.artists[artistIndex].strArtistWideThumb || '',
      strGenre: artistDetails.strGenre || artistData.artists[artistIndex].strGenre || '',
      strMood: artistDetails.strMood || artistData.artists[artistIndex].strMood || '',
      strStyle: artistDetails.strStyle || artistData.artists[artistIndex].strStyle || ''
    };
    
    // Update in the array
    artistData.artists[artistIndex] = updatedArtist;
    
    // Save updated data
    saveVideoData(artistData, videoData);
    
    return updatedArtist;
  } catch (error) {
    console.error(`Error enriching artist data for ${artistADID}:`, error);
    return null;
  }
};

/**
 * Enrich all artists' data in batches (respecting rate limits)
 */
export const enrichAllArtistData = async (
  onProgress?: (current: number, total: number, success: number, failed: number) => void
): Promise<{ success: number; failed: number }> => {
  const { artistData } = getVideoData();
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < artistData.artists.length; i++) {
    const artist = artistData.artists[i];
    
    // Update progress callback
    if (onProgress) {
      onProgress(i + 1, artistData.artists.length, success, failed);
    }
    
    try {
      // Add rate limiting - wait 500ms between calls to respect 2 calls/second limit
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const result = await enrichArtistData(artist.artistADID);
      if (result) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
    
    // Update progress callback again after attempt
    if (onProgress) {
      onProgress(i + 1, artistData.artists.length, success, failed);
    }
  }
  
  return { success, failed };
};
