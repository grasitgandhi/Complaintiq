# PII Masking Service for ComplaintIQ

A robust, reusable Python utility to mask Personally Identifiable Information (PII) from customer complaint text before LLM processing. Supports regex-based masking and optional spaCy NER.

## Features

- ✅ **Regex-based masking** for Indian-specific formats:
  - Bank Account Numbers (11-16 digits)
  - Phone Numbers (+91 or 10-digit formats)
  - Transaction IDs (alphanumeric patterns)
  - Email addresses
  - Aadhaar numbers
  - PAN (Permanent Account Number)

- ✅ **Optional spaCy NER** for:
  - Person names
  - Locations/Geographic entities

- ✅ **Rehydration system**: Map masked tags back to original values for audit trails

- ✅ **Statistics tracking**: Know what PII was detected

- ✅ **FastAPI-ready**: Easy integration with your existing API routes

- ✅ **Singleton pattern**: Efficient resource usage with cached service instance

## Installation

### 1. Add dependencies to `backend/requirements.txt`

```bash
# Add these lines to requirements.txt
spacy>=3.7.0
```

### 2. Install requirements

```bash
cd backend
pip install -r requirements.txt
```

### 3. Download spaCy model (for NER support)

```bash
# This is required for Name and Location masking
python -m spacy download en_core_web_sm
```

## Usage

### Basic Usage - Regex Only

```python
from services.pii_service import get_pii_service

service = get_pii_service(use_ner=False)  # Disable NER for faster processing

result = service.mask_pii(
    text="My account 12345678901 and phone +91-98765-43210",
    enable_ner=False
)

print(result.masked_text)      # "My account [ACC_NO] and phone [PHONE]"
print(result.rehydration)      # {[ACC_NO]: ['12345678901'], [PHONE]: ['+91-98765-43210']}
print(result.stats)            # {ACCOUNT: 1, PHONE: 1}
```

### Advanced Usage - Regex + NER

```python
service = get_pii_service(use_ner=True)

result = service.mask_pii(
    text="Rajesh Kumar from Mumbai made transaction TXN2024001",
    enable_regex=True,
    enable_ner=True
)

print(result.masked_text)  # "[NAME] from [LOCATION] made transaction [TXN_ID]"
print(result.stats)        # {TRANSACTION: 1, PERSON: 1, LOCATION: 1}
```

### Selective Pattern Masking

```python
# Only mask specific patterns
result = service.mask_pii(
    text="Account: 12345678901, Phone: +91-98765-43210, Email: user@example.com",
    patterns=['ACCOUNT', 'PHONE']  # Only mask these
)

# Email will NOT be masked
print(result.masked_text)  # Will have [ACC_NO] and [PHONE], but email preserved
```

### Using Convenience Function

```python
from services.pii_service import mask_complaint_text

masking_result = mask_complaint_text(
    text="My complaint text with sensitive data...",
    enable_ner=True
)

# Returns dict: {masked_text, rehydration, stats}
print(masking_result['masked_text'])
print(masking_result['rehydration'])
print(masking_result['stats'])
```

### Rehydration (Restoring Original Values)

```python
# Get back original values (useful for audit trails)
service = get_pii_service()

# After masking...
original_text = service.rehydrate(
    masked_text="My account [ACC_NO] has [TXN_ID]",
    rehydration={
        '[ACC_NO]': ['12345678901'],
        '[TXN_ID]': ['TXN2024001']
    }
)

print(original_text)  # "My account 12345678901 has TXN2024001"
```

## FastAPI Integration

### 1. Add route to your complaints router

```python
# In backend/api/routes/complaints.py

from services.pii_service import mask_complaint_text

@router.post("/submit")
async def create_complaint(complaint: ComplaintRequest):
    # Mask PII before processing
    masking_result = mask_complaint_text(complaint.text, enable_ner=True)
    
    # Store masked text in database
    db_complaint = Complaint(
        text=masking_result['masked_text'],  # Store masked version
        category=complaint.category,
        # Store rehydration securely if needed (encrypted)
    )
    db.add(db_complaint)
    db.commit()
    
    return {
        "status": "success",
        "pii_detected": masking_result['stats']
    }
```

### 2. Use in NLP/LLM processing

```python
# Ensure LLM receives masked text only
from services.nlp_service import analyze_complaint
from services.pii_service import mask_complaint_text

def process_complaint(complaint_text: str):
    # Mask PII first
    masked = mask_complaint_text(complaint_text, enable_ner=True)
    
    # Pass only masked text to LLM
    nlp_result = analyze_complaint(masked['masked_text'])
    
    return nlp_result
```

### 3. Example endpoint

```python
# See backend/api/routes/pii_examples.py for full examples including:
# - POST /api/complaints/mask-pii
# - POST /api/complaints/submit-with-pii-mask
# - POST /api/complaints/analyze-with-masking
# - GET /api/complaints/pii-patterns
```

## Available Masking Patterns

| Pattern | Regex | Tag | Example Match |
|---------|-------|-----|---|
| **ACCOUNT** | `\b\d{11,16}\b` | `[ACC_NO]` | 12345678901 |
| **PHONE** | `(\+91[\s-]?\|0)?[6-9]\d{9}` | `[PHONE]` | +91-98765-43210 |
| **TRANSACTION** | `\b[A-Z]{2,4}\d{8,16}\b` | `[TXN_ID]` | TXN20240101 |
| **EMAIL** | Standard email regex | `[EMAIL]` | user@example.com |
| **AADHAAR** | `\d{4}[\s-]?\d{4}[\s-]?\d{4}` | `[AADHAAR]` | 1234 5678 9012 |
| **PAN** | `[A-Z]{5}[0-9]{4}[A-Z]{1}` | `[PAN]` | ABCDE1234F |
| **PERSON** (NER) | spaCy NER | `[NAME]` | Rajesh Kumar |
| **LOCATION** (NER) | spaCy NER | `[LOCATION]` | Mumbai, Bangalore |

## Performance Considerations

### Speed Comparison

- **Regex only**: ~1-5ms for 1000 chars (fastest)
- **Regex + NER**: ~50-100ms for 1000 chars (requires model loading)

### Memory Usage

- **Without NER**: ~5MB
- **With NER**: ~40-50MB (spaCy model in memory)

### Optimization Tips

```python
# Production: Use singleton instance (automatic)
service = get_pii_service(use_ner=True)  # Cached after first call

# For batch processing, disable NER if only regex needed
for complaint in complaints:
    result = service.mask_pii(complaint, enable_ner=False)

# Or selectively mask only needed patterns
result = service.mask_pii(
    text=complaint,
    patterns=['ACCOUNT', 'PHONE']  # Skip expensive patterns
)
```

## Rehydration Dictionary Format

```python
rehydration = {
    '[ACC_NO]': ['12345678901', '98765432101'],     # Multiple values
    '[PHONE]': ['+91-98765-43210'],
    '[TXN_ID]': ['TXN20240101', 'TXN20240102'],
    '[NAME]': ['Rajesh Kumar', 'Priya Singh'],
    '[LOCATION]': ['Mumbai', 'Bangalore']
}
```

**Important Notes**:
- Each tag maps to a LIST of original values (for multiple occurrences)
- Use rehydration for audit trails and compliance
- Consider encrypting rehydration data in database
- Don't log rehydration data in plaintext

## Security Best Practices

### 1. Encrypt Sensitive Data

```python
# Store rehydration encrypted
from cryptography.fernet import Fernet

cipher_suite = Fernet(key)
encrypted_rehydration = cipher_suite.encrypt(
    json.dumps(result.rehydration).encode()
)

# Store in database
complaint.rehydration_encrypted = encrypted_rehydration
```

### 2. Log Only Stats, Not Values

```python
# ✅ GOOD: Log statistics only
logger.info(f"PII detected: {result.stats}")

# ❌ AVOID: Never log original values
logger.info(f"PII detected: {result.rehydration}")  # BAD!
```

### 3. Use Masked Text for LLM

```python
# Always pass masked text to external LLM services
llm_response = await llm_service.analyze(result.masked_text)

# Never pass original text to untrusted services
```

### 4. Database Schema

```sql
-- Store masked complaints
ALTER TABLE complaints ADD COLUMN text_masked TEXT;

-- Store rehydration separately (encrypted)
CREATE TABLE complaint_pii_archive (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id),
    rehydration_encrypted BYTEA,  -- Encrypted JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Run the example script

```bash
cd backend
python -c "from api.routes.pii_examples import example_usage; example_usage()"
```

### Expected output shows:
- Original complaint text
- Masked version with tags
- PII statistics
- Rehydration dictionary

### Test specific patterns

```python
from services.pii_service import get_pii_service

service = get_pii_service(use_ner=False)

# Test each pattern
test_cases = {
    "Account": "My account is 12345678901",
    "Phone": "Call me at +91-98765-43210",
    "Transaction": "Transaction TXN20240101 failed",
    "Email": "Contact user@example.com",
    "Aadhaar": "Aadhaar: 1234 5678 9012",
    "PAN": "PAN: ABCDE1234F"
}

for pattern_name, text in test_cases.items():
    result = service.mask_pii(text, patterns=[pattern_name.upper()])
    print(f"{pattern_name}: {result.masked_text}")
```

## Troubleshooting

### spaCy model not found error

```bash
# Solution: Download the model
python -m spacy download en_core_web_sm

# Verify installation
python -c "import spacy; nlp = spacy.load('en_core_web_sm'); print('OK')"
```

### Slow performance with NER

```python
# Disable NER for non-critical operations
result = service.mask_pii(text, enable_ner=False)

# Or use regex-only service
service = get_pii_service(use_ner=False)
```

### Empty rehydration dictionary

```python
# Check if patterns matched
result = service.mask_pii(text)
print(result.stats)  # See what was found

# If empty, test your regex patterns
import re
regex = r'\b\d{11,16}\b'
matches = re.findall(regex, "My account 12345678901")
print(matches)  # Debug regex matching
```

## API Reference

### PIIMaskingService

#### `mask_pii(text, enable_regex=True, enable_ner=True, patterns=None)`

Mask PII in text using regex and/or NER.

**Parameters:**
- `text` (str): Input text to mask
- `enable_regex` (bool): Enable regex-based masking
- `enable_ner` (bool): Enable spaCy NER masking
- `patterns` (List[str]): Specific patterns to use

**Returns:** `MaskingResult` object with:
- `masked_text` (str): Text with PII replaced by tags
- `rehydration` (Dict): Maps tags to original values
- `stats` (Dict): Count of masked entities by type

#### `rehydrate(masked_text, rehydration)`

Rehydrate masked text with original values.

#### `get_pattern_info()`

Get information about available masking patterns.

### Helper Functions

#### `get_pii_service(use_ner=True)`

Get or create PII service singleton instance.

#### `mask_complaint_text(text, enable_ner=True)`

Convenience function. Returns dict suitable for JSON response.

## Integration Checklist

- [ ] Add `spacy>=3.7.0` to `requirements.txt`
- [ ] Run `pip install -r requirements.txt` and `python -m spacy download en_core_web_sm`
- [ ] Copy `pii_service.py` to `backend/services/`
- [ ] Copy example routes from `pii_examples.py` (or see them for reference)
- [ ] Update complaint routes to use `mask_complaint_text()`
- [ ] Update NLP service to receive masked text only
- [ ] Add database schema for encrypted rehydration storage
- [ ] Test with your complaint data
- [ ] Document rehydration handling in your API docs

## Contributing

To add custom patterns:

```python
# In PIIMaskingService.PATTERNS dict, add:
'CUSTOM_ID': {
    'regex': r'your-regex-here',
    'tag': '[CUSTOM]',
    'description': 'Custom identifier'
}
```

Then use: `service.mask_pii(text, patterns=['CUSTOM_ID'])`

## License

Part of ComplaintIQ system. Use as internal utility.
