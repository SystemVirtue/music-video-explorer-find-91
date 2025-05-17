
// Utility functions for the file manager

/**
 * Extract YouTube video ID from a URL
 */
export const extractYouTubeVideoId = (url: string): string => {
  if (!url) return "";
  
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[1]) ? match[1] : "";
};
