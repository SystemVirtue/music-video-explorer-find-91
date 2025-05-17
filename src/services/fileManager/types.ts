
// Define interfaces for the normalized JSON structures
export interface VideoDataEntry {
  artistADID: string;      // AudioDB artist ID
  artistMBID: string;      // MusicBrainz artist ID
  songADID: string;        // AudioDB track ID
  songTitle: string;       // Track title
  videoURL: string;        // Full YouTube URL
  thumbnailYTID: string;   // YouTube video ID extracted from URL
}

export interface ArtistDataEntry {
  artistMBID: string;      // MusicBrainz artist ID
  artistADID: string;      // AudioDB artist ID
  artistName: string;      // Artist name
  artistVideoCount: number; // Count of videos with matching artistADID
  artistThumb: string;     // YouTube video ID of first matching video
}

export interface VideoDataFile {
  videos: VideoDataEntry[];
}

export interface ArtistDataFile {
  artists: ArtistDataEntry[];
}

// Legacy interface for backward compatibility during transition
export interface LegacyVideoDataFile {
  artists: any[];
  videos: any[];
  artistCount: number;
  videoCount: number;
  lastUpdated: string;
}
