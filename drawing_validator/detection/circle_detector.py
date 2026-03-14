from __future__ import annotations

from config import AppConfig
from utils.geometry_utils import classify_diameter, deduplicate_circles


def _is_dashed(curve: dict) -> bool:
    dash = curve.get("dash")
    return bool(dash and dash[0])


def _curve_to_circle_candidate(curve: dict, config: AppConfig) -> dict | None:
    x0 = float(curve.get("x0", 0.0))
    x1 = float(curve.get("x1", 0.0))
    top = float(curve.get("top", 0.0))
    bottom = float(curve.get("bottom", 0.0))
    linewidth = float(curve.get("linewidth", 0.0) or 0.0)

    width = abs(x1 - x0)
    height = abs(bottom - top)
    diameter = (width + height) / 2.0
    dashed = _is_dashed(curve)

    if linewidth < config.detection.min_linewidth or linewidth > config.detection.max_linewidth:
        return None
    if dashed and not config.detection.allow_dashed:
        return None
    if diameter < config.detection.min_diameter_mm or diameter > config.detection.max_diameter_mm:
        return None
    if abs(width - height) > config.detection.circularity_tolerance_mm:
        return None

    return {
        "center": ((x0 + x1) / 2.0, (top + bottom) / 2.0),
        "diameter": diameter,
        "linewidth": linewidth,
        "dashed": dashed,
        "bbox": (x0, top, x1, bottom),
    }


def detect_circles_from_curves(curves: list[dict], config: AppConfig) -> list[dict]:
    """Convert curve objects into filtered circular feature detections."""
    detected_circles: list[dict] = []
    for curve in curves:
        candidate = _curve_to_circle_candidate(curve, config)
        if candidate is not None:
            detected_circles.append(candidate)

    return deduplicate_circles(
        detected_circles,
        duplicate_center_tolerance=config.detection.duplicate_center_tolerance_mm,
    )


def classify_circles(circles: list[dict], config: AppConfig) -> list[dict]:
    """Attach a feature classification to each detected circle using toleranced rules."""
    classified: list[dict] = []
    for circle in circles:
        feature_rule = classify_diameter(circle["diameter"], config.feature_rules)
        classified.append(
            {
                **circle,
                "feature_key": feature_rule.key if feature_rule else None,
                "feature_name": feature_rule.display_name if feature_rule else "Unclassified Feature",
            }
        )
    return classified