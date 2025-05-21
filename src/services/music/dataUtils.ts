
import { Artist, MusicVideo, SearchResults } from './types';

/**
 * Generate a downloadable JSON file for the search results
 */
export const generateJsonDownload = (artist: Artist, videos: MusicVideo[]): string => {
  const results: SearchResults = {
    artist,
    videos: videos.map(video => ({
      idArtist: video.idArtist,
      idTrack: video.idTrack,
      strTrack: video.strTrack,
      strArtist: video.strArtist,
      strTrackThumb: video.strTrackThumb,
      strMusicVid: video.strMusicVid,
      strDescriptionEN: video.strDescriptionEN,
      strMusicBrainzArtistID: artist.id // Include the MusicBrainz ID for better data
    })),
    timestamp: new Date().toISOString()
  };
  
  const jsonString = JSON.stringify(results, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(blob);
};
