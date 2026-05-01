from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .config import settings
from .routers import auth, playlists, convert

app = FastAPI(title="SpotConvert API")

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    same_site="lax",
    https_only=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(playlists.router, prefix="/playlists", tags=["playlists"])
app.include_router(convert.router, prefix="/convert", tags=["convert"])


@app.get("/health")
async def health():
    return {"status": "ok"}
