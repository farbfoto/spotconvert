export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
}

export interface MatchedTrack {
  spotify_name: string;
  spotify_artists: string[];
  tidal_id: number;
  tidal_title: string;
  match_type: "isrc" | "fuzzy";
  score?: number;
}

export interface UnmatchedTrack {
  name: string;
  artists: string[];
}

export interface ConvertResult {
  playlist_uuid: string;
  playlist_url: string;
  total: number;
  matched: number;
  unmatched: number;
  matched_tracks: MatchedTrack[];
  unmatched_tracks: UnmatchedTrack[];
}

export interface AuthStatus {
  spotify: boolean;
  tidal: boolean;
}
