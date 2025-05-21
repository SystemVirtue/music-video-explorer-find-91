
// Define interfaces for the normalized JSON structures
export interface VideoDataEntry {
  strArtist: string;      // TheAudioDB Artist_Name
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
  strArtist: string;       // TheAudioDB Artist_Name
  strArtistThumb: string;  // A direct URL to an artist thumbnail image
  strArtistBanner: string; // A 1000x185 JPG banner image containing the artist logo and/or name
  strArtistLogo: string;   // A 400x155 PNG image of artist's logo or name, on a transparent background
  strArtistWideThumb: string; // A 1000x1000 JPG thumbnail image picturing the artist
  strGenre: string;        // The primary musical genre of the artist
  strMood: string;         // The primary musical mood of the artist
  strStyle: string;        // The primary musical style of the artist
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
