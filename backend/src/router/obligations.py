"""Thin HTTP endpoints: validate input shape, call the service, return a schema."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.db import get_db
from domain.enums import ObligationType, Status
from repositories.obligation_repository import ObligationRepository
from schemas.requests import (
    AttachDocumentRequest,
    CreateObligation,
    PatchObligation,
    TransitionRequest,
)
from schemas.responses import ObligationResponse, SummaryResponse
from services.obligation_service import ObligationService, SystemClock

router = APIRouter(prefix="/obligations", tags=["obligations"])


def get_service(db: Session = Depends(get_db)) -> ObligationService:
    return ObligationService(ObligationRepository(db), SystemClock())


@router.get("/summary", response_model=SummaryResponse)
def get_summary(service: ObligationService = Depends(get_service)) -> SummaryResponse:
    """Registered before `/{obligation_id}` so the literal path always wins."""
    return SummaryResponse.from_domain(service.get_summary())


@router.get("", response_model=list[ObligationResponse])
def list_obligations(
    status_filter: Status | None = Query(default=None, alias="status"),
    type_filter: ObligationType | None = Query(default=None, alias="type"),
    overdue: bool | None = Query(default=None),
    service: ObligationService = Depends(get_service),
) -> list[ObligationResponse]:
    obligations = service.list_obligations(
        status=status_filter, type=type_filter, overdue=overdue
    )
    as_of = service.today()
    return [ObligationResponse.from_domain(o, as_of=as_of) for o in obligations]


@router.get("/{obligation_id}", response_model=ObligationResponse)
def get_obligation(
    obligation_id: int, service: ObligationService = Depends(get_service)
) -> ObligationResponse:
    obligation = service.get_obligation(obligation_id)
    return ObligationResponse.from_domain(obligation, as_of=service.today())


@router.post("", response_model=ObligationResponse, status_code=201)
def create_obligation(
    payload: CreateObligation, service: ObligationService = Depends(get_service)
) -> ObligationResponse:
    obligation = service.create_obligation(
        type=payload.type,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        owner=payload.owner,
        requires_document=payload.requires_document,
        company_tax_id=payload.company_tax_id,
    )
    return ObligationResponse.from_domain(obligation, as_of=service.today())


@router.patch("/{obligation_id}", response_model=ObligationResponse)
def patch_obligation(
    obligation_id: int,
    payload: PatchObligation,
    service: ObligationService = Depends(get_service),
) -> ObligationResponse:
    obligation = service.patch_obligation(
        obligation_id,
        version=payload.version,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        owner=payload.owner,
        requires_document=payload.requires_document,
    )
    return ObligationResponse.from_domain(obligation, as_of=service.today())


@router.post("/{obligation_id}/transition", response_model=ObligationResponse)
def transition_obligation(
    obligation_id: int,
    payload: TransitionRequest,
    service: ObligationService = Depends(get_service),
) -> ObligationResponse:
    obligation = service.transition_obligation(
        obligation_id, new_status=payload.new_status, version=payload.version
    )
    return ObligationResponse.from_domain(obligation, as_of=service.today())


@router.post("/{obligation_id}/document", response_model=ObligationResponse)
def attach_document(
    obligation_id: int,
    payload: AttachDocumentRequest,
    service: ObligationService = Depends(get_service),
) -> ObligationResponse:
    obligation = service.attach_document(
        obligation_id, filename=payload.filename, version=payload.version
    )
    return ObligationResponse.from_domain(obligation, as_of=service.today())
