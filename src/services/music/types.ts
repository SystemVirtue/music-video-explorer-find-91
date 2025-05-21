
// API endpoints for MusicBrainz and AudioDB
export const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
export const AUDIODB_API = 'https://www.theaudiodb.com/api/v1/json/2';
export const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';

// YouTube API Key (for demo purposes only - in a production app, this would be handled securely)
export const YOUTUBE_API_KEY = "AIzaSyC12QKbzGaKZw9VD3-ulxU_mrd0htZBiI4";

// Types
export interface Artist {
  id: string; // MBID
  name: string;
  score?: number;
}

export interface MusicVideo {
  idArtist: string;
  idTrack: string;
  strTrack: string;
  strArtist: string;
  strTrackThumb: string | null;
  strMusicVid: string;
  strDescriptionEN: string | null;
  strMusicBrainzArtistID?: string; // Add this to support the new data format
}

export interface SearchResults {
  artist: Artist;
  videos: MusicVideo[];
  timestamp: string;
}
