from __future__ import annotations

from collections import defaultdict
import re

from config import FeatureRule


EXPECTED_HEADERS = {"ITEM", "PART NUMBER", "DESCRIPTION", "QTY"}
HEADER_ALIASES = {
    "ITEM": ("ITEM", "ITEM NO", "ITEM NO.", "ITM"),
    "PART NUMBER": ("PART NUMBER", "PART NO", "PART NO.", "PART #"),
    "DESCRIPTION": ("DESCRIPTION", "DESC"),
    "QTY": ("QTY", "QTY.", "QUANTITY"),
}


def _normalize_cell(value: str | None) -> str:
    return (value or "").strip()


def _find_header_map(header_row: list[str]) -> dict[str, int] | None:
    normalized = [_normalize_cell(cell).upper() for cell in header_row]
    header_map: dict[str, int] = {}
    for canonical, aliases in HEADER_ALIASES.items():
        for alias in aliases:
            if alias in normalized:
                header_map[canonical] = normalized.index(alias)
                break
    if EXPECTED_HEADERS.issubset(set(header_map.keys())):
        return header_map
    return None


def _is_integer_like(text: str) -> bool:
    return bool(re.fullmatch(r"\d+(?:\.0+)?", text.strip()))


def _parse_headerless_bom_row(row: list[str | None]) -> tuple[int, str, str, int] | None:
    """Parse item number, description, and quantity from a row that has no header row."""
    if len(row) < 4:
        return None

    item_text = _normalize_cell(row[0])
    part_number = _normalize_cell(row[1])
    description = _normalize_cell(row[2])
    qty_text = _normalize_cell(row[3])

    if not item_text or not description or not qty_text:
        return None
    if not _is_integer_like(item_text):
        return None
    if not _is_integer_like(qty_text):
        return None

    return int(float(item_text)), part_number, description.upper(), int(float(qty_text))


def parse_bom_table(tables: list[list[list[str | None]]]) -> dict[int, dict[str, str | int]]:
    """
    Extract the BOM from extracted PDF tables.

    Returns a mapping of item_number → {"description": str, "qty": int}.
    Supports both header-row tables and headerless tables (fallback).
    """
    # Pass 1: tables that contain recognisable BOM column headers somewhere.
    for table in tables:
        if not table:
            continue

        for header_row_index, row in enumerate(table):
            header_map = _find_header_map([_normalize_cell(cell) for cell in row])
            if header_map is None:
                continue

            bom: dict[int, dict[str, str | int]] = {}
            for data_row in table[header_row_index + 1:]:
                if not data_row:
                    continue

                item_text = _normalize_cell(data_row[header_map["ITEM"]])
                part_number = _normalize_cell(data_row[header_map["PART NUMBER"]])
                description = _normalize_cell(data_row[header_map["DESCRIPTION"]])
                qty_text = _normalize_cell(data_row[header_map["QTY"]])

                if not item_text or not description or not qty_text:
                    continue
                if not _is_integer_like(item_text) or not _is_integer_like(qty_text):
                    continue

                bom[int(float(item_text))] = {
                    "part_number": part_number,
                    "description": description.upper(),
                    "qty": int(float(qty_text)),
                }
            if bom:
                return bom

    # Pass 2: headerless fallback – recognise rows by value pattern alone.
    best: dict[int, dict[str, str | int]] = {}
    for table in tables:
        if not table:
            continue

        bom = {}
        for row in table:
            if not row:
                continue
            parsed = _parse_headerless_bom_row(row)
            if parsed is None:
                continue
            item_num, part_number, description, qty = parsed
            bom[item_num] = {"part_number": part_number, "description": description, "qty": qty}

        if len(bom) > len(best):
            best = bom

    if best:
        return best

    raise ValueError("No BOM table with ITEM, PART NUMBER, DESCRIPTION, QTY columns was found.")


def derive_expected_features(
    bom: dict[str, int],
    feature_rules: tuple[FeatureRule, ...],
) -> tuple[dict[str, int], dict[str, int]]:
    """Legacy helper: translate BOM description strings into feature counts via keywords."""
    expected: defaultdict[str, int] = defaultdict(int)
    unmapped: dict[str, int] = {}

    # Prefer more specific keyword matches (e.g., CLEARANCE over HOLE).
    prioritized_rules = sorted(
        feature_rules,
        key=lambda rule: max(len(keyword) for keyword in rule.bom_keywords),
        reverse=True,
    )

    for description, quantity in bom.items():
        matched_rule = None
        for rule in prioritized_rules:
            if any(keyword in description for keyword in rule.bom_keywords):
                matched_rule = rule
                break

        if matched_rule is None:
            unmapped[description] = quantity
            continue

        expected[matched_rule.key] += quantity

    return dict(expected), unmapped