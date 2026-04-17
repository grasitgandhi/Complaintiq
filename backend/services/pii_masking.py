"""
PII Field Masking Service
Masks customer PII fields (account numbers, mobile numbers) before storing in database.
Supports regex-based masking to show only last N digits.
"""

import re
from typing import Optional


def mask_account(account: Optional[str]) -> Optional[str]:
    """
    Mask account number to show only last 4 digits.
    
    Example: "12345678901234" → "XXXXXXXX1234"
    
    Args:
        account: Account number to mask
        
    Returns:
        Masked account number or original if too short
    """
    if not account:
        return account
    
    # Remove whitespace and normalize
    account = account.strip()
    
    if len(account) <= 4:
        return account  # Don't mask if 4 digits or less
    
    last_4 = account[-4:]
    mask_count = len(account) - 4
    return 'X' * mask_count + last_4


def mask_mobile(mobile: Optional[str]) -> Optional[str]:
    """
    Mask mobile number to show only last 3 digits.
    
    Example: "9876543210" → "XXXXXXX210"
    
    Args:
        mobile: Mobile number to mask
        
    Returns:
        Masked mobile number or original if too short
    """
    if not mobile:
        return mobile
    
    # Remove whitespace, +91 prefix, and dashes
    mobile = mobile.strip().replace('+91', '').replace('-', '').replace(' ', '')
    
    if len(mobile) <= 3:
        return mobile  # Don't mask if 3 digits or less
    
    last_3 = mobile[-3:]
    mask_count = len(mobile) - 3
    return 'X' * mask_count + last_3


def mask_email(email: Optional[str]) -> Optional[str]:
    """
    Mask email to show only domain.
    
    Example: "john.doe@example.com" → "***@example.com"
    
    Args:
        email: Email address to mask
        
    Returns:
        Masked email or original if invalid
    """
    if not email:
        return email
    
    email = email.strip()
    
    # Simple email validation and masking
    match = re.match(r'^[^@]+@(.+)$', email)
    if match:
        domain = match.group(1)
        return '***@' + domain
    
    return email


def mask_complaint_pii(
    customer_account: Optional[str],
    customer_mobile: Optional[str],
    customer_email: Optional[str] = None
) -> dict:
    """
    Mask multiple PII fields at once.
    
    Args:
        customer_account: Account number to mask
        customer_mobile: Mobile number to mask
        customer_email: Email address to mask (optional)
        
    Returns:
        Dictionary with masked fields: {
            'customer_account': str,
            'customer_mobile': str,
            'customer_email': str (optional)
        }
    """
    masked = {
        'customer_account': mask_account(customer_account),
        'customer_mobile': mask_mobile(customer_mobile),
    }
    
    if customer_email:
        masked['customer_email'] = mask_email(customer_email)
    
    return masked


# Example usage and test cases
if __name__ == "__main__":
    # Test masking functions
    test_cases = {
        'account': [
            ("12345678901234", "XXXXXXXX1234"),
            ("9876543210", "XXXXXX3210"),
            ("123456", "XX6"),
            ("123", "123"),
            ("", ""),
            (None, None),
        ],
        'mobile': [
            ("9876543210", "XXXXXXX210"),
            ("8765432109", "XXXXXXX109"),
            ("426", "426"),
            ("", ""),
            (None, None),
            ("+91 9876543210", "XXXXXXX210"),
            ("9876-543-210", "XXXXXXX210"),
        ],
        'email': [
            ("john.doe@example.com", "***@example.com"),
            ("customer@bank.co.in", "***@bank.co.in"),
            ("", ""),
            (None, None),
        ]
    }
    
    print("🧪 Testing Account Masking:")
    for input_val, expected in test_cases['account']:
        result = mask_account(input_val)
        status = "✅" if result == expected else "❌"
        print(f"  {status} mask_account({input_val!r}) = {result!r} (expected {expected!r})")
    
    print("\n🧪 Testing Mobile Masking:")
    for input_val, expected in test_cases['mobile']:
        result = mask_mobile(input_val)
        status = "✅" if result == expected else "❌"
        print(f"  {status} mask_mobile({input_val!r}) = {result!r} (expected {expected!r})")
    
    print("\n🧪 Testing Email Masking:")
    for input_val, expected in test_cases['email']:
        result = mask_email(input_val)
        status = "✅" if result == expected else "❌"
        print(f"  {status} mask_email({input_val!r}) = {result!r} (expected {expected!r})")
    
    print("\n🧪 Testing Combined Masking:")
    masked = mask_complaint_pii(
        customer_account="12345678901234",
        customer_mobile="9876543210",
        customer_email="john@example.com"
    )
    print(f"  Combined result: {masked}")
