"""The raw tax id must never leak through repr()/str() — the 'never logged'
requirement, guarded purely in-memory with no I/O.
"""

from __future__ import annotations


def test_repr_does_not_contain_raw_tax_id(make_obligation):
    raw_tax_id = "98-7654321"
    obligation = make_obligation(company_tax_id=raw_tax_id)

    assert raw_tax_id not in repr(obligation)


def test_str_does_not_contain_raw_tax_id(make_obligation):
    raw_tax_id = "98-7654321"
    obligation = make_obligation(company_tax_id=raw_tax_id)

    assert raw_tax_id not in str(obligation)
