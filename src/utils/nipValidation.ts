/**
 * Validate Polish NIP (Tax Identification Number)
 * NIP consists of 10 digits with a checksum
 */
export function validateNIPChecksum(nip: string): boolean {
  // Remove spaces and dashes
  const cleaned = nip.replace(/[\s-]/g, '');
  
  // Check if it's 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return false;
  }

  // Validate checksum
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const digits = cleaned.split('').map(Number);
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }
  
  const checksum = sum % 11;
  const lastDigit = digits[9];
  
  // Checksum of 10 is invalid
  if (checksum === 10) {
    return false;
  }
  
  return checksum === lastDigit;
}

/**
 * Format NIP with dashes (XXX-XXX-XX-XX or XXX-XX-XX-XXX)
 */
export function formatNIP(nip: string): string {
  const cleaned = nip.replace(/[\s-]/g, '');
  
  if (cleaned.length !== 10) {
    return nip;
  }
  
  // Format as XXX-XXX-XX-XX
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`;
}

/**
 * Clean NIP (remove spaces and dashes)
 */
export function cleanNIP(nip: string): string {
  return nip.replace(/[\s-]/g, '');
}

