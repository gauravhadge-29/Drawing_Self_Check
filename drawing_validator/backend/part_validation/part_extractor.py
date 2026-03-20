import re
import pdfplumber
from pathlib import Path

def extract_parts_from_pages(pdf_path: str | Path) -> dict[str, str]:
    """
    Iterates through all pages (except page 1) of the PDF.
    Extracts PART NUMBER and DESCRIPTION using regex.
    Returns a dictionary mapping detected part numbers to their descriptions.
    """
    detected_parts = {}
    
    # Matches "PART NUMBER: XXXXX" or "PART NO: XXXXX" or "PART NO - XXXXX"
    part_num_regex = re.compile(r"PART\s*(?:NUMBER|NO\.?)\s*[:\-]\s*([A-Z0-9\-]+)", re.IGNORECASE)
    # Matches "DESCRIPTION: XXXXX" or "DESCRIPTION - XXXXX"
    desc_regex = re.compile(r"DESCRIPTION\s*[:\-]\s*(.+)", re.IGNORECASE)
    
    with pdfplumber.open(pdf_path) as pdf:
        # Skip page 1 (index 0) which is Assembly Drawing
        for i, page in enumerate(pdf.pages[1:], start=2):
            text = page.extract_text()
            if not text:
                continue
                
            part_matches = list(part_num_regex.finditer(text))
            desc_matches = list(desc_regex.finditer(text))
            
            for pt_match in part_matches:
                part_num = pt_match.group(1).strip()
                pt_start = pt_match.start()
                
                # Pair with the immediately following description
                desc = "UNKNOWN DESCRIPTION"
                for d_match in desc_matches:
                    if d_match.start() > pt_start:
                        desc = d_match.group(1).strip()
                        break
                        
                detected_parts[part_num] = desc
                
    return detected_parts
