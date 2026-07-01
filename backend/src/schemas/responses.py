"""Outbound response schemas. The single choke point for tax id masking."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

from common.masking import mask_tax_id
from domain.enums import ObligationType, Status
from domain.obligation import AuditEntry, Obligation, ObligationSummary
from schemas.requests import CamelModel


class AuditEntryResponse(CamelModel):
    from_status: Status
    to_status: Status
    at: datetime

    @classmethod
    def from_domain(cls, entry: AuditEntry) -> "AuditEntryResponse":
        return cls(from_status=entry.from_status, to_status=entry.to_status, at=entry.at)


class ObligationResponse(CamelModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: int
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
    is_overdue: bool
    available_transitions: list[Status]
    history: list[AuditEntryResponse]

    @classmethod
    def from_domain(cls, obligation: Obligation, *, as_of: date) -> "ObligationResponse":
        """Build the wire response. The real tax id is masked here and only here."""
        return cls(
            id=obligation.id,
            type=obligation.type,
            title=obligation.title,
            description=obligation.description,
            status=obligation.status,
            due_date=obligation.due_date,
            owner=obligation.owner,
            requires_document=obligation.requires_document,
            document_filename=obligation.document_filename,
            company_tax_id=mask_tax_id(obligation.company_tax_id),
            version=obligation.version,
            is_overdue=obligation.is_overdue(as_of=as_of),
            available_transitions=sorted(
                obligation.available_transitions(), key=lambda s: s.value
            ),
            history=[AuditEntryResponse.from_domain(e) for e in obligation.history],
        )


class SummaryResponse(CamelModel):
    total: int
    by_status: dict[Status, int]
    overdue: int
    due_soon: int

    @classmethod
    def from_domain(cls, summary: ObligationSummary) -> "SummaryResponse":
        return cls(
            total=summary.total,
            by_status=summary.by_status,
            overdue=summary.overdue,
            due_soon=summary.due_soon,
        )
