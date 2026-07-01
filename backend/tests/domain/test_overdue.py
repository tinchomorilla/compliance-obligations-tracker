"""`is_overdue`: derived from due_date and status, never stored."""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from domain.enums import Status

PAST_DUE = date(2026, 1, 1)
FUTURE_DUE = date(2027, 1, 1)


@pytest.mark.parametrize(
    "status,expected",
    [
        (Status.PENDING, True),
        (Status.IN_PROGRESS, True),
        (Status.SUBMITTED, False),
        (Status.DONE, False),
    ],
)
def test_is_overdue_past_due_date_depends_on_status(make_obligation, today, status, expected):
    obligation = make_obligation(status=status, due_date=PAST_DUE)

    assert obligation.is_overdue(as_of=today) is expected


def test_is_overdue_future_due_date_is_false(make_obligation, today):
    obligation = make_obligation(status=Status.PENDING, due_date=FUTURE_DUE)

    assert obligation.is_overdue(as_of=today) is False


def test_is_overdue_on_the_due_date_boundary_is_false(make_obligation, today):
    obligation = make_obligation(status=Status.PENDING, due_date=today)

    assert obligation.is_overdue(as_of=today) is False


def test_is_overdue_one_day_past_boundary_is_true(make_obligation, today):
    obligation = make_obligation(status=Status.PENDING, due_date=today - timedelta(days=1))

    assert obligation.is_overdue(as_of=today) is True
