
// API endpoints for MusicBrainz and AudioDB
const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const AUDIODB_API = 'https://www.theaudiodb.com/api/v1/json/2';

// Types
export interface Artist {
  id: string; // MBID
  name: string;
  score?: number;
}

export interface MusicVideo {
  idArtist: string;
  idTrack: string;
  strTrack: string;
  strArtist: string;
  strTrackThumb: string | null;
  strMusicVid: string;
  strDescriptionEN: string | null;
}

export interface SearchResults {
  artist: Artist;
  videos: MusicVideo[];
  timestamp: string;
}

/**
 * Search for an artist in MusicBrainz
 */
export const searchArtist = async (name: string): Promise<Artist | null> => {
  try {
    const response = await fetch(
      `${MUSICBRAINZ_API}/artist?query=${encodeURIComponent(name)}&fmt=json`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MusicVideoFinder/1.0.0 (lovable.app)'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.artists || data.artists.length === 0) {
      return null;
    }
    
    // Return the top match
    return {
      id: data.artists[0].id,
      name: data.artists[0].name,
      score: data.artists[0].score
    };
  } catch (error) {
    console.error('Error searching for artist:', error);
    throw error;
  }
};

/**
 * Get music videos for an artist from AudioDB
 */
export const getMusicVideos = async (mbid: string): Promise<MusicVideo[]> => {
  try {
    if (!mbid) {
      console.log("Skipping video lookup - missing MBID");
      return [];
    }

    console.log(`Finding Music Videos using MBID: ${mbid}`);
    
    // Added three alternative approaches to try and work around CORS issues
    // 1. First attempt: Using standard fetch with CORS mode and proper headers
    const fetchOptions = {
      mode: 'cors' as RequestMode,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MusicVideoFinder/1.0.0 (lovable.app)'
      }
    };

    // First API endpoint
    const url = `${AUDIODB_API}/mvid-mb.php?i=${mbid}`;
    console.log(`Attempting to fetch from: ${url}`);
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        console.log(`API Response not OK: ${response.status} ${response.statusText}`);
        throw new Error(`AudioDB API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        console.log("No data received from AudioDB API");
        return [];
      }
      
      if (!data.mvids) {
        console.log("No videos found for this MBID on AudioDB ('mvids' is null)");
        return [];
      }
      
      if (Array.isArray(data.mvids)) {
        console.log(`Found ${data.mvids.length} raw video entries from AudioDB`);
        return data.mvids;
      } else {
        console.log("'mvids' property is not an array");
        return [];
      }
    } catch (primaryError) {
      // Try alternate URL format as a fallback
      console.error("Primary API endpoint failed:", primaryError);
      
      // Try with HTTPS protocol to ensure secure connection
      const alternateUrl = `https://theaudiodb.com/api/v1/json/2/mvid-mb.php?i=${mbid}`;
      console.log(`Trying alternate endpoint: ${alternateUrl}`);
      
      try {
        const altResponse = await fetch(alternateUrl, fetchOptions);
        
        if (!altResponse.ok) {
          throw new Error(`Alternate AudioDB API error: ${altResponse.status} ${altResponse.statusText}`);
        }
        
        const altData = await altResponse.json();
        
        if (!altData || !altData.mvids) {
          return [];
        }
        
        return Array.isArray(altData.mvids) ? altData.mvids : [];
      } catch (secondaryError) {
        console.error("Both API endpoints failed:", secondaryError);
        throw new Error("Failed to fetch music videos from AudioDB. The service may be down or experiencing issues.");
      }
    }
  } catch (error) {
    console.error('Error getting music videos:', error);
    throw error;
  }
};

/**
 * Generate a downloadable JSON file for the search results
 */
export const generateJsonDownload = (artist: Artist, videos: MusicVideo[]): string => {
  const results: SearchResults = {
    artist,
    videos: videos.map(video => ({
      idArtist: video.idArtist,
      idTrack: video.idTrack,
      strTrack: video.strTrack,
      strArtist: video.strArtist,
      strTrackThumb: video.strTrackThumb,
      strMusicVid: video.strMusicVid,
      strDescriptionEN: video.strDescriptionEN
    })),
    timestamp: new Date().toISOString()
  };
  
  const jsonString = JSON.stringify(results, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(blob);
};

/**
 * Extract YouTube video ID from a YouTube URL
 */
export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Convert YouTube URL to thumbnail URL
 */
export const getYoutubeThumbnail = (videoId: string | null): string => {
  if (!videoId) return '/placeholder.svg';
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};
