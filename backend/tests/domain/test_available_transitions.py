"""`available_transitions`: the frontend's hint, derived from ALLOWED plus the
document-gating rule.
"""

from __future__ import annotations

import pytest

from domain.enums import Status
from domain.obligation import ALLOWED


@pytest.mark.parametrize("status", list(Status))
def test_available_transitions_matches_allowed_when_document_not_required(
    make_obligation, status
):
    obligation = make_obligation(status=status, requires_document=False)

    assert obligation.available_transitions() == ALLOWED[status]


def test_submitted_excluded_when_document_required_and_missing(make_obligation):
    obligation = make_obligation(
        status=Status.IN_PROGRESS, requires_document=True, document_filename=None
    )

    transitions = obligation.available_transitions()

    assert Status.SUBMITTED not in transitions
    assert transitions == ALLOWED[Status.IN_PROGRESS] - {Status.SUBMITTED}


def test_submitted_included_when_document_required_and_present(make_obligation):
    obligation = make_obligation(
        status=Status.IN_PROGRESS,
        requires_document=True,
        document_filename="report.pdf",
    )

    transitions = obligation.available_transitions()

    assert Status.SUBMITTED in transitions
    assert transitions == ALLOWED[Status.IN_PROGRESS]
