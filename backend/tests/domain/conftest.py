"""Shared fixtures for domain unit tests: a fixed clock and an Obligation factory."""

from __future__ import annotations

from datetime import date, datetime, timezone

import pytest

from domain.enums import ObligationType, Status
from domain.obligation import AuditEntry, Obligation

FIXED_NOW = datetime(2026, 6, 30, 12, 0, 0, tzinfo=timezone.utc)
TODAY = date(2026, 6, 30)


@pytest.fixture
def fixed_now() -> datetime:
    return FIXED_NOW


@pytest.fixture
def today() -> date:
    return TODAY


@pytest.fixture
def make_obligation():
    """Factory fixture: builds an Obligation with sensible defaults, overridable
    per test. Bypasses `Obligation.create()` so tests can construct an entity
    already sitting in any status, with any version/history.
    """

    def _make(
        *,
        status: Status = Status.PENDING,
        due_date: date = date(2026, 1, 1),
        requires_document: bool = False,
        document_filename: str | None = None,
        company_tax_id: str = "12-3456789",
        version: int = 1,
        history: list[AuditEntry] | None = None,
        id: int | None = 1,
        type: ObligationType = ObligationType.ANNUAL_REPORT,
        title: str = "Test obligation",
        description: str = "Test description",
        owner: str = "owner",
    ) -> Obligation:
        return Obligation(
            id=id,
            type=type,
            title=title,
            description=description,
            status=status,
            due_date=due_date,
            owner=owner,
            requires_document=requires_document,
            document_filename=document_filename,
            company_tax_id=company_tax_id,
            version=version,
            history=history if history is not None else [],
        )

    return _make
