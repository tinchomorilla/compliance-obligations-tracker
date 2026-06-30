"""Inbound request schemas. camelCase on the wire, snake_case in Python."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from domain.enums import ObligationType, Status


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class CreateObligation(CamelModel):
    type: ObligationType
    title: str
    description: str
    due_date: date
    owner: str
    requires_document: bool
    company_tax_id: str


class PatchObligation(CamelModel):
    """Editable fields only. `status`/`companyTaxId`/`version` are never
    writable through this schema by design.
    """

    title: str | None = None
    description: str | None = None
    due_date: date | None = None
    owner: str | None = None
    requires_document: bool | None = None
    version: int


class TransitionRequest(CamelModel):
    new_status: Status
    version: int


class AttachDocumentRequest(CamelModel):
    filename: str
