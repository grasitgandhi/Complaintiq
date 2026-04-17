"""
PII (Personally Identifiable Information) Masking Service
Masks sensitive customer data in complaint text before LLM processing.
Supports regex-based masking and optional spaCy NER.
"""

import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
import logging

logger = logging.getLogger(__name__)

# Optional spaCy import with graceful fallback
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    logger.warning("spaCy not installed. NER-based masking will be disabled.")


@dataclass
class MaskingResult:
    """Result of PII masking operation"""
    masked_text: str
    rehydration: Dict[str, List[str]]  # Maps tags to original values
    stats: Dict[str, int]  # Count of masked entities


class PIIMaskingService:
    """Service to detect and mask PII in complaint text"""

    # Regex patterns for Indian banking context
    PATTERNS = {
        'ACCOUNT': {
            'regex': r'\b\d{11,16}\b',  # Indian bank accounts: 11-16 digits
            'tag': '[ACC_NO]',
            'description': 'Indian Bank Account Number'
        },
        'PHONE': {
            'regex': r'(\+91[\s-]?|0)?[6-9]\d{9}\b',  # Indian phone numbers
            'tag': '[PHONE]',
            'description': 'Phone Number'
        },
        'TRANSACTION': {
            'regex': r'\b[A-Z]{2,4}\d{8,16}\b',  # Transaction ID: 2-4 letters + 8-16 digits
            'tag': '[TXN_ID]',
            'description': 'Transaction ID'
        },
        'EMAIL': {
            'regex': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'tag': '[EMAIL]',
            'description': 'Email Address'
        },
        'AADHAAR': {
            'regex': r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',  # Aadhaar format
            'tag': '[AADHAAR]',
            'description': 'Aadhaar Number'
        },
        'PAN': {
            'regex': r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b',  # PAN format
            'tag': '[PAN]',
            'description': 'PAN Number'
        }
    }

    def __init__(self, use_ner: bool = True, spacy_model: str = 'en_core_web_sm'):
        """
        Initialize PII Masking Service

        Args:
            use_ner: If True, load spaCy model for NER-based masking
            spacy_model: spaCy model to load (requires: python -m spacy download en_core_web_sm)
        """
        self.use_ner = use_ner and SPACY_AVAILABLE
        self.nlp = None

        if self.use_ner:
            try:
                self.nlp = spacy.load(spacy_model)
                logger.info(f"Loaded spaCy model: {spacy_model}")
            except OSError:
                logger.warning(
                    f"spaCy model '{spacy_model}' not found. "
                    f"Install with: python -m spacy download {spacy_model}"
                )
                self.use_ner = False

    def mask_pii(
        self,
        text: str,
        enable_regex: bool = True,
        enable_ner: bool = True,
        patterns: Optional[List[str]] = None
    ) -> MaskingResult:
        """
        Mask PII in text using regex and/or NER

        Args:
            text: Input text to mask
            enable_regex: Enable regex-based masking
            enable_ner: Enable spaCy NER-based masking (requires spaCy model)
            patterns: Specific patterns to use (default: all). 
                     Options: 'ACCOUNT', 'PHONE', 'TRANSACTION', 'EMAIL', 'AADHAAR', 'PAN'

        Returns:
            MaskingResult with masked text, rehydration dict, and statistics
        """
        masked_text = text
        rehydration: Dict[str, List[str]] = {}
        stats: Dict[str, int] = {}

        # Determine which patterns to use
        patterns_to_use = patterns if patterns else list(self.PATTERNS.keys())

        # Apply regex-based masking
        if enable_regex:
            masked_text, regex_rehydration, regex_stats = self._apply_regex_masking(
                masked_text, patterns_to_use
            )
            rehydration.update(regex_rehydration)
            stats.update(regex_stats)

        # Apply NER-based masking
        if enable_ner and self.use_ner:
            masked_text, ner_rehydration, ner_stats = self._apply_ner_masking(masked_text)
            rehydration.update(ner_rehydration)
            stats.update(ner_stats)

        return MaskingResult(
            masked_text=masked_text,
            rehydration=rehydration,
            stats=stats
        )

    def _apply_regex_masking(
        self,
        text: str,
        patterns: List[str]
    ) -> Tuple[str, Dict[str, List[str]], Dict[str, int]]:
        """Apply regex-based masking to text"""
        masked_text = text
        rehydration: Dict[str, List[str]] = {}
        stats: Dict[str, int] = {}

        for pattern_name in patterns:
            if pattern_name not in self.PATTERNS:
                logger.warning(f"Unknown pattern: {pattern_name}")
                continue

            pattern_info = self.PATTERNS[pattern_name]
            regex = pattern_info['regex']
            tag = pattern_info['tag']

            # Find all matches
            matches = re.finditer(regex, masked_text, re.IGNORECASE)
            found_values = []

            for match in matches:
                found_values.append(match.group(0))

            # Replace all matches with tag
            masked_text = re.sub(regex, tag, masked_text, flags=re.IGNORECASE)

            # Store in rehydration dict if values found
            if found_values:
                rehydration[tag] = found_values
                stats[pattern_name] = len(found_values)

        return masked_text, rehydration, stats

    def _apply_ner_masking(
        self,
        text: str
    ) -> Tuple[str, Dict[str, List[str]], Dict[str, int]]:
        """Apply spaCy NER-based masking to text"""
        if not self.nlp:
            return text, {}, {}

        doc = self.nlp(text)
        masked_text = text
        rehydration: Dict[str, List[str]] = {}
        stats: Dict[str, int] = {}

        # Track entities by type
        entities_by_type: Dict[str, List[Tuple[str, int, int]]] = {}

        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                tag = '[NAME]'
                key = 'PERSON'
            elif ent.label_ in ['GPE', 'LOC']:  # Geo-political entity or Location
                tag = '[LOCATION]'
                key = 'LOCATION'
            else:
                continue

            if key not in entities_by_type:
                entities_by_type[key] = []

            entities_by_type[key].append((ent.text, ent.start_char, ent.end_char))

        # Replace entities from end to start to maintain character positions
        offset = 0
        for entity_type in entities_by_type:
            entities = sorted(
                entities_by_type[entity_type],
                key=lambda x: x[1],
                reverse=True
            )

            tag = '[NAME]' if entity_type == 'PERSON' else '[LOCATION]'

            for entity_text, start, end in entities:
                # Adjust positions based on previous replacements
                masked_text = masked_text[:start] + tag + masked_text[end:]

                # Store in rehydration
                if tag not in rehydration:
                    rehydration[tag] = []
                    stats[entity_type] = 0

                if entity_text not in rehydration[tag]:
                    rehydration[tag].append(entity_text)
                    stats[entity_type] += 1

        return masked_text, rehydration, stats

    def rehydrate(self, masked_text: str, rehydration: Dict[str, List[str]]) -> str:
        """
        Rehydrate masked text by replacing tags with original values.
        Note: This replaces tags sequentially, so it works best for non-overlapping entities.

        Args:
            masked_text: Text with masking tags
            rehydration: Dictionary mapping tags to original values

        Returns:
            Text with original values restored (limited functionality)
        """
        rehydrated_text = masked_text

        for tag, values in rehydration.items():
            # Replace tags sequentially with original values
            for value in values:
                rehydrated_text = rehydrated_text.replace(tag, value, 1)

        return rehydrated_text

    def get_pattern_info(self) -> Dict[str, Dict]:
        """Get information about available masking patterns"""
        return self.PATTERNS


# Singleton instance for easy access
_pii_service: Optional[PIIMaskingService] = None


def get_pii_service(use_ner: bool = True) -> PIIMaskingService:
    """Get or create PII masking service instance"""
    global _pii_service
    if _pii_service is None:
        _pii_service = PIIMaskingService(use_ner=use_ner)
    return _pii_service


def mask_complaint_text(
    text: str,
    enable_ner: bool = True
) -> Dict:
    """
    Convenience function to mask PII in complaint text.
    Returns dictionary suitable for JSON response.

    Args:
        text: Complaint text to mask
        enable_ner: Enable spaCy NER-based masking

    Returns:
        Dictionary with masked_text, rehydration, and stats
    """
    service = get_pii_service(use_ner=enable_ner)
    result = service.mask_pii(text, enable_ner=enable_ner)
    return asdict(result)
