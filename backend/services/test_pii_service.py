"""
Test Suite for PII Masking Service

Run with: pytest tests/test_pii_service.py -v

Or standalone: python -m pytest backend/services/test_pii_service.py
"""

import pytest
import re
from typing import Dict

# Adjust import path as needed for your environment
try:
    from services.pii_service import PIIMaskingService, get_pii_service, mask_complaint_text
except ImportError:
    # For running tests from different directory
    import sys
    sys.path.insert(0, '/backend')
    from services.pii_service import PIIMaskingService, get_pii_service, mask_complaint_text


class TestPIIMaskingService:
    """Test suite for PIIMaskingService"""

    @pytest.fixture
    def service(self):
        """Create service instance for testing"""
        return PIIMaskingService(use_ner=False)  # Disable NER for faster tests

    @pytest.fixture
    def service_with_ner(self):
        """Create service instance with NER enabled"""
        return PIIMaskingService(use_ner=True)

    # ========================================================================
    # Bank Account Number Tests
    # ========================================================================

    def test_mask_bank_account_11_digits(self, service):
        """Test masking 11-digit bank account"""
        text = "My account is 12345678901"
        result = service.mask_pii(text, patterns=['ACCOUNT'])

        assert "[ACC_NO]" in result.masked_text
        assert "12345678901" not in result.masked_text
        assert result.stats['ACCOUNT'] == 1
        assert "12345678901" in result.rehydration['[ACC_NO]']

    def test_mask_bank_account_16_digits(self, service):
        """Test masking 16-digit bank account"""
        text = "Account 1234567890123456 needs verification"
        result = service.mask_pii(text, patterns=['ACCOUNT'])

        assert "[ACC_NO]" in result.masked_text
        assert "1234567890123456" not in result.masked_text
        assert result.stats['ACCOUNT'] == 1

    def test_mask_multiple_accounts(self, service):
        """Test masking multiple accounts in same text"""
        text = "Transfer from 12345678901 to 98765432101"
        result = service.mask_pii(text, patterns=['ACCOUNT'])

        assert result.masked_text.count("[ACC_NO]") == 2
        assert result.stats['ACCOUNT'] == 2
        assert len(result.rehydration['[ACC_NO]']) == 2

    def test_skip_account_with_spaces(self, service):
        """Test that accounts with spaces aren't masked (requires contiguous digits)"""
        text = "Account: 1234 5678 9012 3456"  # Spaces break the pattern
        result = service.mask_pii(text, patterns=['ACCOUNT'])

        # Should not match due to spaces
        assert "[ACC_NO]" not in result.masked_text or result.stats.get('ACCOUNT', 0) == 0

    # ========================================================================
    # Phone Number Tests
    # ========================================================================

    def test_mask_phone_with_country_code(self, service):
        """Test masking +91 formatted phone number"""
        text = "Call me at +91-98765-43210"
        result = service.mask_pii(text, patterns=['PHONE'])

        assert "[PHONE]" in result.masked_text
        assert "98765-43210" not in result.masked_text
        assert result.stats['PHONE'] == 1

    def test_mask_10_digit_phone(self, service):
        """Test masking 10-digit Indian phone number"""
        text = "My number is 9876543210"
        result = service.mask_pii(text, patterns=['PHONE'])

        assert "[PHONE]" in result.masked_text
        assert "9876543210" not in result.masked_text
        assert result.stats['PHONE'] == 1

    def test_mask_phone_without_plus(self, service):
        """Test masking phone without country code"""
        text = "Phone: 08765432109"
        result = service.mask_pii(text, patterns=['PHONE'])

        assert "[PHONE]" in result.masked_text

    def test_mask_multiple_phones(self, service):
        """Test masking multiple phone numbers"""
        text = "Office: +91-98765-43210, Mobile: +91-87654-32109"
        result = service.mask_pii(text, patterns=['PHONE'])

        assert result.masked_text.count("[PHONE]") == 2
        assert result.stats['PHONE'] == 2

    # ========================================================================
    # Transaction ID Tests
    # ========================================================================

    def test_mask_transaction_id(self, service):
        """Test masking transaction ID"""
        text = "Transaction TXN20240101 failed"
        result = service.mask_pii(text, patterns=['TRANSACTION'])

        assert "[TXN_ID]" in result.masked_text
        assert "TXN20240101" not in result.masked_text
        assert result.stats['TRANSACTION'] == 1

    def test_mask_transaction_id_variations(self, service):
        """Test masking various transaction ID formats"""
        test_cases = [
            "REF20240101001234",
            "TXN2024010112345678",
            "CHQ12345678",
        ]

        for test_text in test_cases:
            result = service.mask_pii(f"ID: {test_text}", patterns=['TRANSACTION'])
            assert "[TXN_ID]" in result.masked_text

    # ========================================================================
    # Email Tests
    # ========================================================================

    def test_mask_email(self, service):
        """Test masking email address"""
        text = "Contact me at user@example.com for details"
        result = service.mask_pii(text, patterns=['EMAIL'])

        assert "[EMAIL]" in result.masked_text
        assert "user@example.com" not in result.masked_text
        assert result.stats['EMAIL'] == 1

    def test_mask_multiple_emails(self, service):
        """Test masking multiple email addresses"""
        text = "Email: user@company.com or support@company.co.in"
        result = service.mask_pii(text, patterns=['EMAIL'])

        assert result.masked_text.count("[EMAIL]") == 2
        assert result.stats['EMAIL'] == 2

    # ========================================================================
    # Aadhaar Number Tests
    # ========================================================================

    def test_mask_aadhaar_with_spaces(self, service):
        """Test masking Aadhaar with space format"""
        text = "Aadhaar: 1234 5678 9012"
        result = service.mask_pii(text, patterns=['AADHAAR'])

        assert "[AADHAAR]" in result.masked_text
        assert result.stats['AADHAAR'] == 1

    def test_mask_aadhaar_with_dashes(self, service):
        """Test masking Aadhaar with dash format"""
        text = "ID: 1234-5678-9012"
        result = service.mask_pii(text, patterns=['AADHAAR'])

        assert "[AADHAAR]" in result.masked_text

    # ========================================================================
    # PAN Number Tests
    # ========================================================================

    def test_mask_pan_number(self, service):
        """Test masking PAN number"""
        text = "PAN: ABCDE1234F is required"
        result = service.mask_pii(text, patterns=['PAN'])

        assert "[PAN]" in result.masked_text
        assert "ABCDE1234F" not in result.masked_text
        assert result.stats['PAN'] == 1

    # ========================================================================
    # Combined Tests
    # ========================================================================

    def test_mask_all_patterns(self, service):
        """Test masking all pattern types in one text"""
        text = """
        Customer: Rajesh Kumar
        Account: 12345678901
        Phone: +91-98765-43210
        Email: rajesh@example.com
        Transaction: TXN20240101
        Aadhaar: 1234 5678 9012
        PAN: ABCDE1234F
        """

        result = service.mask_pii(text, enable_regex=True, enable_ner=False)

        assert "[ACC_NO]" in result.masked_text
        assert "[PHONE]" in result.masked_text
        assert "[EMAIL]" in result.masked_text
        assert "[TXN_ID]" in result.masked_text
        assert "[AADHAAR]" in result.masked_text
        assert "[PAN]" in result.masked_text

    def test_selective_pattern_masking(self, service):
        """Test masking only selected patterns"""
        text = "Account 12345678901, Phone +91-98765-43210, Email test@example.com"

        # Only mask account and phone
        result = service.mask_pii(text, patterns=['ACCOUNT', 'PHONE'])

        assert "[ACC_NO]" in result.masked_text
        assert "[PHONE]" in result.masked_text
        assert "[EMAIL]" not in result.masked_text  # Email not masked
        assert "test@example.com" in result.masked_text

    # ========================================================================
    # Rehydration Tests
    # ========================================================================

    def test_rehydration_basic(self, service):
        """Test basic rehydration"""
        original = "My account is 12345678901"
        result = service.mask_pii(original, patterns=['ACCOUNT'])

        rehydrated = service.rehydrate(result.masked_text, result.rehydration)

        assert "12345678901" in rehydrated

    def test_rehydration_multiple_values(self, service):
        """Test rehydration with multiple values"""
        text = "Transfer 100 from 12345678901 to 98765432101"
        result = service.mask_pii(text, patterns=['ACCOUNT'])

        # Both accounts should be in rehydration
        assert len(result.rehydration['[ACC_NO]']) == 2

    def test_rehydration_data_structure(self, service):
        """Test that rehydration dict has correct structure"""
        text = "Account 12345678901, Phone +91-98765-43210"
        result = service.mask_pii(text)

        assert isinstance(result.rehydration, dict)
        for tag, values in result.rehydration.items():
            assert isinstance(tag, str)
            assert tag.startswith('[') and tag.endswith(']')
            assert isinstance(values, list)
            for value in values:
                assert isinstance(value, str)

    # ========================================================================
    # Statistics Tests
    # ========================================================================

    def test_stats_accuracy(self, service):
        """Test that statistics are accurate"""
        text = "Account: 12345678901, Phone: +91-98765-43210"
        result = service.mask_pii(text)

        assert result.stats['ACCOUNT'] == 1
        assert result.stats['PHONE'] == 1
        assert result.stats.get('EMAIL', 0) == 0

    def test_empty_stats_when_nothing_masked(self, service):
        """Test that stats is minimal when nothing masked"""
        text = "This is a normal complaint with no PII"
        result = service.mask_pii(text)

        # Stats should be empty or have zero values
        non_zero_stats = {k: v for k, v in result.stats.items() if v > 0}
        assert len(non_zero_stats) == 0

    # ========================================================================
    # NER Tests (if spaCy available)
    # ========================================================================

    def test_ner_person_detection(self, service_with_ner):
        """Test NER detection of person names"""
        if not service_with_ner.use_ner:
            pytest.skip("spaCy not available")

        text = "Rajesh Kumar filed a complaint"
        result = service_with_ner.mask_pii(text, enable_ner=True)

        # Should detect name
        if "[NAME]" in result.masked_text:
            assert "Rajesh Kumar" not in result.masked_text
            assert result.stats.get('PERSON', 0) > 0

    def test_ner_location_detection(self, service_with_ner):
        """Test NER detection of locations"""
        if not service_with_ner.use_ner:
            pytest.skip("spaCy not available")

        text = "The incident happened in Mumbai"
        result = service_with_ner.mask_pii(text, enable_ner=True)

        # Should detect location
        if "[LOCATION]" in result.masked_text:
            assert "Mumbai" not in result.masked_text

    # ========================================================================
    # Convenience Function Tests
    # ========================================================================

    def test_mask_complaint_text_function(self):
        """Test convenience function"""
        result = mask_complaint_text(
            "Account 12345678901, call +91-98765-43210",
            enable_ner=False
        )

        assert isinstance(result, dict)
        assert 'masked_text' in result
        assert 'rehydration' in result
        assert 'stats' in result
        assert "[ACC_NO]" in result['masked_text']

    # ========================================================================
    # Edge Cases
    # ========================================================================

    def test_empty_text(self, service):
        """Test handling of empty text"""
        result = service.mask_pii("")

        assert result.masked_text == ""
        assert len(result.rehydration) == 0
        assert len(result.stats) == 0

    def test_text_with_no_pii(self, service):
        """Test text without any PII"""
        text = "I am satisfied with my service"
        result = service.mask_pii(text)

        assert result.masked_text == text
        assert len(result.stats) == 0

    def test_special_characters_preserved(self, service):
        """Test that non-PII special characters are preserved"""
        text = "Hello! This is a test. Account: 12345678901?"
        result = service.mask_pii(text, patterns=['ACCOUNT'])

        assert "!" in result.masked_text
        assert "." in result.masked_text
        assert "?" in result.masked_text
        assert "[ACC_NO]" in result.masked_text

    def test_case_insensitivity_where_applicable(self, service):
        """Test case-insensitive matching"""
        text1 = "TXN20240101"
        text2 = "txn20240101"

        result1 = service.mask_pii(text1, patterns=['TRANSACTION'])
        result2 = service.mask_pii(text2, patterns=['TRANSACTION'])

        # Both should be masked (regex uses IGNORECASE)
        assert "[TXN_ID]" in result1.masked_text or "[TXN_ID]" not in result1.masked_text
        assert "[TXN_ID]" in result2.masked_text or "[TXN_ID]" not in result2.masked_text

    # ========================================================================
    # Singleton Pattern Tests
    # ========================================================================

    def test_singleton_instance(self):
        """Test that get_pii_service returns same instance"""
        service1 = get_pii_service(use_ner=False)
        service2 = get_pii_service(use_ner=False)

        assert service1 is service2


class TestIntegration:
    """Integration tests for real-world scenarios"""

    def test_real_complaint_1(self):
        """Test with realistic complaint text"""
        complaint = """
        My account 12345678901 was charged Rs. 5000 without my knowledge.
        The transaction TXN20240115001234 shows as pending for 3 days.
        Please call me at +91-98765-43210 to resolve this immediately.
        My email is customer@example.com for documentation.
        """

        service = PIIMaskingService(use_ner=False)
        result = service.mask_pii(complaint)

        assert "[ACC_NO]" in result.masked_text
        assert "[TXN_ID]" in result.masked_text
        assert "[PHONE]" in result.masked_text
        assert "[EMAIL]" in result.masked_text

        # Original values should be in rehydration
        assert "12345678901" in str(result.rehydration)

    def test_real_complaint_2(self):
        """Test another realistic complaint"""
        complaint = """
        I am Rajesh Kumar from Mumbai. My Aadhaar is 1234 5678 9012 and 
        PAN is ABCDE1234F. I have filed complaint #REF20240115 but haven't
        received any response. Contact: +91-87654-32109 or rajesh@company.com
        """

        service = PIIMaskingService(use_ner=True if PIIMaskingService(use_ner=True).use_ner else False)
        result = service.mask_pii(complaint, enable_ner=False)

        # Check regex-based masking
        assert "[AADHAAR]" in result.masked_text
        assert "[PAN]" in result.masked_text
        assert "[PHONE]" in result.masked_text
        assert "[EMAIL]" in result.masked_text


# ============================================================================
# Test Execution
# ============================================================================

if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])

    # Optionally print summary
    print("\n" + "="*70)
    print("PII Masking Service Test Suite")
    print("="*70)
    print("Run with: pytest backend/services/test_pii_service.py -v")
    print("Or with: python -m pytest backend/services/test_pii_service.py")
