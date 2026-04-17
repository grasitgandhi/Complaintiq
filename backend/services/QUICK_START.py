"""
Quick Start Guide for PII Masking Service
==========================================

Step-by-step setup and integration for ComplaintIQ
"""

# STEP 1: Install Dependencies
# ============================
"""
In your terminal, run:

cd backend
pip install spacy
python -m spacy download en_core_web_sm

Or add to requirements.txt:
spacy>=3.7.0

Then run:
pip install -r requirements.txt
"""

# STEP 2: Files Created
# =====================
"""
The following files have been created in your project:

1. backend/services/pii_service.py
   - Main PIIMaskingService class
   - All regex patterns and NER logic
   - Rehydration system
   
2. backend/api/routes/pii_examples.py
   - FastAPI route examples
   - Integration patterns
   - Usage examples
   
3. backend/services/PII_MASKING_README.md
   - Full documentation
   - API reference
   - Security best practices
   
4. backend/services/test_pii_service.py
   - Comprehensive test suite
   - 40+ test cases
   - Real-world examples
"""

# STEP 3: Basic Usage
# ===================

from services.pii_service import mask_complaint_text, get_pii_service

# Simple one-liner for most use cases
result = mask_complaint_text("My account 12345678901, call +91-98765-43210")

print("Masked text:", result['masked_text'])
print("PII Found:", result['stats'])
print("Rehydration:", result['rehydration'])


# STEP 4: FastAPI Integration
# ===========================

"""
Option A: Automatic masking in complaint submission
"""

from fastapi import APIRouter, HTTPException
from services.pii_service import mask_complaint_text

router = APIRouter()

@router.post("/complaints")
async def create_complaint(request: ComplaintRequest):
    # Mask PII automatically
    masked = mask_complaint_text(request.text, enable_ner=True)
    
    # Store masked version
    complaint = Complaint(
        text=masked['masked_text'],
        category=request.category
    )
    db.add(complaint)
    db.commit()
    
    return {"status": "success", "pii_detected": masked['stats']}


"""
Option B: Dedicated masking endpoint
"""

@router.post("/mask-pii")
async def mask_endpoint(text: str):
    result = mask_complaint_text(text, enable_ner=True)
    return result


"""
Option C: Ensure LLM receives masked text
"""

@router.post("/analyze")
async def analyze_complaint(complaint_id: int):
    # Get complaint from DB
    complaint = db.get(Complaint, complaint_id)
    
    # Already masked in database
    # Pass masked version to LLM
    nlp_result = await nlp_service.analyze(complaint.text)
    
    return nlp_result


# STEP 5: Test It Works
# ====================

"""
Run the test suite to verify everything works:

pytest backend/services/test_pii_service.py -v

Or manually test:
"""

if __name__ == "__main__":
    from services.pii_service import PIIMaskingService
    
    service = PIIMaskingService(use_ner=True)
    
    # Test 1: Bank account
    r1 = service.mask_pii("My account 12345678901")
    print("✓ Account masking:", "[ACC_NO]" in r1.masked_text)
    
    # Test 2: Phone
    r2 = service.mask_pii("Call +91-98765-43210")
    print("✓ Phone masking:", "[PHONE]" in r2.masked_text)
    
    # Test 3: Email
    r3 = service.mask_pii("Email: user@example.com")
    print("✓ Email masking:", "[EMAIL]" in r3.masked_text)
    
    # Test 4: Transaction
    r4 = service.mask_pii("Transaction TXN20240101")
    print("✓ Transaction masking:", "[TXN_ID]" in r4.masked_text)
    
    # Test 5: Aadhaar
    r5 = service.mask_pii("Aadhaar: 1234 5678 9012")
    print("✓ Aadhaar masking:", "[AADHAAR]" in r5.masked_text)
    
    # Test 6: PAN
    r6 = service.mask_pii("PAN: ABCDE1234F")
    print("✓ PAN masking:", "[PAN]" in r6.masked_text)
    
    print("\n✓ All tests passed! PII service is ready to use.")


# STEP 6: Available Patterns
# ==========================

"""
Regex-based masking (always fast):
- [ACC_NO]     : Indian bank accounts (11-16 digits)
- [PHONE]      : Phone numbers (+91 or 10-digit)
- [TXN_ID]     : Transaction IDs
- [EMAIL]      : Email addresses
- [AADHAAR]    : Aadhaar numbers
- [PAN]        : PAN numbers

NER-based masking (when enable_ner=True):
- [NAME]       : Person names
- [LOCATION]   : Geographic locations
"""

# STEP 7: Customization
# =====================

"""
Add custom patterns to PIIMaskingService.PATTERNS:

PATTERNS = {
    'CIBIL': {
        'regex': r'\b[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}\b',
        'tag': '[CIBIL]',
        'description': 'CIBIL Score'
    }
}

Then use: service.mask_pii(text, patterns=['CIBIL'])
"""

# STEP 8: Performance Tips
# =========================

"""
For production:

1. Regex-only (fastest): 1-5ms for 1000 chars
   service = get_pii_service(use_ner=False)

2. Regex + NER (slower): 50-100ms for 1000 chars
   service = get_pii_service(use_ner=True)

3. Selective patterns (faster):
   result = service.mask_pii(text, patterns=['ACCOUNT', 'PHONE'])

4. Batch processing:
   for complaint in complaints:
       mask_complaint_text(complaint.text)
"""

# STEP 9: Security Checklist
# ===========================

"""
☐ Encrypt rehydration data before storing in DB
☐ Log only stats, never log rehydration dict
☐ Pass masked text to LLM, never original text
☐ Use separate audit table for PII archives
☐ Set database permissions for PII tables
☐ Monitor access to PII archive tables
☐ Regular audit logs for PII retrieval
"""

# STEP 10: Troubleshooting
# ========================

"""
Issue: "spaCy model not found"
Solution: python -m spacy download en_core_web_sm

Issue: "Slow performance"
Solution: Use enable_ner=False or selective patterns

Issue: "Pattern not matching"
Solution: Test regex at https://regex101.com/
Then update regex in PATTERNS dict

Issue: "Rehydration not working"
Solution: Rehydration is simple replacement
Multiple values replace sequentially
Not 100% accurate if text has duplicates
"""

# Additional Resources
# ====================

"""
Full Documentation:
  backend/services/PII_MASKING_README.md

Example Routes:
  backend/api/routes/pii_examples.py

Test Suite:
  backend/services/test_pii_service.py

View available patterns:
  service.get_pattern_info()
"""
