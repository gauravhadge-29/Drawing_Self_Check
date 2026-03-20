import sys
import pdfplumber

pdf_path = sys.argv[1]

with open("pdf_text.txt", "w", encoding="utf-8") as f:
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            f.write(f"--- Page {i+1} ---\n")
            f.write(page.extract_text() or "")
            f.write("\n\n")
