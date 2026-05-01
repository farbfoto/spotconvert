import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthStatus, getPlaylists } from "../api";
import type { SpotifyPlaylist } from "../types";

const PLACEHOLDER = "https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large";

export default function Playlists() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAuthStatus()
      .then((status) => {
        if (!status.spotify) navigate("/");
        else return getPlaylists();
      })
      .then((data) => {
        if (data) setPlaylists(data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  function selectPlaylist(pl: SpotifyPlaylist) {
    localStorage.setItem("selected_playlist_id", pl.id);
    localStorage.setItem("selected_playlist_name", pl.name);
    localStorage.setItem("selected_playlist_tracks", String(pl.tracks.total));
    navigate("/convert");
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          <span className="text-spotify">Spot</span>
          <span className="text-tidal">Convert</span>
        </h1>
        <p className="text-gray-400 mt-1">Select a playlist to convert</p>
      </header>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-spotify border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <ul className="space-y-3">
        {playlists.map((pl) => (
          <li key={pl.id}>
            <button
              onClick={() => selectPlaylist(pl)}
              className="w-full flex items-center gap-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-colors text-left group"
            >
              <img
                src={pl.images?.[0]?.url ?? PLACEHOLDER}
                alt={pl.name}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{pl.name}</p>
                <p className="text-sm text-gray-400 truncate">
                  {pl.owner?.display_name} · {pl.tracks.total} tracks
                </p>
              </div>
              <span className="text-gray-600 group-hover:text-spotify transition-colors text-xl">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>

      {!loading && playlists.length === 0 && !error && (
        <p className="text-gray-500 text-center py-20">No playlists found.</p>
      )}
    </div>
  );
}
