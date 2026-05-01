from fastapi import APIRouter, HTTPException, Request

from ..services.spotify import get_playlist_tracks, get_user_playlists

router = APIRouter()


@router.get("")
async def list_playlists(request: Request):
    token = request.session.get("spotify_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated with Spotify")
    return await get_user_playlists(token["access_token"])


@router.get("/{playlist_id}/tracks")
async def list_tracks(playlist_id: str, request: Request):
    token = request.session.get("spotify_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated with Spotify")
    return await get_playlist_tracks(token["access_token"], playlist_id)
