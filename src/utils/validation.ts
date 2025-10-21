export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Validate email address using RFC 5322 format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email jest wymagany' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Nieprawidłowy format email' };
  }

  return { valid: true, error: null };
}

/**
 * Validate Polish phone number format
 * Accepts: +48 XXX XXX XXX, 48XXXXXXXXX, XXXXXXXXX
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Numer telefonu jest wymagany' };
  }

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check if it's a valid Polish number
  const phoneRegex = /^(\+48)?[0-9]{9}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Nieprawidłowy numer telefonu (wymagane 9 cyfr)' };
  }

  return { valid: true, error: null };
}

/**
 * Validate Polish NIP (Tax Identification Number)
 * 10 digits with checksum validation
 */
export function validateNIP(nip: string): ValidationResult {
  if (!nip || nip.trim() === '') {
    return { valid: false, error: 'NIP jest wymagany' };
  }

  // Remove spaces and dashes
  const cleaned = nip.replace(/[\s-]/g, '');
  
  // Check if it's 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return { valid: false, error: 'NIP musi składać się z 10 cyfr' };
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
  
  if (checksum === 10 || checksum !== lastDigit) {
    return { valid: false, error: 'Nieprawidłowy NIP (błędna suma kontrolna)' };
  }

  return { valid: true, error: null };
}

/**
 * Validate Polish postal code format (XX-XXX)
 */
export function validatePostalCode(code: string): ValidationResult {
  if (!code || code.trim() === '') {
    return { valid: false, error: 'Kod pocztowy jest wymagany' };
  }

  const postalCodeRegex = /^\d{2}-\d{3}$/;
  
  if (!postalCodeRegex.test(code)) {
    return { valid: false, error: 'Nieprawidłowy format kodu pocztowego (XX-XXX)' };
  }

  return { valid: true, error: null };
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} jest wymagane` };
  }

  return { valid: true, error: null };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): ValidationResult {
  if (!value) {
    return { valid: false, error: `${fieldName} jest wymagane` };
  }

  const length = value.trim().length;

  if (length < min) {
    return { valid: false, error: `${fieldName} musi mieć minimum ${min} znaków` };
  }

  if (length > max) {
    return { valid: false, error: `${fieldName} może mieć maksymalnie ${max} znaków` };
  }

  return { valid: true, error: null };
}

/**
 * Validate number range
 */
export function validateNumber(
  value: number | string, 
  min: number, 
  max: number, 
  fieldName: string
): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} musi być liczbą` };
  }

  if (num < min) {
    return { valid: false, error: `${fieldName} musi być większe lub równe ${min}` };
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} musi być mniejsze lub równe ${max}` };
  }

  return { valid: true, error: null };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === '') {
    return { valid: false, error: 'Hasło jest wymagane' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Hasło musi mieć minimum 8 znaków' };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, error: 'Hasło musi zawierać litery i cyfry' };
  }

  return { valid: true, error: null };
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(
  password: string, 
  confirmation: string
): ValidationResult {
  if (!confirmation || confirmation.trim() === '') {
    return { valid: false, error: 'Potwierdzenie hasła jest wymagane' };
  }

  if (password !== confirmation) {
    return { valid: false, error: 'Hasła nie są identyczne' };
  }

  return { valid: true, error: null };
}

