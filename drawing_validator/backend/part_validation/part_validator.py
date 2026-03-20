from rapidfuzz import fuzz

def validate_parts_existence(
    bom: dict[int, dict[str, str | int]], 
    detected_parts: dict[str, str]
) -> list[dict]:
    """
    Validates BOM items against detected parts using fuzzy matching on the description.
    Returns a list of validation results, including warnings for extra parts not in BOM.
    """
    results = []
    matched_part_nums = set()
    
    # 1. Check each BOM item against detected parts
    for item_number, entry in bom.items():
        bom_desc = str(entry.get("description", "")).strip()
        bom_part_num = str(entry.get("part_number", "")).strip()
        
        found = False
        best_match_part = None
        best_score = 0
        
        for part_num, det_desc in detected_parts.items():
            # First, try matching by part number (more reliable)
            if bom_part_num:
                # Remove dashes or spaces for a cleaner comparison
                clean_bom_num = bom_part_num.replace("-", "").replace(" ", "").upper()
                clean_det_num = part_num.replace("-", "").replace(" ", "").upper()
                
                if clean_bom_num and (clean_bom_num in clean_det_num or clean_det_num in clean_bom_num):
                    best_match_part = part_num
                    break
            
            # Fallback to fuzzy matching description if part number didn't match
            score = fuzz.ratio(bom_desc.upper(), det_desc.upper())
            if score > 80 and score > best_score:
                best_score = score
                best_match_part = part_num
                
        if best_match_part:
            found = True
            matched_part_nums.add(best_match_part)
            
        status = "PASS" if found else "FAIL"
        
        results.append({
            "item": item_number,
            "description": f"{bom_part_num} - {bom_desc}" if bom_part_num else bom_desc,
            "part_found": found,
            "status": status
        })
        
    # 2. Detect extra parts (detected but not in BOM)
    for part_num, det_desc in detected_parts.items():
        if part_num not in matched_part_nums:
            results.append({
                "item": "-", 
                "description": f"{part_num} - {det_desc}",
                "part_found": True,
                "status": "WARNING",
            })
            
    return results
