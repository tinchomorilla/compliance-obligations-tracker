"""ORM tables. Pure persistence shape — no business rules here."""

from __future__ import annotations

import datetime as dt

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.db import Base
from domain.enums import ObligationType, Status


class ObligationModel(Base):
    __tablename__ = "obligations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[ObligationType] = mapped_column(
        Enum(ObligationType, name="obligation_type", native_enum=False), nullable=False
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[Status] = mapped_column(
        Enum(Status, name="obligation_status", native_enum=False), nullable=False
    )
    due_date: Mapped[dt.date] = mapped_column(Date, nullable=False)
    owner: Mapped[str] = mapped_column(String, nullable=False)
    requires_document: Mapped[bool] = mapped_column(nullable=False)
    document_filename: Mapped[str | None] = mapped_column(String, nullable=True)
    company_tax_id: Mapped[str] = mapped_column(String, nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    audit_entries: Mapped[list["AuditEntryModel"]] = relationship(
        back_populates="obligation",
        cascade="all, delete-orphan",
        order_by="AuditEntryModel.id",
    )


class AuditEntryModel(Base):
    __tablename__ = "audit_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    obligation_id: Mapped[int] = mapped_column(
        ForeignKey("obligations.id", ondelete="CASCADE"), nullable=False
    )
    from_status: Mapped[Status] = mapped_column(
        Enum(Status, name="audit_from_status", native_enum=False), nullable=False
    )
    to_status: Mapped[Status] = mapped_column(
        Enum(Status, name="audit_to_status", native_enum=False), nullable=False
    )
    at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    obligation: Mapped["ObligationModel"] = relationship(back_populates="audit_entries")
