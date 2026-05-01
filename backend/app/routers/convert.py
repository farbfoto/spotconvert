from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from ..services.matcher import match_track
from ..services.spotify import get_playlist_tracks
from ..services.tidal import add_tracks_to_playlist, create_playlist, get_user

router = APIRouter()


class ConvertRequest(BaseModel):
    playlist_id: str
    playlist_name: str
    country_code: str = "US"


@router.post("")
async def convert_playlist(body: ConvertRequest, request: Request):
    spotify_token = request.session.get("spotify_token")
    tidal_token = request.session.get("tidal_token")

    if not spotify_token:
        raise HTTPException(status_code=401, detail="Not authenticated with Spotify")
    if not tidal_token:
        raise HTTPException(status_code=401, detail="Not authenticated with Tidal")

    tracks = await get_playlist_tracks(spotify_token["access_token"], body.playlist_id)
    tidal_access = tidal_token["access_token"]

    matched: list[dict] = []
    unmatched: list[dict] = []

    for track in tracks:
        result = await match_track(track, tidal_access)
        if result:
            matched.append(
                {
                    "spotify_name": track.get("name", ""),
                    "spotify_artists": [a["name"] for a in track.get("artists", [])],
                    "tidal_id": result["tidal_track"]["id"],
                    "tidal_title": result["tidal_track"].get("title", ""),
                    "match_type": result["match_type"],
                    "score": result.get("score"),
                }
            )
        else:
            unmatched.append(
                {
                    "name": track.get("name", ""),
                    "artists": [a["name"] for a in track.get("artists", [])],
                }
            )

    user_info = await get_user(tidal_access)
    user_id = user_info["userId"]

    playlist = await create_playlist(
        tidal_access,
        user_id,
        body.playlist_name,
        "Imported from Spotify via SpotConvert",
    )
    playlist_uuid = playlist["uuid"]

    if matched:
        track_ids = [m["tidal_id"] for m in matched]
        await add_tracks_to_playlist(tidal_access, playlist_uuid, track_ids)

    return {
        "playlist_uuid": playlist_uuid,
        "playlist_url": f"https://tidal.com/browse/playlist/{playlist_uuid}",
        "total": len(tracks),
        "matched": len(matched),
        "unmatched": len(unmatched),
        "matched_tracks": matched,
        "unmatched_tracks": unmatched,
    }
