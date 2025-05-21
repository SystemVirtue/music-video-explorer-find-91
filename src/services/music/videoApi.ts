
import { AUDIODB_API, MusicVideo } from './types';

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
        // Make sure each video has at least an empty strArtist field if it's missing
        const processedVideos = data.mvids.map((video: MusicVideo) => {
          return {
            ...video,
            strArtist: video.strArtist || ""
          };
        });
        return processedVideos;
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
        
        // Make sure each video has at least an empty strArtist field if it's missing
        const processedVideos = Array.isArray(altData.mvids) 
          ? altData.mvids.map((video: MusicVideo) => {
              return {
                ...video,
                strArtist: video.strArtist || ""
              };
            })
          : [];
        
        return processedVideos;
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
