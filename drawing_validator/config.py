from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class FeatureRule:
    key: str
    display_name: str
    nominal_diameter: float
    tolerance: float
    bom_keywords: tuple[str, ...]


@dataclass(frozen=True)
class DetectionConfig:
    min_linewidth: float = 0.2
    max_linewidth: float = 2.0
    allow_dashed: bool = False
    min_diameter_mm: float = 4.0
    max_diameter_mm: float = 20.0
    diameter_tolerance_mm: float = 0.5
    duplicate_center_tolerance_mm: float = 1.0
    circularity_tolerance_mm: float = 0.75


@dataclass(frozen=True)
class TableConfig:
    vertical_strategy: str = "lines"
    horizontal_strategy: str = "lines"
    snap_tolerance: float = 3.0
    intersection_tolerance: float = 3.0


@dataclass(frozen=True)
class CalloutConfig:
    # -----------------------------------------------------------------------
    # Vector-based detection (primary method, no external binary needed).
    # Units are PDF points (1 pt = 1/72 inch ≈ 0.353 mm).
    # -----------------------------------------------------------------------
    # Diameter range for callout bubble circles in the vector drawing.
    min_callout_diameter_pt: float = 12.0   # ≈4 mm
    max_callout_diameter_pt: float = 35.0   # ≤12 mm
    # Allowed difference between circle width and height (roundness check).
    circularity_tolerance_pt: float = 4.0

    # -----------------------------------------------------------------------
    # Image-based fallback (requires Tesseract OCR binary).
    # -----------------------------------------------------------------------
    render_dpi: int = 150
    min_radius_px: int = 12
    max_radius_px: int = 40
    min_dist_px: int = 20
    hough_param1: float = 80.0
    hough_param2: float = 25.0


@dataclass(frozen=True)
class AppConfig:
    detection: DetectionConfig = field(default_factory=DetectionConfig)
    table: TableConfig = field(default_factory=TableConfig)
    callout: CalloutConfig = field(default_factory=CalloutConfig)
    feature_rules: tuple[FeatureRule, ...] = (
        FeatureRule(
            key="hole",
            display_name="Ø6 Hole",
            nominal_diameter=6.0,
            tolerance=0.6,
            bom_keywords=("HOLE",),
        ),
        FeatureRule(
            key="dowel",
            display_name="Ø8 Dowel Hole",
            nominal_diameter=8.0,
            tolerance=0.6,
            bom_keywords=("DOWEL",),
        ),
        FeatureRule(
            key="clearance_hole",
            display_name="Ø11 Clearance Hole",
            nominal_diameter=11.0,
            tolerance=0.7,
            bom_keywords=("CLEARANCE",),
        ),
    )


DEFAULT_CONFIG = AppConfig()