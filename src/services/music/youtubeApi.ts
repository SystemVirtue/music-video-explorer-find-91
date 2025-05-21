
import { YOUTUBE_API, YOUTUBE_API_KEY } from './types';

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

/**
 * Get playlist items from YouTube API
 * This is a basic implementation to fetch playlist items
 */
export const getYouTubePlaylistItems = async (playlistId: string): Promise<any[]> => {
  try {
    // Initial request to get first page of results
    const response = await fetch(
      `${YOUTUBE_API}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    let items = data.items || [];
    
    // Handle pagination if there are more results
    let nextPageToken = data.nextPageToken;
    while (nextPageToken) {
      const nextResponse = await fetch(
        `${YOUTUBE_API}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&pageToken=${nextPageToken}`
      );
      
      if (!nextResponse.ok) {
        throw new Error(`YouTube API pagination error: ${nextResponse.status} ${nextResponse.statusText}`);
      }
      
      const nextData = await nextResponse.json();
      items = [...items, ...(nextData.items || [])];
      nextPageToken = nextData.nextPageToken;
    }
    
    return items;
  } catch (error) {
    console.error('Error fetching YouTube playlist:', error);
    throw error;
  }
};

/**
 * Extract artist names from video titles using a pattern
 * This is a simplified implementation that would need refinement for real use
 */
export const extractArtistsFromTitles = (titles: string[]): string[] => {
  // Common patterns in music video titles:
  // "Artist - Song Title"
  // "Artist - Song Title (Official Video)"
  // "Artist - Song Title [Official Video]"
  // "Artist 'Song Title' (Official Video)"
  
  const artists = new Set<string>();
  
  titles.forEach(title => {
    // Try to extract artist using the most common pattern: "Artist - Song Title"
    const dashSplit = title.split(' - ');
    if (dashSplit.length > 1) {
      const potentialArtist = dashSplit[0].trim();
      if (potentialArtist && potentialArtist.length > 1) {
        artists.add(potentialArtist);
      }
    }
  });
  
  return Array.from(artists);
};
