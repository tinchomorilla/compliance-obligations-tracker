"""Persistence-layer errors. Vocabulary the domain has no concept of."""

from __future__ import annotations


class ObligationNotFound(Exception):
    """Raised by the repository when no row matches the given id."""

    def __init__(self, obligation_id: int) -> None:
        self.obligation_id = obligation_id
        super().__init__(f"Obligation {obligation_id} not found.")


class VersionConflict(Exception):
    """Raised when an optimistic-locking write affects zero rows."""

    def __init__(self, obligation_id: int, expected_version: int) -> None:
        self.obligation_id = obligation_id
        self.expected_version = expected_version
        super().__init__(
            f"Obligation {obligation_id} was modified concurrently "
            f"(expected version {expected_version})."
        )
