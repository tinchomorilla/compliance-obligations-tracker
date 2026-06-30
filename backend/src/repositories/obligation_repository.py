"""Translates between the domain `Obligation` and the ORM `ObligationModel`,
and enforces optimistic locking on every state-changing write.
"""

from __future__ import annotations

from sqlalchemy import update
from sqlalchemy.orm import Session

from domain.obligation import AuditEntry, Obligation
from errors.app_errors import ObligationNotFound, VersionConflict
from models.obligation import AuditEntryModel, ObligationModel


def _to_domain(model: ObligationModel) -> Obligation:
    return Obligation(
        id=model.id,
        type=model.type,
        title=model.title,
        description=model.description,
        status=model.status,
        due_date=model.due_date,
        owner=model.owner,
        requires_document=model.requires_document,
        document_filename=model.document_filename,
        company_tax_id=model.company_tax_id,
        version=model.version,
        history=[
            AuditEntry(
                from_status=entry.from_status,
                to_status=entry.to_status,
                at=entry.at,
            )
            for entry in model.audit_entries
        ],
    )


class ObligationRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get(self, obligation_id: int) -> Obligation:
        model = self._db.get(ObligationModel, obligation_id)
        if model is None:
            raise ObligationNotFound(obligation_id)
        return _to_domain(model)

    def list(self) -> list[Obligation]:
        models = self._db.query(ObligationModel).order_by(ObligationModel.id).all()
        return [_to_domain(model) for model in models]

    def add(self, obligation: Obligation) -> Obligation:
        model = ObligationModel(
            type=obligation.type,
            title=obligation.title,
            description=obligation.description,
            status=obligation.status,
            due_date=obligation.due_date,
            owner=obligation.owner,
            requires_document=obligation.requires_document,
            document_filename=obligation.document_filename,
            company_tax_id=obligation.company_tax_id,
            version=obligation.version,
        )
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return _to_domain(model)

    def save(self, obligation: Obligation, *, expected_version: int) -> Obligation:
        """Persist edits/transitions with an optimistic-locking guard.

        Writes the full row plus any new audit entries, and bumps `version`
        only if the row still matches `expected_version`. Zero affected rows
        means a concurrent write happened first -> VersionConflict.
        """
        result = self._db.execute(
            update(ObligationModel)
            .where(
                ObligationModel.id == obligation.id,
                ObligationModel.version == expected_version,
            )
            .values(
                title=obligation.title,
                description=obligation.description,
                status=obligation.status,
                due_date=obligation.due_date,
                owner=obligation.owner,
                requires_document=obligation.requires_document,
                document_filename=obligation.document_filename,
                version=ObligationModel.version + 1,
            )
        )

        if result.rowcount == 0:
            self._db.rollback()
            raise VersionConflict(obligation.id, expected_version)

        # `history` holds every persisted entry plus any appended by a
        # transition that happened in-memory before this save. Each
        # transition appends exactly one entry and bumps the in-memory
        # version by one, so the tail of this length is what's new.
        new_entry_count = obligation.version - expected_version
        new_entries = obligation.history[len(obligation.history) - new_entry_count:]
        for entry in new_entries:
            self._db.add(
                AuditEntryModel(
                    obligation_id=obligation.id,
                    from_status=entry.from_status,
                    to_status=entry.to_status,
                    at=entry.at,
                )
            )

        self._db.commit()
        return self.get(obligation.id)
