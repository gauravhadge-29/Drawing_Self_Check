from __future__ import annotations

from collections import defaultdict
from math import dist

from config import FeatureRule


def deduplicate_circles(
    circles: list[dict],
    duplicate_center_tolerance: float,
) -> list[dict]:
    unique_circles: list[dict] = []
    for circle in circles:
        is_duplicate = False
        for existing in unique_circles:
            if dist(circle["center"], existing["center"]) <= duplicate_center_tolerance:
                is_duplicate = True
                break
        if not is_duplicate:
            unique_circles.append(circle)
    return unique_circles


def group_circles_by_diameter(
    circles: list[dict],
    tolerance: float,
) -> dict[float, list[dict]]:
    grouped: dict[float, list[dict]] = {}
    for circle in sorted(circles, key=lambda item: item["diameter"]):
        matched_key = None
        for diameter in grouped:
            if abs(circle["diameter"] - diameter) <= tolerance:
                matched_key = diameter
                break
        if matched_key is None:
            grouped[circle["diameter"]] = [circle]
        else:
            grouped[matched_key].append(circle)
    return grouped


def classify_diameter(
    diameter: float,
    feature_rules: tuple[FeatureRule, ...],
) -> FeatureRule | None:
    for rule in feature_rules:
        if abs(diameter - rule.nominal_diameter) <= rule.tolerance:
            return rule
    return None


def summarize_classified_circles(circles: list[dict]) -> dict[str, int]:
    summary: defaultdict[str, int] = defaultdict(int)
    for circle in circles:
        if circle.get("feature_key"):
            summary[circle["feature_key"]] += 1
    return dict(summary)