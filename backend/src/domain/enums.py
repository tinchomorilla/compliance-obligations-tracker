"""Domain enums. Kept in their own module so `obligation.py` and `errors.py`
can both depend on them without depending on each other.
"""

from __future__ import annotations

from enum import Enum


class Status(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    DONE = "done"


class ObligationType(str, Enum):
    ANNUAL_REPORT = "annual_report"
    FRANCHISE_TAX = "franchise_tax"
    BOI_REPORT = "boi_report"
    REGISTERED_AGENT_RENEWAL = "registered_agent_renewal"
