import httpx

_BASE = "https://api.tidal.com/v1"


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def get_user(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{_BASE}/sessions", headers=_headers(access_token))
        resp.raise_for_status()
        return resp.json()


async def search_by_isrc(
    access_token: str, isrc: str, country_code: str = "US"
) -> dict | None:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{_BASE}/tracks",
            params={"isrc": isrc, "countryCode": country_code},
            headers=_headers(access_token),
        )
        if resp.status_code == 200:
            items = resp.json().get("items", [])
            return items[0] if items else None
    return None


async def search_tracks(
    access_token: str, query: str, country_code: str = "US"
) -> list[dict]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{_BASE}/search/tracks",
            params={"query": query, "limit": 5, "countryCode": country_code},
            headers=_headers(access_token),
        )
        if resp.status_code == 200:
            return resp.json().get("items", [])
    return []


async def create_playlist(
    access_token: str, user_id: int, title: str, description: str = ""
) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{_BASE}/users/{user_id}/playlists",
            json={"title": title, "description": description},
            headers=_headers(access_token),
        )
        resp.raise_for_status()
        return resp.json()


async def add_tracks_to_playlist(
    access_token: str, playlist_uuid: str, track_ids: list[int]
) -> None:
    async with httpx.AsyncClient() as client:
        for batch_start in range(0, len(track_ids), 50):
            batch = track_ids[batch_start : batch_start + 50]

            # Fetch current ETag for optimistic concurrency control
            playlist_resp = await client.get(
                f"{_BASE}/playlists/{playlist_uuid}",
                headers=_headers(access_token),
            )
            etag = playlist_resp.headers.get("ETag", "*")

            resp = await client.post(
                f"{_BASE}/playlists/{playlist_uuid}/items",
                json={"trackIds": batch, "toIndex": batch_start},
                headers={**_headers(access_token), "If-None-Match": etag},
            )
            resp.raise_for_status()
