import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ConvertResult, MatchedTrack, UnmatchedTrack } from "../types";

export default function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [tab, setTab] = useState<"matched" | "unmatched">("matched");

  useEffect(() => {
    const raw = localStorage.getItem("convert_result");
    if (!raw) navigate("/");
    else setResult(JSON.parse(raw) as ConvertResult);
  }, [navigate]);

  if (!result) return null;

  const matchRate = Math.round((result.matched / result.total) * 100);

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          <span className="text-spotify">Spot</span>
          <span className="text-tidal">Convert</span>
        </h1>
        <p className="text-gray-400">Conversion complete</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Total" value={result.total} />
        <StatCard label="Matched" value={result.matched} highlight="tidal" />
        <StatCard label="Not found" value={result.unmatched} highlight="red" />
      </div>

      {/* Match rate bar */}
      <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Match rate</span>
          <span className="font-semibold text-tidal">{matchRate}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-tidal rounded-full transition-all"
            style={{ width: `${matchRate}%` }}
          />
        </div>
      </div>

      {/* Tidal link */}
      <a
        href={result.playlist_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-tidal text-black font-semibold hover:bg-cyan-300 transition-colors mb-6"
      >
        Open playlist in Tidal →
      </a>

      {/* Track tabs */}
      <div className="flex gap-2 mb-4">
        <TabButton
          active={tab === "matched"}
          onClick={() => setTab("matched")}
          label={`Matched (${result.matched})`}
        />
        <TabButton
          active={tab === "unmatched"}
          onClick={() => setTab("unmatched")}
          label={`Not found (${result.unmatched})`}
        />
      </div>

      {tab === "matched" && (
        <ul className="space-y-2">
          {result.matched_tracks.map((t, i) => (
            <MatchedRow key={i} track={t} />
          ))}
        </ul>
      )}

      {tab === "unmatched" && (
        <ul className="space-y-2">
          {result.unmatched_tracks.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              All tracks were matched! 🎉
            </p>
          ) : (
            result.unmatched_tracks.map((t, i) => <UnmatchedRow key={i} track={t} />)
          )}
        </ul>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            localStorage.removeItem("convert_result");
            navigate("/playlists");
          }}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Convert another playlist
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: "tidal" | "red";
}) {
  const valueClass =
    highlight === "tidal"
      ? "text-tidal"
      : highlight === "red"
        ? "text-red-400"
        : "text-white";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function MatchedRow({ track }: { track: MatchedTrack }) {
  return (
    <li className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{track.spotify_name}</p>
        <p className="text-xs text-gray-500 truncate">
          {track.spotify_artists.join(", ")}
        </p>
      </div>
      <span
        className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
          track.match_type === "isrc"
            ? "bg-tidal/10 text-tidal"
            : "bg-yellow-900/30 text-yellow-400"
        }`}
      >
        {track.match_type === "isrc" ? "ISRC" : `fuzzy ${track.score}%`}
      </span>
    </li>
  );
}

function UnmatchedRow({ track }: { track: UnmatchedTrack }) {
  return (
    <li className="flex items-center bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 gap-3">
      <span className="text-red-500 flex-shrink-0">✕</span>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{track.name}</p>
        <p className="text-xs text-gray-500 truncate">{track.artists.join(", ")}</p>
      </div>
    </li>
  );
}
