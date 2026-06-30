"""Masking helpers for sensitive fields. The single choke point for tax id masking."""

from __future__ import annotations

MASK_PREFIX = "••••"


def mask_tax_id(value: str) -> str:
    """Mask a tax id, keeping only the last 4 characters visible."""
    return f"{MASK_PREFIX}{value[-4:]}"
