
// API endpoints for MusicBrainz and AudioDB
const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const AUDIODB_API = 'https://theaudiodb.com/api/v1/json/2';

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
          'User-Agent': 'MusicVideoFinder/1.0.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`);
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
    const response = await fetch(`${AUDIODB_API}/mvid-mb.php?i=${mbid}`);
    
    if (!response.ok) {
      throw new Error(`AudioDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.mvids) {
      return [];
    }
    
    return data.mvids;
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
