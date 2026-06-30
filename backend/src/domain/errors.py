"""Domain-level errors. These describe business facts only — no HTTP vocabulary."""

from __future__ import annotations

from domain.enums import Status


class DomainError(Exception):
    """Base class for all domain errors."""


class InvalidTransition(DomainError):
    """Raised when a status transition is not reachable per the state machine."""

    def __init__(self, from_status: Status, to_status: Status) -> None:
        self.from_status = from_status
        self.to_status = to_status
        super().__init__(
            f"Cannot transition from '{from_status.value}' to '{to_status.value}'."
        )


class DocumentRequired(DomainError):
    """Raised when a transition to SUBMITTED is blocked by a missing document."""

    def __init__(self, from_status: Status, to_status: Status) -> None:
        self.from_status = from_status
        self.to_status = to_status
        super().__init__(
            f"Cannot transition from '{from_status.value}' to '{to_status.value}': "
            "a document is required before submission."
        )
