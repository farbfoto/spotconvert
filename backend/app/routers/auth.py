import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse

from ..config import settings

router = APIRouter()


@router.get("/spotify")
async def spotify_login(request: Request):
    state = secrets.token_urlsafe(16)
    request.session["spotify_oauth_state"] = state
    params = urlencode(
        {
            "client_id": settings.spotify_client_id,
            "response_type": "code",
            "redirect_uri": settings.spotify_redirect_uri,
            "scope": "playlist-read-private playlist-read-collaborative",
            "state": state,
        }
    )
    return RedirectResponse(f"https://accounts.spotify.com/authorize?{params}")


@router.get("/spotify/callback")
async def spotify_callback(request: Request, code: str = "", state: str = "", error: str = ""):
    if error:
        return RedirectResponse(f"{settings.frontend_url}?error={error}")
    if state != request.session.get("spotify_oauth_state"):
        return RedirectResponse(f"{settings.frontend_url}?error=invalid_state")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://accounts.spotify.com/api/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.spotify_redirect_uri,
            },
            auth=(settings.spotify_client_id, settings.spotify_client_secret),
        )
        resp.raise_for_status()
        request.session["spotify_token"] = resp.json()

    return RedirectResponse(f"{settings.frontend_url}/playlists")


@router.get("/tidal")
async def tidal_login(request: Request):
    state = secrets.token_urlsafe(16)
    request.session["tidal_oauth_state"] = state
    params = urlencode(
        {
            "client_id": settings.tidal_client_id,
            "response_type": "code",
            "redirect_uri": settings.tidal_redirect_uri,
            "scope": "r_usr w_usr",
            "state": state,
        }
    )
    return RedirectResponse(f"https://login.tidal.com/authorize?{params}")


@router.get("/tidal/callback")
async def tidal_callback(request: Request, code: str = "", state: str = "", error: str = ""):
    if error:
        return RedirectResponse(f"{settings.frontend_url}?error={error}")
    if state != request.session.get("tidal_oauth_state"):
        return RedirectResponse(f"{settings.frontend_url}?error=invalid_state")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://auth.tidal.com/v1/oauth2/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.tidal_redirect_uri,
            },
            auth=(settings.tidal_client_id, settings.tidal_client_secret),
        )
        resp.raise_for_status()
        request.session["tidal_token"] = resp.json()

    return RedirectResponse(f"{settings.frontend_url}/convert")


@router.get("/status")
async def auth_status(request: Request):
    return {
        "spotify": "spotify_token" in request.session,
        "tidal": "tidal_token" in request.session,
    }


@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"ok": True}
