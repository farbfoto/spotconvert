import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthStatus } from "../api";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setError(decodeURIComponent(err));

    getAuthStatus()
      .then((status) => {
        if (status.spotify) navigate("/playlists");
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-spotify border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-2">
          <span className="text-spotify">Spot</span>
          <span className="text-tidal">Convert</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Transfer your Spotify playlists to Tidal — instantly.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          Authentication error: {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <div className="w-full bg-gray-900 rounded-xl p-5 border border-gray-800">
          <ol className="space-y-3 text-sm text-gray-400">
            {[
              { step: "1", label: "Connect Spotify", color: "text-spotify" },
              { step: "2", label: "Select a playlist", color: "text-gray-300" },
              { step: "3", label: "Connect Tidal", color: "text-tidal" },
              { step: "4", label: "Convert!", color: "text-gray-300" },
            ].map(({ step, label, color }) => (
              <li key={step} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                  {step}
                </span>
                <span className={color}>{label}</span>
              </li>
            ))}
          </ol>
        </div>

        <a
          href="/api/auth/spotify"
          className="w-full flex items-center justify-center gap-2 bg-spotify hover:bg-green-400 text-black font-semibold py-3 px-6 rounded-full transition-colors"
        >
          <SpotifyIcon />
          Connect with Spotify
        </a>
      </div>
    </div>
  );
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
