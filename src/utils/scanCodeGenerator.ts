/**
 * Generate a user-friendly scan code
 * Format: business-name-location-random6
 * Example: coderno-coffee-centrum-a3f9k2
 */
export function generateScanCode(businessName: string, locationName: string): string {
  // Convert to lowercase and remove special characters
  const cleanBusinessName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 20); // Limit length
  
  const cleanLocationName = locationName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 20); // Limit length
  
  // Generate random 6-character suffix
  const random = generateRandomString(6);
  
  return `${cleanBusinessName}-${cleanLocationName}-${random}`;
}

/**
 * Generate random alphanumeric string
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate scan code format
 */
export function isValidScanCodeFormat(scanCode: string): boolean {
  // Should be lowercase alphanumeric with dashes
  const regex = /^[a-z0-9-]+$/;
  return regex.test(scanCode) && scanCode.length >= 10 && scanCode.length <= 100;
}

/**
 * Clean string for use in scan code
 */
export function cleanForScanCode(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
}

