"""
Integration Guide: PII Masking with ComplaintIQ NLP Service

This file shows how to integrate the new PII masking service
with your existing nlp_service.py and other components.
"""

# ============================================================================
# OPTION 1: Update nlp_service.py to use PII masking
# ============================================================================

"""
Example: Suggested update to backend/services/nlp_service.py

    from pii_service import mask_complaint_text
    import logging
    
    logger = logging.getLogger(__name__)
    
    class NLPService:
        
        async def analyze_complaint(self, complaint_text: str) -> dict:
            '''
            Analyze complaint with automatic PII masking.
            '''
            # Step 1: Mask PII before analysis
            masking_result = mask_complaint_text(complaint_text, enable_ner=True)
            masked_text = masking_result['masked_text']
            
            # Log masking statistics (not sensitive values!)
            logger.info(f"PII masked: {masking_result['stats']}")
            
            # Step 2: Perform analysis on masked text ONLY
            classification = self._classify_complaint(masked_text)
            sentiment = self._analyze_sentiment(masked_text)
            
            # Step 3: Return results
            return {
                'classification': classification,
                'sentiment': sentiment,
                'pii_status': {
                    'masked': True,
                    'entities_detected': masking_result['stats']
                }
            }
"""


# ============================================================================
# OPTION 2: Create wrapper in complaint routes
# ============================================================================

"""
Example: Update backend/api/routes/complaints.py

    from services.pii_service import mask_complaint_text
    from services.nlp_service import NLPService
    from fastapi import APIRouter
    
    router = APIRouter()
    nlp_service = NLPService()
    
    @router.post("/complaints")
    async def create_complaint(complaint: ComplaintRequest, db: Session):
        '''Create complaint with automatic PII masking and processing'''
        
        # Step 1: Mask PII
        masking_result = mask_complaint_text(
            complaint.text,
            enable_ner=True
        )
        
        # Step 2: Store masked complaint
        db_complaint = Complaint(
            text=masking_result['masked_text'],  # Store masked version
            category=complaint.category,
            customer_id=complaint.customer_id,
            # Note: encrypt and store rehydration_dict separately if needed
        )
        db.add(db_complaint)
        db.commit()
        
        # Step 3: Analyze (receives masked text)
        analysis = await nlp_service.analyze_complaint(
            masking_result['masked_text']
        )
        
        # Step 4: Store analysis results
        db_complaint.classification = analysis['classification']
        db_complaint.sentiment = analysis['sentiment']
        db.commit()
        
        return {
            "status": "success",
            "complaint_id": db_complaint.id,
            "pii_masked": masking_result['stats']
        }
"""


# ============================================================================
# OPTION 3: Middleware for automatic masking
# ============================================================================

"""
Example: Create backend/api/middleware/pii_masking_middleware.py

    from fastapi import Request
    from starlette.middleware.base import BaseHTTPMiddleware
    from services.pii_service import mask_complaint_text
    import json
    
    class PIIMaskingMiddleware(BaseHTTPMiddleware):
        '''Optional: Auto-mask PII in all complaint submissions'''
        
        async def dispatch(self, request: Request, call_next):
            # Only process complaint endpoints
            if '/complaints' in request.url.path and request.method == 'POST':
                body = await request.body()
                
                if body:
                    try:
                        data = json.loads(body)
                        
                        # If text field exists, mask it
                        if 'text' in data:
                            masked = mask_complaint_text(data['text'])
                            data['text_masked'] = masked['masked_text']
                            data['pii_rehydration'] = masked['rehydration']
                            
                            # Update request
                            request._body = json.dumps(data).encode()
                    except:
                        pass  # Continue if parsing fails
            
            response = await call_next(request)
            return response

    # In main.py, add middleware:
    # app.add_middleware(PIIMaskingMiddleware)
"""


# ============================================================================
# OPTION 4: Database Schema Updates
# ============================================================================

"""
Suggested schema changes:

1. Add to complaints table:
   
   ALTER TABLE complaints ADD COLUMN text_masked TEXT;
   ALTER TABLE complaints ADD COLUMN pii_detected JSONB DEFAULT '{}';
   
   CREATE INDEX idx_complaints_text_masked ON complaints(text_masked);

2. Create audit table for PII archive:
   
   CREATE TABLE complaint_pii_archive (
       id SERIAL PRIMARY KEY,
       complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
       rehydration_encrypted BYTEA NOT NULL,  -- Encrypted JSON
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       accessed_at TIMESTAMP,
       accessed_by VARCHAR(255),
       reason VARCHAR(500)
   );
   
   CREATE INDEX idx_pii_archive_complaint_id ON complaint_pii_archive(complaint_id);
   CREATE INDEX idx_pii_archive_created_at ON complaint_pii_archive(created_at);

3. Encrypt rehydration before storing:
   
   from cryptography.fernet import Fernet
   import json
   
   cipher = Fernet(encryption_key)
   encrypted = cipher.encrypt(json.dumps(rehydration).encode())
   
   archive = PIIArchive(
       complaint_id=complaint.id,
       rehydration_encrypted=encrypted
   )
"""


# ============================================================================
# OPTION 5: Complete Integration Example
# ============================================================================

"""
Full example showing all pieces working together:

    # 1. Import services
    from services.pii_service import mask_complaint_text
    from services.nlp_service import analyze_complaint
    from models.complaint import Complaint
    from database import SessionLocal
    
    # 2. FastAPI route
    @router.post("/api/complaints")
    async def create_complaint(request: ComplaintRequest):
        db = SessionLocal()
        
        try:
            # Step A: Mask PII
            masking = mask_complaint_text(
                request.text,
                enable_ner=True
            )
            
            # Step B: Create database record with masked text
            complaint = Complaint(
                customer_id=request.customer_id,
                text=masking['masked_text'],
                text_original_hash=hash(request.text),  # For auditing
                category=request.category,
                pii_detected=masking['stats'],
                status='open'
            )
            db.add(complaint)
            db.flush()  # Get ID without committing
            
            # Step C: Store encrypted rehydration (optional)
            from cryptography.fernet import Fernet
            cipher = Fernet(ENCRYPTION_KEY)
            encrypted_rehydration = cipher.encrypt(
                json.dumps(masking['rehydration']).encode()
            )
            
            pii_archive = PIIArchive(
                complaint_id=complaint.id,
                rehydration_encrypted=encrypted_rehydration
            )
            db.add(pii_archive)
            db.commit()
            
            # Step D: Analyze with masked text only
            analysis = await analyze_complaint(masking['masked_text'])
            
            # Step E: Update complaint with analysis results
            complaint.classification = analysis['classification']
            complaint.sentiment = analysis['sentiment']
            db.commit()
            
            # Step F: Return response
            return {
                'status': 'success',
                'complaint_id': complaint.id,
                'pii_masked': masking['stats'],
                'analysis': {
                    'category': analysis['classification'],
                    'sentiment': analysis['sentiment']
                }
            }
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating complaint: {str(e)}")
            raise HTTPException(status_code=500, detail="Error creating complaint")
        finally:
            db.close()
"""


# ============================================================================
# OPTION 6: Agent/Manager Route Integration
# ============================================================================

"""
Example: Update backend/api/routes/analytics.py

    from services.pii_service import get_pii_service
    
    @router.get("/analytics/complaint/{complaint_id}/details")
    async def get_complaint_details(complaint_id: int):
        '''
        Get complaint details (manager view).
        Shows masked complaint to agent/manager.
        PII archive requires separate authorization.
        '''
        
        complaint = db.query(Complaint).filter(
            Complaint.id == complaint_id
        ).first()
        
        return {
            'id': complaint.id,
            'text': complaint.text,  # Already masked in DB
            'pii_detected': complaint.pii_detected,
            'category': complaint.classification,
            'status': complaint.status,
            'note': 'This is masked complaint text for privacy protection'
        }
    
    @router.get("/analytics/complaint/{complaint_id}/original")
    async def get_complaint_original(
        complaint_id: int,
        current_user = Depends(require_manager)
    ):
        '''
        Get original complaint (requires manager authorization).
        Retrieves and decrypts rehydration data.
        '''
        
        pii_archive = db.query(PIIArchive).filter(
            PIIArchive.complaint_id == complaint_id
        ).first()
        
        if not pii_archive:
            raise HTTPException(status_code=404, detail="No PII archive found")
        
        # Decrypt rehydration
        from cryptography.fernet import Fernet
        cipher = Fernet(ENCRYPTION_KEY)
        rehydration = json.loads(
            cipher.decrypt(pii_archive.rehydration_encrypted).decode()
        )
        
        # Log access for audit
        pii_archive.accessed_at = datetime.now()
        pii_archive.accessed_by = current_user.email
        pii_archive.reason = "Complaint investigation"
        db.commit()
        
        # Rehydrate the text
        service = get_pii_service()
        original_text = service.rehydrate(
            complaint.text,
            rehydration
        )
        
        return {
            'complaint_id': complaint_id,
            'original_text': original_text,
            'accessed_by': current_user.email,
            'access_logged': True,
            'warning': 'This contains sensitive PII. Handle carefully.'
        }
"""


# ============================================================================
# OPTION 7: Testing Your Integration
# ============================================================================

"""
Example test to verify integration:

    from fastapi.testclient import TestClient
    from main import app
    
    client = TestClient(app)
    
    def test_complaint_pii_masking():
        response = client.post("/api/complaints", json={
            "text": "My account 12345678901 was compromised. Call +91-98765-43210",
            "category": "fraud",
            "customer_id": 1
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response
        assert 'complaint_id' in data
        assert 'pii_masked' in data
        assert data['pii_masked']['ACCOUNT'] == 1
        assert data['pii_masked']['PHONE'] == 1
"""


# ============================================================================
# OPTION 8: Monitoring and Logging
# ============================================================================

"""
Example: Add to your logging configuration

    import logging
    from pythonjsonlogger import jsonlogger
    
    # Create logger
    pii_logger = logging.getLogger('pii_masking')
    pii_handler = logging.FileHandler('logs/pii_masking.log')
    formatter = jsonlogger.JsonFormatter()
    pii_handler.setFormatter(formatter)
    pii_logger.addHandler(pii_handler)
    
    # In complaint submission:
    masking_result = mask_complaint_text(complaint.text)
    pii_logger.info({
        'event': 'pii_masked',
        'complaint_id': complaint.id,
        'entities': masking_result['stats'],
        'timestamp': datetime.now().isoformat()
    })
"""


# ============================================================================
# Quick Reference: File Locations
# ============================================================================

FILES = """
Core Service:
  backend/services/pii_service.py
    - PIIMaskingService class
    - All regex patterns
    - NER masking logic
    - Rehydration system

Integration Examples:
  backend/api/routes/pii_examples.py
    - FastAPI route examples
    - Usage patterns

Tests:
  backend/services/test_pii_service.py
    - 40+ test cases
    - Real-world scenarios

Documentation:
  backend/services/PII_MASKING_README.md
    - Full API reference
    - Security best practices
    - Performance tips

Quick Start:
  backend/services/QUICK_START.py
    - Setup steps
    - Basic usage
    - Troubleshooting
"""

print(FILES)
