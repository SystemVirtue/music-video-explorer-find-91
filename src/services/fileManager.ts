
import { Artist, MusicVideo, SearchResults } from "./musicApi";

export interface VideoDataFile {
  artists: Artist[];
  videos: MusicVideo[];
  artistCount: number;
  videoCount: number;
  lastUpdated: string;
}

// Initialize empty video data file
export const initializeVideoData = (): VideoDataFile => {
  return {
    artists: [],
    videos: [],
    artistCount: 0,
    videoCount: 0,
    lastUpdated: new Date().toISOString()
  };
};

// Get current video data or initialize if empty
export const getVideoData = (): VideoDataFile => {
  const videoDataString = localStorage.getItem('Video_Data_JSON');
  if (videoDataString) {
    try {
      return JSON.parse(videoDataString);
    } catch (e) {
      console.error('Error parsing video data from localStorage:', e);
      return initializeVideoData();
    }
  }
  return initializeVideoData();
};

// Save video data to localStorage
export const saveVideoData = (videoData: VideoDataFile): void => {
  localStorage.setItem('Video_Data_JSON', JSON.stringify(videoData));
};

// Add new search results to video data
export const addSearchResultsToVideoData = (artist: Artist, videos: MusicVideo[]): VideoDataFile => {
  const videoData = getVideoData();
  
  // Check if artist already exists in data
  const existingArtistIndex = videoData.artists.findIndex(a => a.id === artist.id);
  
  if (existingArtistIndex === -1) {
    // New artist, add to the list
    videoData.artists.push(artist);
  } else {
    // Update existing artist info
    videoData.artists[existingArtistIndex] = artist;
  }
  
  // Add videos that don't already exist
  for (const video of videos) {
    const existingVideoIndex = videoData.videos.findIndex(v => v.idTrack === video.idTrack);
    
    if (existingVideoIndex === -1) {
      videoData.videos.push(video);
    }
  }
  
  // Sort artists alphabetically
  videoData.artists.sort((a, b) => a.name.localeCompare(b.name));
  
  // Update counts
  videoData.artistCount = videoData.artists.length;
  videoData.videoCount = videoData.videos.length;
  videoData.lastUpdated = new Date().toISOString();
  
  // Save updated data
  saveVideoData(videoData);
  
  return videoData;
};

// Import data from uploaded JSON file
export const importFromJson = async (file: File): Promise<VideoDataFile> => {
  return new Promise<VideoDataFile>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const importedData = JSON.parse(event.target.result as string) as SearchResults;
        const currentData = getVideoData();
        
        // Add the artist if not already in the list
        if (importedData.artist && !currentData.artists.find(a => a.id === importedData.artist.id)) {
          currentData.artists.push(importedData.artist);
        }
        
        // Add videos that don't already exist
        if (importedData.videos && Array.isArray(importedData.videos)) {
          for (const video of importedData.videos) {
            if (!currentData.videos.find(v => v.idTrack === video.idTrack)) {
              currentData.videos.push(video);
            }
          }
        }
        
        // Sort artists alphabetically
        currentData.artists.sort((a, b) => a.name.localeCompare(b.name));
        
        // Update counts
        currentData.artistCount = currentData.artists.length;
        currentData.videoCount = currentData.videos.length;
        currentData.lastUpdated = new Date().toISOString();
        
        // Save updated data
        saveVideoData(currentData);
        
        resolve(currentData);
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

// Parse and process text file with artist names
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

// Extract artist names from YouTube playlist URL/ID
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
    
    // This is a simplified approach - in a real app we would need to use YouTube API
    // For now, we'll just return a message that this functionality would require YouTube API integration
    
    return [`YouTube API integration required to extract artists from playlist: ${playlistId}`];
  } catch (error) {
    console.error('Error parsing YouTube playlist:', error);
    throw new Error('Failed to parse YouTube playlist URL/ID');
  }
};

// Generate downloadable JSON for current video data
export const generateVideoDataJsonDownload = (): string => {
  const videoData = getVideoData();
  const jsonString = JSON.stringify(videoData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(blob);
};
