
import { MUSICBRAINZ_API, AUDIODB_API, Artist } from './types';

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
 * Get detailed artist information from AudioDB
 */
export const getArtistDetails = async (artistADID: string): Promise<any> => {
  try {
    if (!artistADID) {
      console.log("Skipping artist details lookup - missing artistADID");
      return null;
    }

    console.log(`Finding Artist Details using artistADID: ${artistADID}`);
    
    // Added API call with proper headers
    const fetchOptions = {
      mode: 'cors' as RequestMode,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MusicVideoFinder/1.0.0 (lovable.app)'
      }
    };

    // First API endpoint
    const url = `${AUDIODB_API}/artist.php?i=${artistADID}`;
    console.log(`Attempting to fetch artist details from: ${url}`);
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        console.log(`API Response not OK: ${response.status} ${response.statusText}`);
        throw new Error(`AudioDB API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        console.log("No data received from AudioDB API");
        return null;
      }
      
      if (!data.artists || !data.artists[0]) {
        console.log("No artist found for this ID on AudioDB ('artists' is null or empty)");
        return null;
      }
      
      console.log(`Found artist details for ${data.artists[0].strArtist}`);
      return data.artists[0];
    } catch (primaryError) {
      // Try alternate URL format as a fallback
      console.error("Primary API endpoint failed:", primaryError);
      
      // Try with HTTPS protocol to ensure secure connection
      const alternateUrl = `https://theaudiodb.com/api/v1/json/2/artist.php?i=${artistADID}`;
      console.log(`Trying alternate endpoint: ${alternateUrl}`);
      
      try {
        const altResponse = await fetch(alternateUrl, fetchOptions);
        
        if (!altResponse.ok) {
          throw new Error(`Alternate AudioDB API error: ${altResponse.status} ${altResponse.statusText}`);
        }
        
        const altData = await altResponse.json();
        
        if (!altData || !altData.artists || !altData.artists[0]) {
          return null;
        }
        
        return altData.artists[0];
      } catch (secondaryError) {
        console.error("Both API endpoints failed:", secondaryError);
        throw new Error("Failed to fetch artist details from AudioDB. The service may be down or experiencing issues.");
      }
    }
  } catch (error) {
    console.error('Error getting artist details:', error);
    throw error;
  }
};
