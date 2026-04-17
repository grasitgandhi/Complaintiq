"""
Example Integration of PII Masking Service with FastAPI

This file demonstrates how to integrate the PIIMaskingService
into your FastAPI routes and complaint processing workflow.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

from services.pii_service import get_pii_service, mask_complaint_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/complaints", tags=["complaints"])


# ============================================================================
# Pydantic Models
# ============================================================================

class ComplaintTextRequest(BaseModel):
    """Request model for masking complaint text"""
    text: str
    enable_ner: bool = True
    patterns: Optional[List[str]] = None


class MaskingResponse(BaseModel):
    """Response model for masking operation"""
    masked_text: str
    rehydration: dict
    stats: dict


class ComplaintRequest(BaseModel):
    """Model for creating a new complaint"""
    text: str
    customer_name: str
    category: str


# ============================================================================
# Route Examples
# ============================================================================

@router.post("/mask-pii")
async def mask_pii_endpoint(request: ComplaintTextRequest) -> MaskingResponse:
    """
    Mask PII in complaint text before processing.

    Example request:
    {
        "text": "Hi, my account 123456789012 has fraudulent charges. Call me at +91-98765-43210",
        "enable_ner": true,
        "patterns": ["ACCOUNT", "PHONE", "EMAIL"]
    }

    Example response:
    {
        "masked_text": "Hi, my account [ACC_NO] has fraudulent charges. Call me at [PHONE]",
        "rehydration": {
            "[ACC_NO]": ["123456789012"],
            "[PHONE]": ["+91-98765-43210"]
        },
        "stats": {
            "ACCOUNT": 1,
            "PHONE": 1
        }
    }
    """
    try:
        service = get_pii_service(use_ner=request.enable_ner)

        result = service.mask_pii(
            text=request.text,
            enable_regex=True,
            enable_ner=request.enable_ner,
            patterns=request.patterns
        )

        return MaskingResponse(
            masked_text=result.masked_text,
            rehydration=result.rehydration,
            stats=result.stats
        )
    except Exception as e:
        logger.error(f"Error masking PII: {str(e)}")
        raise HTTPException(status_code=500, detail="Error masking PII")


@router.post("/submit-with-pii-mask")
async def submit_complaint_with_masking(request: ComplaintRequest):
    """
    Submit complaint with automatic PII masking.
    The masked text is stored, original values archived separately.
    """
    try:
        # Mask the complaint text
        masking_result = mask_complaint_text(request.text, enable_ner=True)

        logger.info(
            f"Complaint submitted. PII masked: {masking_result['stats']}"
        )

        # Here, you would:
        # 1. Store masked_text in complaints table
        # 2. Store rehydration data encrypted in a separate audit table
        # 3. Use masked_text for LLM processing (NLP analysis, routing, etc.)

        return {
            "status": "success",
            "message": "Complaint submitted successfully with PII masked",
            "masked_complaint": masking_result["masked_text"],
            "pii_detected": masking_result["stats"],
            "rehydration_id": "optional-id-for-retrieval"  # In practice, save this
        }
    except Exception as e:
        logger.error(f"Error submitting complaint: {str(e)}")
        raise HTTPException(status_code=500, detail="Error submitting complaint")


@router.post("/analyze-with-masking")
async def analyze_complaint(complaint_id: int, complaint_text: str):
    """
    Example: Analyze complaint with LLM after masking PII.
    This workflow:
    1. Masks PII from complaint text
    2. Passes masked text to LLM for analysis
    3. Stores results and masked/original mapping
    """
    try:
        # Mask the complaint text
        masking_result = mask_complaint_text(complaint_text, enable_ner=True)

        # Now pass masked_text to your LLM/NLP service
        # Example: nlp_result = await nlp_service.analyze(masking_result["masked_text"])

        return {
            "complaint_id": complaint_id,
            "masked_text": masking_result["masked_text"],
            "pii_stats": masking_result["stats"],
            # "nlp_analysis": nlp_result,  # Would come from NLP service
            "note": "LLM analysis performed on masked text. PII removed for privacy."
        }
    except Exception as e:
        logger.error(f"Error analyzing complaint: {str(e)}")
        raise HTTPException(status_code=500, detail="Error analyzing complaint")


@router.get("/pii-patterns")
async def get_available_patterns():
    """
    Get information about available PII masking patterns.

    Useful for frontend to understand what PII will be masked.
    """
    service = get_pii_service()
    patterns = service.get_pattern_info()

    return {
        "patterns": patterns,
        "spacy_enabled": service.use_ner
    }


# ============================================================================
# Usage Examples (for testing)
# ============================================================================

def example_usage():
    """
    Standalone example of using PII masking service
    (not part of FastAPI routes)
    """
    service = get_pii_service(use_ner=True)

    # Example complaint text
    complaint_text = """
    Hello, I am Rajesh Kumar and my account number is 12345678901 has been 
    compromised. I made a transaction TXN20240101 but the money didn't reach.
    Please call me at +91-98765-43210 or email me at rajesh.kumar@example.com.
    My Aadhaar is 1234 5678 9012 and PAN is ABCDE1234F.
    The incident happened in Bangalore.
    """

    print("Original text:")
    print(complaint_text)
    print("\n" + "="*70 + "\n")

    # Mask PII
    result = service.mask_pii(
        text=complaint_text,
        enable_regex=True,
        enable_ner=True
    )

    print("Masked text:")
    print(result.masked_text)
    print("\n" + "="*70 + "\n")

    print("PII Statistics:")
    for entity_type, count in result.stats.items():
        print(f"  {entity_type}: {count}")
    print("\n" + "="*70 + "\n")

    print("Rehydration Dictionary:")
    for tag, values in result.rehydration.items():
        print(f"  {tag}: {values}")
    print("\n" + "="*70 + "\n")

    # Demonstrate rehydration (warning: limited accuracy)
    rehydrated = service.rehydrate(result.masked_text, result.rehydration)
    print("Rehydrated text (using simple replacement):")
    print(rehydrated)


if __name__ == "__main__":
    example_usage()
