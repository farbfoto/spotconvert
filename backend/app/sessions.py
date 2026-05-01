"""
In-memory session store. Keyed by session ID stored in a signed cookie.
Sufficient for single-instance deployment; swap for Redis in multi-instance setups.
"""
from typing import Any

_store: dict[str, dict[str, Any]] = {}


def get(session_id: str) -> dict[str, Any]:
    return _store.setdefault(session_id, {})


def set_value(session_id: str, key: str, value: Any) -> None:
    _store.setdefault(session_id, {})[key] = value


def delete(session_id: str) -> None:
    _store.pop(session_id, None)
