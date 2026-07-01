"""The document-gating invariant on the IN_PROGRESS -> SUBMITTED transition."""

from __future__ import annotations

import pytest

from domain.enums import Status
from domain.errors import DocumentRequired


def test_submitting_without_required_document_raises(make_obligation, fixed_now):
    obligation = make_obligation(
        status=Status.IN_PROGRESS, requires_document=True, document_filename=None
    )

    with pytest.raises(DocumentRequired):
        obligation.transition_to(Status.SUBMITTED, now=fixed_now)


def test_submitting_with_required_document_present_succeeds(make_obligation, fixed_now):
    obligation = make_obligation(
        status=Status.IN_PROGRESS,
        requires_document=True,
        document_filename="report.pdf",
    )

    obligation.transition_to(Status.SUBMITTED, now=fixed_now)

    assert obligation.status == Status.SUBMITTED


def test_submitting_without_document_requirement_succeeds_without_document(
    make_obligation, fixed_now
):
    obligation = make_obligation(
        status=Status.IN_PROGRESS, requires_document=False, document_filename=None
    )

    obligation.transition_to(Status.SUBMITTED, now=fixed_now)

    assert obligation.status == Status.SUBMITTED
