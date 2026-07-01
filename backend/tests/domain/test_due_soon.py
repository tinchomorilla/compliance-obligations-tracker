"""`is_due_soon`: derived from due_date and status, within the documented window."""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from domain.enums import Status
from domain.obligation import DUE_SOON_WINDOW_DAYS


@pytest.mark.parametrize(
    "status,expected",
    [
        (Status.PENDING, True),
        (Status.IN_PROGRESS, True),
        (Status.SUBMITTED, False),
        (Status.DONE, False),
    ],
)
def test_is_due_soon_within_window_depends_on_status(make_obligation, today, status, expected):
    obligation = make_obligation(status=status, due_date=today + timedelta(days=3))

    assert obligation.is_due_soon(as_of=today) is expected


def test_is_due_soon_on_the_window_boundary_is_true(make_obligation, today):
    obligation = make_obligation(
        status=Status.PENDING, due_date=today + timedelta(days=DUE_SOON_WINDOW_DAYS)
    )

    assert obligation.is_due_soon(as_of=today) is True


def test_is_due_soon_just_past_the_window_is_false(make_obligation, today):
    obligation = make_obligation(
        status=Status.PENDING, due_date=today + timedelta(days=DUE_SOON_WINDOW_DAYS + 1)
    )

    assert obligation.is_due_soon(as_of=today) is False


def test_is_due_soon_due_today_is_true(make_obligation, today):
    obligation = make_obligation(status=Status.PENDING, due_date=today)

    assert obligation.is_due_soon(as_of=today) is True


def test_is_due_soon_already_overdue_is_false(make_obligation, today):
    obligation = make_obligation(status=Status.PENDING, due_date=today - timedelta(days=1))

    assert obligation.is_due_soon(as_of=today) is False
