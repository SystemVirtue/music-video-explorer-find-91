
import { ArtistDataFile, VideoDataFile, ArtistDataEntry, VideoDataEntry } from './types';
import { getVideoData, saveVideoData } from './storage';
import { generateArtistDataFromVideos } from './dataGenerators';
import { Artist, MusicVideo, getYouTubePlaylistItems, extractArtistsFromTitles } from "@/services/musicApi";

/**
 * Update the importFromJson function to properly count and update in-memory JSON
 */
export const importFromJson = async (file: File): Promise<{ artistData: ArtistDataFile, videoData: VideoDataFile }> => {
  return new Promise<{ artistData: ArtistDataFile, videoData: VideoDataFile }>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const importedData = JSON.parse(event.target.result as string);
        const { artistData, videoData } = getVideoData();
        let modified = false;
        
        // Check if this is a legacy format or new format
        if (importedData.artists && Array.isArray(importedData.artists) && 
            importedData.artists[0] && 'artistADID' in importedData.artists[0]) {
          // This is new format artist data
          importedData.artists.forEach((importedArtist: ArtistDataEntry) => {
            const existingIndex = artistData.artists.findIndex(a => a.artistADID === importedArtist.artistADID);
            if (existingIndex === -1) {
              // Add name if it doesn't exist
              if (!importedArtist.artistName) {
                importedArtist.artistName = `Artist (ID: ${importedArtist.artistADID.substring(0, 8)}...)`;
              }
              artistData.artists.push(importedArtist);
              modified = true;
            }
          });
        } else if (importedData.videos && Array.isArray(importedData.videos) && 
                  importedData.videos[0] && 'artistADID' in importedData.videos[0]) {
          // This is new format video data
          importedData.videos.forEach((importedVideo: VideoDataEntry) => {
            const existingIndex = videoData.videos.findIndex(v => v.songADID === importedVideo.songADID);
            if (existingIndex === -1) {
              videoData.videos.push(importedVideo);
              modified = true;
            }
          });
        } else if (importedData.artistData && importedData.videoData) {
          // This is a combined format
          if (importedData.artistData.artists && Array.isArray(importedData.artistData.artists)) {
            importedData.artistData.artists.forEach((importedArtist: ArtistDataEntry) => {
              const existingIndex = artistData.artists.findIndex(a => a.artistADID === importedArtist.artistADID);
              if (existingIndex === -1) {
                // Add name if it doesn't exist
                if (!importedArtist.artistName) {
                  importedArtist.artistName = `Artist (ID: ${importedArtist.artistADID.substring(0, 8)}...)`;
                }
                artistData.artists.push(importedArtist);
                modified = true;
              }
            });
          }
          
          if (importedData.videoData.videos && Array.isArray(importedData.videoData.videos)) {
            importedData.videoData.videos.forEach((importedVideo: VideoDataEntry) => {
              const existingIndex = videoData.videos.findIndex(v => v.songADID === importedVideo.songADID);
              if (existingIndex === -1) {
                videoData.videos.push(importedVideo);
                modified = true;
              }
            });
          }
        } else if (importedData.artist && importedData.videos) {
          // This is a legacy SearchResults format
          const artist = importedData.artist as Artist;
          const mvids = importedData.videos as MusicVideo[];
          
          // Process the imported data similar to addSearchResultsToVideoData
          mvids.forEach(video => {
            const youtubeId = extractYouTubeVideoId(video.strMusicVid);
            
            if (!youtubeId) return;
            
            const existingVideoIndex = videoData.videos.findIndex(v => v.songADID === video.idTrack);
            
            if (existingVideoIndex === -1) {
              videoData.videos.push({
                artistADID: video.idArtist,
                artistMBID: artist.id,
                songADID: video.idTrack,
                songTitle: video.strTrack,
                videoURL: video.strMusicVid,
                thumbnailYTID: youtubeId
              });
              modified = true;
            }
          });
        }
        
        // Only regenerate artist data if something was modified
        if (modified) {
          // Regenerate artist data to ensure consistency and correct counts
          const regeneratedArtistData = generateArtistDataFromVideos(videoData);
          
          // Preserve artist names from the existing artist data
          regeneratedArtistData.artists = regeneratedArtistData.artists.map(newArtist => {
            const existingArtist = artistData.artists.find(a => a.artistADID === newArtist.artistADID);
            if (existingArtist && existingArtist.artistName) {
              newArtist.artistName = existingArtist.artistName;
            }
            return newArtist;
          });
          
          // Replace artist data with regenerated data
          artistData.artists = regeneratedArtistData.artists;
          
          // Save updated data
          saveVideoData(artistData, videoData);
        }
        
        resolve({ artistData, videoData });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parse and process text file with artist names
 */
export const parseArtistTextFile = async (file: File): Promise<string[]> => {
  return new Promise<string[]>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const content = event.target.result as string;
        const artistNames = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        resolve(artistNames);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Extract artist names from YouTube playlist URL/ID
 */
export const extractArtistsFromPlaylist = async (playlistUrl: string): Promise<string[]> => {
  try {
    // Extract playlist ID from URL if it's a URL
    let playlistId = playlistUrl;
    
    if (playlistUrl.includes('youtube.com') || playlistUrl.includes('youtu.be')) {
      const urlObj = new URL(playlistUrl);
      const params = new URLSearchParams(urlObj.search);
      const listParam = params.get('list');
      
      if (listParam) {
        playlistId = listParam;
      } else {
        throw new Error('Could not extract playlist ID from URL');
      }
    }
    
    // Get playlist items from YouTube API
    const playlistItems = await getYouTubePlaylistItems(playlistId);
    
    if (!playlistItems || playlistItems.length === 0) {
      return [];
    }
    
    // Extract video titles from playlist items
    const videoTitles = playlistItems.map(item => 
      item.snippet && item.snippet.title ? item.snippet.title : ""
    ).filter(title => title !== "");
    
    // Extract artist names from video titles
    return extractArtistsFromTitles(videoTitles);
  } catch (error) {
    console.error('Error parsing YouTube playlist:', error);
    throw new Error('Failed to parse YouTube playlist URL/ID');
  }
};
