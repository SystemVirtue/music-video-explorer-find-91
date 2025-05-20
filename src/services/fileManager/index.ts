
// This file re-exports all the functionality from the fileManager modules
// to maintain compatibility with existing code

// Re-export types
export * from './types';

// Re-export utils
export { extractYouTubeVideoId } from './utils';

// Re-export storage functions
export {
  initializeVideoData,
  getVideoData,
  saveVideoData,
  getCollectionStats
} from './storage';

// Re-export data generators
export { 
  generateArtistDataFromVideos,
} from './dataGenerators';

// Re-export download generators
export {
  generateArtistDataJsonDownload,
  generateVideoDataJsonDownload,
  generateCombinedDataJsonDownload,
  generateLegacyV2JsonDownload
} from './downloadGenerators';

// Re-export data operations
export {
  addSearchResultsToVideoData,
  deleteArtists
} from './dataOperations';

// Re-export file import/export functions
export {
  importFromJson,
  parseArtistTextFile,
  extractArtistsFromPlaylist
} from './fileImport';

// Re-export data converters
export { convertLegacyDataToNewFormat } from './dataConverters';
