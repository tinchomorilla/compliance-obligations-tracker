"""State machine behavior: valid/invalid transitions, non-mutation on
rejection, and the documented ordering between InvalidTransition and
DocumentRequired.
"""

from __future__ import annotations

import copy

import pytest

from domain.enums import Status
from domain.errors import DocumentRequired, InvalidTransition
from domain.obligation import ALLOWED

VALID_TRANSITIONS = [
    (from_status, to_status)
    for from_status, targets in ALLOWED.items()
    for to_status in targets
]

INVALID_TRANSITIONS = [
    (Status.PENDING, Status.DONE),
    (Status.PENDING, Status.SUBMITTED),
    (Status.DONE, Status.SUBMITTED),
    (Status.DONE, Status.DONE),
    (Status.SUBMITTED, Status.PENDING),
]


@pytest.mark.parametrize("from_status,to_status", VALID_TRANSITIONS)
def test_valid_transition_reaches_target_status(make_obligation, fixed_now, from_status, to_status):
    obligation = make_obligation(status=from_status, requires_document=False)

    obligation.transition_to(to_status, now=fixed_now)

    assert obligation.status == to_status


@pytest.mark.parametrize("from_status,to_status", INVALID_TRANSITIONS)
def test_invalid_transition_raises(make_obligation, fixed_now, from_status, to_status):
    obligation = make_obligation(status=from_status)

    with pytest.raises(InvalidTransition):
        obligation.transition_to(to_status, now=fixed_now)


@pytest.mark.parametrize("from_status,to_status", INVALID_TRANSITIONS)
def test_invalid_transition_does_not_mutate_state(make_obligation, fixed_now, from_status, to_status):
    obligation = make_obligation(status=from_status)
    status_before = obligation.status
    version_before = obligation.version
    history_before = copy.deepcopy(obligation.history)

    with pytest.raises(InvalidTransition):
        obligation.transition_to(to_status, now=fixed_now)

    assert obligation.status == status_before
    assert obligation.version == version_before
    assert obligation.history == history_before


def test_document_required_does_not_mutate_state(make_obligation, fixed_now):
    obligation = make_obligation(
        status=Status.IN_PROGRESS, requires_document=True, document_filename=None
    )
    status_before = obligation.status
    version_before = obligation.version
    history_before = copy.deepcopy(obligation.history)

    with pytest.raises(DocumentRequired):
        obligation.transition_to(Status.SUBMITTED, now=fixed_now)

    assert obligation.status == status_before
    assert obligation.version == version_before
    assert obligation.history == history_before


def test_invalid_arrow_beats_missing_document(make_obligation, fixed_now):
    """PENDING -> SUBMITTED is both an invalid arrow and (if reachable) would be
    document-gated. InvalidTransition must win — the arrow check runs first.
    """
    obligation = make_obligation(
        status=Status.PENDING, requires_document=True, document_filename=None
    )

    with pytest.raises(InvalidTransition):
        obligation.transition_to(Status.SUBMITTED, now=fixed_now)
