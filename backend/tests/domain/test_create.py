"""`Obligation.create()`: the only way to construct a brand-new obligation."""

from __future__ import annotations

from datetime import date

from domain.enums import ObligationType, Status
from domain.obligation import Obligation


def test_create_forces_a_guaranteed_valid_birth_state():
    obligation = Obligation.create(
        type=ObligationType.FRANCHISE_TAX,
        title="Franchise tax filing",
        description="State franchise tax",
        due_date=date(2027, 1, 1),
        owner="alice",
        requires_document=True,
        company_tax_id="12-3456789",
    )

    assert obligation.status == Status.PENDING
    assert obligation.version == 1
    assert obligation.history == []
    assert obligation.document_filename is None
    assert obligation.id is None


def test_create_preserves_the_fields_passed_in():
    due_date = date(2027, 1, 1)
    obligation = Obligation.create(
        type=ObligationType.FRANCHISE_TAX,
        title="Franchise tax filing",
        description="State franchise tax",
        due_date=due_date,
        owner="alice",
        requires_document=True,
        company_tax_id="12-3456789",
    )

    assert obligation.type == ObligationType.FRANCHISE_TAX
    assert obligation.title == "Franchise tax filing"
    assert obligation.description == "State franchise tax"
    assert obligation.due_date == due_date
    assert obligation.owner == "alice"
    assert obligation.requires_document is True
    assert obligation.company_tax_id == "12-3456789"
