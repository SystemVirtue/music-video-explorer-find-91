
// Re-export all the types and functions from the individual modules

// Export types
export * from './types';

// Export artist API functions
export { 
  searchArtist,
  getArtistDetails 
} from './artistApi';

// Export video API functions
export {
  getMusicVideos
} from './videoApi';

// Export YouTube API functions
export {
  getYouTubePlaylistItems,
  extractYoutubeId
} from './youtubeApi';

// Export data utility functions
export {
  extractArtistsFromTitles,
  processMusicVideos
} from './dataUtils';
