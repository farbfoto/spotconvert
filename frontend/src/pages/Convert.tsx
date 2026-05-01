import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertPlaylist, getAuthStatus } from "../api";
import type { ConvertResult } from "../types";

export default function Convert() {
  const navigate = useNavigate();
  const [spotifyOk, setSpotifyOk] = useState(false);
  const [tidalOk, setTidalOk] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playlistId = localStorage.getItem("selected_playlist_id") ?? "";
  const playlistName = localStorage.getItem("selected_playlist_name") ?? "My Playlist";
  const trackCount = localStorage.getItem("selected_playlist_tracks") ?? "?";

  useEffect(() => {
    getAuthStatus()
      .then((s) => {
        setSpotifyOk(s.spotify);
        setTidalOk(s.tidal);
        if (!s.spotify) navigate("/");
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  async function handleConvert() {
    if (!playlistId) return;
    setConverting(true);
    setError(null);
    try {
      const result: ConvertResult = await convertPlaylist(playlistId, playlistName);
      localStorage.setItem("convert_result", JSON.stringify(result));
      navigate("/result");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          <span className="text-spotify">Spot</span>
          <span className="text-tidal">Convert</span>
        </h1>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Selected playlist */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Playlist</p>
          <p className="font-semibold">{playlistName || "—"}</p>
          <p className="text-sm text-gray-400">{trackCount} tracks</p>
          <button
            onClick={() => navigate("/playlists")}
            className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Choose different playlist
          </button>
        </div>

        {/* Auth status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <StatusRow
            label="Spotify"
            connected={spotifyOk}
            connectHref="/api/auth/spotify"
            color="spotify"
          />
          <StatusRow
            label="Tidal"
            connected={tidalOk}
            connectHref="/api/auth/tidal"
            color="tidal"
          />
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!spotifyOk || !tidalOk || !playlistId || converting}
          className="w-full py-3 rounded-full font-semibold transition-all bg-tidal text-black hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {converting ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Converting…
            </>
          ) : (
            "Convert Playlist →"
          )}
        </button>

        {converting && (
          <p className="text-center text-xs text-gray-500">
            Matching tracks… this may take a moment for large playlists.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusRow({
  label,
  connected,
  connectHref,
  color,
}: {
  label: string;
  connected: boolean;
  connectHref: string;
  color: "spotify" | "tidal";
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${connected ? (color === "spotify" ? "bg-spotify" : "bg-tidal") : "bg-gray-600"}`}
        />
        <span className="text-sm">{label}</span>
      </div>
      {connected ? (
        <span className="text-xs text-gray-500">Connected</span>
      ) : (
        <a
          href={connectHref}
          className={`text-xs font-medium underline ${color === "spotify" ? "text-spotify" : "text-tidal"}`}
        >
          Connect
        </a>
      )}
    </div>
  );
}
