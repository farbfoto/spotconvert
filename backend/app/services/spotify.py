import httpx

_BASE = "https://api.spotify.com/v1"


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def get_user_playlists(access_token: str) -> list[dict]:
    playlists: list[dict] = []
    url = f"{_BASE}/me/playlists?limit=50"
    async with httpx.AsyncClient() as client:
        while url:
            resp = await client.get(url, headers=_headers(access_token))
            resp.raise_for_status()
            data = resp.json()
            playlists.extend(item for item in data["items"] if item)
            url = data.get("next")
    return playlists


async def get_playlist_tracks(access_token: str, playlist_id: str) -> list[dict]:
    tracks: list[dict] = []
    url = f"{_BASE}/playlists/{playlist_id}/tracks?limit=100"
    async with httpx.AsyncClient() as client:
        while url:
            resp = await client.get(url, headers=_headers(access_token))
            resp.raise_for_status()
            data = resp.json()
            tracks.extend(
                item["track"]
                for item in data["items"]
                if item and item.get("track")
            )
            url = data.get("next")
    return tracks
