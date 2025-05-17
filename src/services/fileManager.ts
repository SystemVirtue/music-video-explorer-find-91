import { Artist, MusicVideo, SearchResults, getYouTubePlaylistItems, extractArtistsFromTitles } from "./musicApi";

// Define new interfaces for the normalized JSON structures
export interface VideoDataEntry {
  artistADID: string;      // AudioDB artist ID
  artistMBID: string;      // MusicBrainz artist ID
  songADID: string;        // AudioDB track ID
  songTitle: string;       // Track title
  videoURL: string;        // Full YouTube URL
  thumbnailYTID: string;   // YouTube video ID extracted from URL
}

export interface ArtistDataEntry {
  artistMBID: string;      // MusicBrainz artist ID
  artistADID: string;      // AudioDB artist ID
  artistVideoCount: number; // Count of videos with matching artistADID
  artistThumb: string;     // YouTube video ID of first matching video
}

export interface VideoDataFile {
  videos: VideoDataEntry[];
}

export interface ArtistDataFile {
  artists: ArtistDataEntry[];
}

// Legacy interface for backward compatibility during transition
export interface LegacyVideoDataFile {
  artists: Artist[];
  videos: MusicVideo[];
  artistCount: number;
  videoCount: number;
  lastUpdated: string;
}

// Extract YouTube video ID from a URL
const extractYouTubeVideoId = (url: string): string => {
  if (!url) return "";
  
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[1]) ? match[1] : "";
};

// Initialize empty data files
export const initializeVideoData = (): { artistData: ArtistDataFile, videoData: VideoDataFile } => {
  return {
    artistData: { artists: [] },
    videoData: { videos: [] }
  };
};

// Get current video and artist data or initialize if empty
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

// Save video and artist data to localStorage
export const saveVideoData = (artistData: ArtistDataFile, videoData: VideoDataFile): void => {
  localStorage.setItem('ARTIST_DATA_JSON', JSON.stringify(artistData));
  localStorage.setItem('VIDEO_DATA_JSON', JSON.stringify(videoData));
};

// Convert legacy data format to new normalized format
const convertLegacyDataToNewFormat = (legacyData: LegacyVideoDataFile): { artistData: ArtistDataFile, videoData: VideoDataFile } => {
  const videoData: VideoDataFile = { videos: [] };
  
  // First, convert legacy MusicVideo objects to VideoDataEntry objects
  legacyData.videos.forEach(video => {
    const youtubeId = extractYouTubeVideoId(video.strMusicVid);
    
    if (youtubeId) {
      videoData.videos.push({
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

// Generate artist data based on video data
const generateArtistDataFromVideos = (videoData: VideoDataFile): ArtistDataFile => {
  const artistMap = new Map<string, ArtistDataEntry>();
  
  videoData.videos.forEach(video => {
    if (!artistMap.has(video.artistADID)) {
      artistMap.set(video.artistADID, {
        artistMBID: video.artistMBID,
        artistADID: video.artistADID,
        artistVideoCount: 1,
        artistThumb: video.thumbnailYTID
      });
    } else {
      const artist = artistMap.get(video.artistADID)!;
      artist.artistVideoCount += 1;
    }
  });
  
  return {
    artists: Array.from(artistMap.values())
  };
};

// Add new search results to video and artist data
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
    
    // Add new artist
    artistData.artists.push({
      artistMBID: artist.id,
      artistADID: videos[0].idArtist,
      artistVideoCount: artistVideos.length,
      artistThumb: artistVideos.length > 0 ? artistVideos[0].thumbnailYTID : ""
    });
  } else if (videos.length > 0) {
    // Update existing artist's video count
    const artistVideos = videoData.videos.filter(v => v.artistADID === videos[0].idArtist);
    artistData.artists[existingArtistIndex].artistVideoCount = artistVideos.length;
  }
  
  // Sort artists alphabetically (we need to use a separate function for this)
  // Since we don't have artist names in the new format, we'll skip this for now
  
  // Save updated data
  saveVideoData(artistData, videoData);
  
  return { artistData, videoData };
};

// Import data from uploaded JSON file
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
        
        // Check if this is a legacy format or new format
        if (importedData.artists && Array.isArray(importedData.artists) && 
            importedData.artists[0] && 'artistADID' in importedData.artists[0]) {
          // This is new format artist data
          importedData.artists.forEach((importedArtist: ArtistDataEntry) => {
            const existingIndex = artistData.artists.findIndex(a => a.artistADID === importedArtist.artistADID);
            if (existingIndex === -1) {
              artistData.artists.push(importedArtist);
            }
          });
        } else if (importedData.videos && Array.isArray(importedData.videos) && 
                  importedData.videos[0] && 'artistADID' in importedData.videos[0]) {
          // This is new format video data
          importedData.videos.forEach((importedVideo: VideoDataEntry) => {
            const existingIndex = videoData.videos.findIndex(v => v.songADID === importedVideo.songADID);
            if (existingIndex === -1) {
              videoData.videos.push(importedVideo);
            }
          });
          
          // Regenerate artist data
          const updatedArtistData = generateArtistDataFromVideos(videoData);
          Object.assign(artistData, updatedArtistData);
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
            }
          });
        }
        
        // Regenerate artist data to ensure consistency
        const regeneratedArtistData = generateArtistDataFromVideos(videoData);
        Object.assign(artistData, regeneratedArtistData);
        
        // Save updated data
        saveVideoData(artistData, videoData);
        
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

// Generate downloadable JSON for current artist data
export const generateArtistDataJsonDownload = (): string => {
  const { artistData } = getVideoData();
  const jsonString = JSON.stringify(artistData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(blob);
};

// Generate downloadable JSON for current video data
export const generateVideoDataJsonDownload = (): string => {
  const { videoData } = getVideoData();
  const jsonString = JSON.stringify(videoData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(blob);
};

// Generate downloadable JSON for combined data (for backward compatibility)
export const generateCombinedDataJsonDownload = (): string => {
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
};

// Delete artists and their associated videos
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

// Utility function to get artist and video counts
export const getCollectionStats = (): { artistCount: number, videoCount: number } => {
  const { artistData, videoData } = getVideoData();
  return {
    artistCount: artistData.artists.length,
    videoCount: videoData.videos.length
  };
};
