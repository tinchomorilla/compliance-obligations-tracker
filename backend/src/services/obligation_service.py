"""Use-case orchestration. Coordinates repo <-> domain calls; decides nothing.

Takes plain Python arguments rather than Pydantic schemas so it stays
testable without FastAPI, and injects a `Clock` so the real wall clock never
leaks into the domain.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timezone
from typing import Protocol

from domain.enums import ObligationType, Status
from domain.obligation import Obligation, ObligationSummary
from repositories.obligation_repository import ObligationRepository


class Clock(Protocol):
    def now(self) -> datetime: ...

    def today(self) -> date: ...


@dataclass
class SystemClock:
    """The real wall clock. Used in production; swap for a fixed clock in tests."""

    def now(self) -> datetime:
        return datetime.now(timezone.utc)

    def today(self) -> date:
        return self.now().date()


class ObligationService:
    def __init__(self, repository: ObligationRepository, clock: Clock) -> None:
        self._repository = repository
        self._clock = clock

    def list_obligations(
        self,
        *,
        status: Status | None = None,
        type: ObligationType | None = None,
        overdue: bool | None = None,
    ) -> list[Obligation]:
        obligations = self._repository.list()

        if status is not None:
            obligations = [o for o in obligations if o.status == status]
        if type is not None:
            obligations = [o for o in obligations if o.type == type]
        if overdue is not None:
            as_of = self._clock.today()
            obligations = [
                o for o in obligations if o.is_overdue(as_of=as_of) == overdue
            ]

        return obligations

    def get_obligation(self, obligation_id: int) -> Obligation:
        return self._repository.get(obligation_id)

    def get_summary(self) -> ObligationSummary:
        """KPI counts over ALL obligations, independent of any list filter.

        Reuses the domain's `is_overdue`/`is_due_soon` rules; this method only
        counts, it does not decide what counts as overdue or due soon.
        """
        obligations = self._repository.list()
        as_of = self._clock.today()

        by_status: dict[Status, int] = {status: 0 for status in Status}
        overdue = 0
        due_soon = 0
        for obligation in obligations:
            by_status[obligation.status] += 1
            if obligation.is_overdue(as_of=as_of):
                overdue += 1
            elif obligation.is_due_soon(as_of=as_of):
                due_soon += 1

        return ObligationSummary(
            total=len(obligations),
            by_status=by_status,
            overdue=overdue,
            due_soon=due_soon,
        )

    def today(self) -> date:
        """Exposes the injected clock's notion of "today" for response building."""
        return self._clock.today()

    def create_obligation(
        self,
        *,
        type: ObligationType,
        title: str,
        description: str,
        due_date: date,
        owner: str,
        requires_document: bool,
        company_tax_id: str,
    ) -> Obligation:
        obligation = Obligation.create(
            type=type,
            title=title,
            description=description,
            due_date=due_date,
            owner=owner,
            requires_document=requires_document,
            company_tax_id=company_tax_id,
        )
        return self._repository.add(obligation)

    def patch_obligation(
        self,
        obligation_id: int,
        *,
        version: int,
        title: str | None = None,
        description: str | None = None,
        due_date: date | None = None,
        owner: str | None = None,
        requires_document: bool | None = None,
    ) -> Obligation:
        obligation = self._repository.get(obligation_id)

        if title is not None:
            obligation.title = title
        if description is not None:
            obligation.description = description
        if due_date is not None:
            obligation.due_date = due_date
        if owner is not None:
            obligation.owner = owner
        if requires_document is not None:
            obligation.requires_document = requires_document

        return self._repository.save(obligation, expected_version=version)

    def transition_obligation(
        self, obligation_id: int, *, new_status: Status, version: int
    ) -> Obligation:
        obligation = self._repository.get(obligation_id)
        obligation.transition_to(new_status, now=self._clock.now())
        return self._repository.save(obligation, expected_version=version)

    def attach_document(
        self, obligation_id: int, *, filename: str, version: int
    ) -> Obligation:
        obligation = self._repository.get(obligation_id)
        obligation.document_filename = filename
        return self._repository.save(obligation, expected_version=version)
