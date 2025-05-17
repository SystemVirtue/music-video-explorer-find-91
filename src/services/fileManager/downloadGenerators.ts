
import { generateDownloads } from './dataGenerators';

/**
 * Generate downloadable JSON for current artist data
 */
export const generateArtistDataJsonDownload = (): string => {
  return generateDownloads.artistData();
};

/**
 * Generate downloadable JSON for current video data
 */
export const generateVideoDataJsonDownload = (): string => {
  return generateDownloads.videoData();
};

/**
 * Generate downloadable JSON for combined data (for backward compatibility)
 */
export const generateCombinedDataJsonDownload = (): string => {
  return generateDownloads.combinedData();
};
