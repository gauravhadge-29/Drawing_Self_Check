from __future__ import annotations

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def draw_bom_table(pdf: canvas.Canvas) -> None:
    left = 340
    bottom = 70
    row_height = 20
    col_widths = [40, 100, 140, 40]
    rows = [
        ["ITEM", "PART NUMBER", "DESCRIPTION", "QTY"],
        ["1", "CL-011", "CLEARANCE HOLE", "3"],
        ["2", "DW-008", "DOWEL", "2"],
        ["3", "HL-006", "HOLE", "4"],
        ["4", "BP-001", "BASE PLATE", "1"],
    ]

    total_width = sum(col_widths)
    total_height = row_height * len(rows)

    pdf.setLineWidth(1)
    pdf.rect(left, bottom, total_width, total_height)

    x = left
    for width in col_widths[:-1]:
        x += width
        pdf.line(x, bottom, x, bottom + total_height)

    for index in range(1, len(rows)):
        y = bottom + row_height * index
        pdf.line(left, y, left + total_width, y)

    pdf.setFont("Helvetica", 9)
    for row_index, row in enumerate(rows):
        y = bottom + total_height - (row_index + 0.7) * row_height
        x = left + 4
        for col_index, value in enumerate(row):
            pdf.drawString(x, y, value)
            x += col_widths[col_index]


def draw_feature(pdf: canvas.Canvas, center_x: float, center_y: float, diameter: float) -> None:
    pdf.setLineWidth(0.8)
    pdf.circle(center_x, center_y, diameter / 2.0, stroke=1, fill=0)


def draw_callout(pdf: canvas.Canvas, center_x: float, center_y: float, item_number: str) -> None:
    pdf.saveState()
    pdf.setDash(3, 2)
    pdf.setLineWidth(0.6)
    pdf.circle(center_x, center_y, 7, stroke=1, fill=0)
    pdf.restoreState()
    pdf.setFont("Helvetica", 8)
    pdf.drawCentredString(center_x, center_y - 3, item_number)


def main() -> None:
    pdf = canvas.Canvas("sample_drawing.pdf", pagesize=A4)
    width, height = A4

    pdf.setTitle("Sample Engineering Drawing")
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(40, height - 40, "AUTOMATED ENGINEERING DRAWING VALIDATION SAMPLE")

    pdf.setFont("Helvetica", 10)
    pdf.drawString(40, height - 65, "Plate layout with ruled BOM and item callouts")

    pdf.setLineWidth(1.2)
    pdf.rect(60, 260, 220, 220)

    clearance_holes = [(100, 420), (170, 420), (135, 340)]
    dowel_holes = [(240, 420)]
    standard_holes = [(95, 290), (135, 290), (175, 290), (215, 290)]

    for center_x, center_y in clearance_holes:
        draw_feature(pdf, center_x, center_y, 11)

    for center_x, center_y in dowel_holes:
        draw_feature(pdf, center_x, center_y, 8)

    for center_x, center_y in standard_holes:
        draw_feature(pdf, center_x, center_y, 6)

    draw_callout(pdf, 300, 450, "1")
    draw_callout(pdf, 300, 410, "2")
    draw_callout(pdf, 300, 370, "3")
    pdf.line(293, 446, 176, 424)
    pdf.line(293, 406, 244, 423)
    pdf.line(293, 366, 216, 292)

    draw_bom_table(pdf)
    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    main()