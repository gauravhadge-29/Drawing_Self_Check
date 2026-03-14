from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ValidationResult:
    item_number: int
    description: str
    bom_qty: int
    callout_found: bool
    status: str


class ValidationEngine:
    """Compare BOM items against detected callout bubble presence."""

    def validate_callouts(
        self,
        bom: dict[int, dict[str, str | int]],
        detected_callouts: dict[int, int],
    ) -> list[ValidationResult]:
        """
        Produce one ValidationResult for every BOM item.

        Pass/fail rule: a BOM item is PASS when at least one callout bubble
        for that item number is present in the drawing, regardless of BOM qty.
        In assembly drawings a callout bubble always appears once per part
        type, not once per part instance.
        """
        results: list[ValidationResult] = []
        all_items = sorted(set(bom.keys()) | set(detected_callouts.keys()))

        for item in all_items:
            entry = bom.get(item, {})
            description = str(entry.get("description", "UNKNOWN"))
            bom_qty = int(entry.get("qty", 0))
            callout_found = detected_callouts.get(item, 0) >= 1
            status = "PASS" if callout_found else "FAIL"
            results.append(
                ValidationResult(
                    item_number=item,
                    description=description,
                    bom_qty=bom_qty,
                    callout_found=callout_found,
                    status=status,
                )
            )
        return results

    def format_report(self, results: list[ValidationResult]) -> str:
        sep = "--------------------------------"
        lines = [sep, "Drawing Validation Report", sep, ""]

        if not results:
            lines.append("No BOM items or callouts found.")
            return "\n".join(lines)

        passed = sum(1 for r in results if r.status == "PASS")
        failed = sum(1 for r in results if r.status == "FAIL")
        lines.append(f"Summary: {passed} PASS  |  {failed} FAIL")
        lines.append("")

        for result in results:
            found_text = "YES" if result.callout_found else "NO"
            lines.append(f"Item {result.item_number} \u2192 {result.description}")
            lines.append(f"  Expected Qty (BOM): {result.bom_qty}")
            lines.append(f"  Callout Found: {found_text}")
            lines.append(f"  Status: {result.status}")
            lines.append("")

        lines.append(sep)
        return "\n".join(lines).rstrip()