import type { AuthStatus, ConvertResult, SpotifyPlaylist } from "./types";

const BASE = "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(msg || `HTTP ${resp.status}`);
  }
  return resp.json() as Promise<T>;
}

export const getAuthStatus = () => req<AuthStatus>("/auth/status");

export const getPlaylists = () => req<SpotifyPlaylist[]>("/playlists");

export const convertPlaylist = (
  playlistId: string,
  playlistName: string
): Promise<ConvertResult> =>
  req<ConvertResult>("/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playlist_id: playlistId, playlist_name: playlistName }),
  });

export const logout = () =>
  req<{ ok: boolean }>("/auth/logout", { method: "POST" });
