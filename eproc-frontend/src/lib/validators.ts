/**
 * Validation Utilities
 * 
 * Centralized validation functions for forms and inputs
 */

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number (accepts various formats)
 * Supports: +255123456789, 0123456789, 123-456-789, etc.
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Must be between 10-15 digits (international format consideration)
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Validates Tanzanian phone number specifically
 * Format: +255XXXXXXXXX or 0XXXXXXXXX
 */
export const isValidTanzanianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check for +255 format (13 digits total)
  if (cleaned.startsWith('+255')) {
    return cleaned.length === 13;
  }
  
  // Check for 0 format (10 digits total)
  if (cleaned.startsWith('0')) {
    return cleaned.length === 10;
  }
  
  return false;
};

/**
 * Validates ERB (Engineers Registration Board) number
 * Format: ERB/XXXX/YYYY or similar patterns
 */
export const isValidERB = (erb: string): boolean => {
  // ERB numbers typically follow ERB/#### or ERB-#### format
  const erbRegex = /^ERB[/-]\d{3,6}([/-]\d{2,4})?$/i;
  return erbRegex.test(erb.trim());
};

/**
 * Validates TIN (Taxpayer Identification Number)
 * Tanzania TIN format: 9 digits
 */
export const isValidTIN = (tin: string): boolean => {
  const cleaned = tin.replace(/[^\d]/g, '');
  return cleaned.length === 9;
};

/**
 * Validates VRN (VAT Registration Number)
 * Tanzania VRN format: 10 digits
 */
export const isValidVRN = (vrn: string): boolean => {
  const cleaned = vrn.replace(/[^\d]/g, '');
  return cleaned.length === 10;
};

/**
 * Validates password strength
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates required field
 */
export const isRequired = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  return true;
};

/**
 * Validates numeric input
 */
export const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value)) && value.trim() !== '';
};

/**
 * Validates positive number
 */
export const isPositiveNumber = (value: number | string): boolean => {
  const num = typeof value === 'string' ? Number(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Validates URL format
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
