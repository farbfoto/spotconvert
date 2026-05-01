from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    spotify_client_id: str = ""
    spotify_client_secret: str = ""
    spotify_redirect_uri: str = "http://localhost:5173/api/auth/spotify/callback"

    tidal_client_id: str = ""
    tidal_client_secret: str = ""
    tidal_redirect_uri: str = "http://localhost:5173/api/auth/tidal/callback"

    session_secret: str = "change-me-in-production-use-random-string"
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
