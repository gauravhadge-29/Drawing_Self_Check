from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path


RULES_FILE = Path(__file__).with_name("material_rules.json")


def _normalize_token(value: str | None) -> str:
    if not value:
        return ""
    upper = value.upper().strip()
    # Keep letters and digits only for robust matching of variants like
    # "6082-T651" vs "6082 T651".
    return re.sub(r"[^A-Z0-9]", "", upper)


@lru_cache(maxsize=1)
def _load_rules() -> dict[str, dict[str, object]]:
    with RULES_FILE.open("r", encoding="utf-8") as fp:
        raw = json.load(fp)

    normalized: dict[str, dict[str, object]] = {}
    for key, data in raw.items():
        norm_key = _normalize_token(key)
        allowed = [str(v).upper().strip() for v in data.get("allowed_finishes", [])]
        normalized[norm_key] = {
            "material_key": key,
            "base_material": str(data.get("base_material", "UNKNOWN")),
            "allowed_finishes": allowed,
        }
    return normalized


def _resolve_material_rule(extracted_material: str | None) -> dict[str, object] | None:
    rules = _load_rules()
    token = _normalize_token(extracted_material)
    if not token:
        return None

    # Exact normalized key match first.
    if token in rules:
        return rules[token]

    # Then allow containment matches for composite labels in title blocks.
    for rule_key, rule in rules.items():
        if rule_key and (rule_key in token or token in rule_key):
            return rule
    return None


def validate_material_and_finish(
    extracted: dict[str, str | None],
) -> dict[str, object]:
    """Validate extracted material and finish against rule database."""
    material = (extracted.get("material") or "").upper().strip()
    surface_finish = (extracted.get("surface_finish") or "").upper().strip()

    rule = _resolve_material_rule(material)
    if not material or not surface_finish:
        return {
            "material": material or None,
            "surface_finish": surface_finish or None,
            "status": "UNKNOWN",
            "allowed_finishes": [],
            "base_material": None,
            "message": "Material or surface finish not found in drawing text.",
        }

    if rule is None:
        return {
            "material": material,
            "surface_finish": surface_finish,
            "status": "UNKNOWN",
            "allowed_finishes": [],
            "base_material": None,
            "message": "Material not found in rule database.",
        }

    allowed_finishes = list(rule.get("allowed_finishes", []))
    status = "PASS" if surface_finish in allowed_finishes else "FAIL"

    return {
        "material": material,
        "surface_finish": surface_finish,
        "status": status,
        "allowed_finishes": allowed_finishes,
        "base_material": rule.get("base_material"),
        "message": None,
    }
