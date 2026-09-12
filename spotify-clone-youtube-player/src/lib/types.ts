// A track object used throughout the app (mirrors Spotify's track model)
export interface Track {
  id: string; // YouTube video id
  title: string;
  artist: string;
  thumbnail: string; // artwork url
  duration: string; // human readable "3:45"
  durationSeconds: number;
}

export interface SearchResult {
  items: Track[];
}

export interface Playlist {
  id: number;
  name: string;
  tracks: Track[];
}

export interface LikedTrack {
  id: number;
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
}
