from rapidfuzz import fuzz

from .tidal import search_by_isrc, search_tracks

_FUZZY_THRESHOLD = 80


async def match_track(spotify_track: dict, tidal_token: str) -> dict | None:
    isrc = spotify_track.get("external_ids", {}).get("isrc")
    if isrc:
        result = await search_by_isrc(tidal_token, isrc)
        if result:
            return {"tidal_track": result, "match_type": "isrc"}

    artists = ", ".join(a["name"] for a in spotify_track.get("artists", []))
    title = spotify_track.get("name", "")
    query = f"{artists} {title}"

    candidates = await search_tracks(tidal_token, query)
    for candidate in candidates:
        c_artists = ", ".join(
            a["name"] for a in candidate.get("artists", [])
        )
        c_title = candidate.get("title", "")

        title_score = fuzz.ratio(title.lower(), c_title.lower())
        artist_score = fuzz.ratio(artists.lower(), c_artists.lower())
        score = (title_score + artist_score) / 2

        if score >= _FUZZY_THRESHOLD:
            return {"tidal_track": candidate, "match_type": "fuzzy", "score": round(score, 1)}

    return None
