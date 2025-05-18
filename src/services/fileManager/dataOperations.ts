
import { Artist, MusicVideo } from "@/services/musicApi";
import { ArtistDataFile, VideoDataFile } from './types';
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
      artistThumb: artistVideos.length > 0 ? artistVideos[0].thumbnailYTID : "",
      banner: "", // Add default value for banner
      logo: "", // Add default value for logo
      thumbnail: "", // Add default value for thumbnail
      genre: "", // Add default value for genre
      mood: "", // Add default value for mood
      style: "" // Add default value for style
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
