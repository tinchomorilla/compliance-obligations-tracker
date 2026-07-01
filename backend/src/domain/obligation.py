"""Pure domain layer for compliance obligations.

This module must import NOTHING from outside the domain: no FastAPI, no
SQLAlchemy, no Pydantic. It is plain Python so it can be unit-tested without
HTTP or a database.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime

from domain.enums import ObligationType, Status
from domain.errors import DocumentRequired, InvalidTransition

# Single source of truth for valid status transitions.
ALLOWED: dict[Status, set[Status]] = {
    Status.PENDING: {Status.IN_PROGRESS},
    Status.IN_PROGRESS: {Status.SUBMITTED, Status.PENDING},
    Status.SUBMITTED: {Status.DONE, Status.IN_PROGRESS},
    Status.DONE: {Status.IN_PROGRESS},
}

# Documented threshold for the "due soon" summary rule.
DUE_SOON_WINDOW_DAYS = 7


@dataclass(frozen=True)
class AuditEntry:
    """Immutable record of a single status transition."""

    from_status: Status
    to_status: Status
    at: datetime


@dataclass(frozen=True)
class ObligationSummary:
    """KPI counts over a set of obligations. A read-model, not a stateful entity —
    built by the service from `is_overdue`/`is_due_soon`, never recomputed elsewhere.
    """

    total: int
    by_status: dict[Status, int]
    overdue: int
    due_soon: int


@dataclass
class Obligation:
    """A compliance obligation. The domain entity — distinct from the ORM model."""

    id: int | None
    type: ObligationType
    title: str
    description: str
    status: Status
    due_date: date
    owner: str
    requires_document: bool
    document_filename: str | None
    company_tax_id: str
    version: int
    history: list[AuditEntry] = field(default_factory=list)

    def __repr__(self) -> str:
        # Never expose the raw tax id, even in logs/debuggers.
        return (
            f"Obligation(id={self.id!r}, type={self.type!r}, status={self.status!r}, "
            f"due_date={self.due_date!r}, version={self.version!r})"
        )

    __str__ = __repr__

    @classmethod
    def create(
        cls,
        *,
        type: ObligationType,
        title: str,
        description: str,
        due_date: date,
        owner: str,
        requires_document: bool,
        company_tax_id: str,
    ) -> "Obligation":
        """Factory for a brand-new obligation in a guaranteed-valid birth state."""
        return cls(
            id=None,
            type=type,
            title=title,
            description=description,
            status=Status.PENDING,
            due_date=due_date,
            owner=owner,
            requires_document=requires_document,
            document_filename=None,
            company_tax_id=company_tax_id,
            version=1,
            history=[],
        )

    @property
    def has_document(self) -> bool:
        return self.document_filename is not None

    def is_overdue(self, *, as_of: date) -> bool:
        return self.due_date < as_of and self.status not in (
            Status.SUBMITTED,
            Status.DONE,
        )

    def is_due_soon(self, *, as_of: date, window_days: int = DUE_SOON_WINDOW_DAYS) -> bool:
        """Not yet submitted/done, not already overdue, and due within `window_days`."""
        if self.status in (Status.SUBMITTED, Status.DONE):
            return False
        if self.is_overdue(as_of=as_of):
            return False
        return (self.due_date - as_of).days <= window_days

    def available_transitions(self) -> set[Status]:
        transitions = set(ALLOWED[self.status])
        if self.requires_document and not self.has_document:
            transitions.discard(Status.SUBMITTED)
        return transitions

    def transition_to(self, new_status: Status, *, now: datetime) -> None:
        """The only way to change status. Order matters: invalid arrow first,
        missing-document gate second.
        """
        if new_status not in ALLOWED[self.status]:
            raise InvalidTransition(self.status, new_status)

        if (
            new_status == Status.SUBMITTED
            and self.requires_document
            and not self.has_document
        ):
            raise DocumentRequired(self.status, new_status)

        old_status = self.status
        self.status = new_status
        self.version += 1
        self.history.append(
            AuditEntry(from_status=old_status, to_status=new_status, at=now)
        )
