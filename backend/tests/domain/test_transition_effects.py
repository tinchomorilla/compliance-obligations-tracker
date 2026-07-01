"""Effects of a successful transition: version bump and audit-entry creation."""

from __future__ import annotations

from datetime import datetime, timezone

from domain.enums import Status


def test_successful_transition_bumps_version_by_one(make_obligation, fixed_now):
    obligation = make_obligation(status=Status.PENDING, version=1)

    obligation.transition_to(Status.IN_PROGRESS, now=fixed_now)

    assert obligation.version == 2


def test_successful_transition_appends_one_audit_entry(make_obligation, fixed_now):
    obligation = make_obligation(status=Status.PENDING)

    obligation.transition_to(Status.IN_PROGRESS, now=fixed_now)

    assert len(obligation.history) == 1
    entry = obligation.history[0]
    assert entry.from_status == Status.PENDING
    assert entry.to_status == Status.IN_PROGRESS
    assert entry.at == fixed_now


def test_two_sequential_transitions_accumulate_version_and_history(make_obligation):
    first_at = datetime(2026, 6, 30, 12, 0, 0, tzinfo=timezone.utc)
    second_at = datetime(2026, 6, 30, 13, 0, 0, tzinfo=timezone.utc)
    obligation = make_obligation(status=Status.PENDING, version=1)

    obligation.transition_to(Status.IN_PROGRESS, now=first_at)
    obligation.transition_to(Status.SUBMITTED, now=second_at)

    assert obligation.version == 3
    assert len(obligation.history) == 2

    assert obligation.history[0].from_status == Status.PENDING
    assert obligation.history[0].to_status == Status.IN_PROGRESS
    assert obligation.history[0].at == first_at

    assert obligation.history[1].from_status == Status.IN_PROGRESS
    assert obligation.history[1].to_status == Status.SUBMITTED
    assert obligation.history[1].at == second_at
