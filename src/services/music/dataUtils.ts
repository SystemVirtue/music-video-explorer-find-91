
import { Artist, MusicVideo, SearchResults } from './types';

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
      strDescriptionEN: video.strDescriptionEN,
      strMusicBrainzArtistID: artist.id // Include the MusicBrainz ID for better data
    })),
    timestamp: new Date().toISOString()
  };
  
  const jsonString = JSON.stringify(results, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(blob);
};

/**
 * Get detailed information about an artist from TheAudioDB
 */
export const getArtistDetails = async (artistADID: string): Promise<any> => {
  try {
    // API allows max 2 calls/second
    const url = `https://www.theaudiodb.com/api/v1/json/2/artist.php?i=${artistADID}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MusicVideoFinder/1.0.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`TheAudioDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data?.artists?.[0] || null;
  } catch (error) {
    console.error('Error getting artist details:', error);
    throw error;
  }
};
