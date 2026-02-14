/**
 * Tests for validators module
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isValidTanzanianPhone,
  isValidERB,
  isValidTIN,
  isValidVRN,
  isValidPassword,
  isRequired,
  isNumeric,
  isPositiveNumber,
  isValidURL,
} from './validators';

describe('validators', () => {
  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.tz')).toBe(true);
      expect(isValidEmail('admin+tag@company.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should accept valid phone numbers', () => {
      expect(isValidPhone('+255123456789')).toBe(true);
      expect(isValidPhone('0123456789')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidTanzanianPhone', () => {
    it('should accept valid Tanzanian numbers', () => {
      expect(isValidTanzanianPhone('+255712345678')).toBe(true);
      expect(isValidTanzanianPhone('0712345678')).toBe(true);
      expect(isValidTanzanianPhone('0755123456')).toBe(true);
    });

    it('should reject invalid Tanzanian numbers', () => {
      expect(isValidTanzanianPhone('+254712345678')).toBe(false); // Kenya
      expect(isValidTanzanianPhone('1234567890')).toBe(false);
      expect(isValidTanzanianPhone('071234567')).toBe(false); // Too short
    });
  });

  describe('isValidERB', () => {
    it('should accept valid ERB numbers', () => {
      expect(isValidERB('ERB/1234')).toBe(true);
      expect(isValidERB('ERB-12345')).toBe(true);
      expect(isValidERB('erb/123456')).toBe(true);
      expect(isValidERB('ERB/1234/2023')).toBe(true);
    });

    it('should reject invalid ERB numbers', () => {
      expect(isValidERB('ERB12345')).toBe(false); // No separator
      expect(isValidERB('123/ERB')).toBe(false);
      expect(isValidERB('ERB/')).toBe(false);
    });
  });

  describe('isValidTIN', () => {
    it('should accept valid TIN numbers', () => {
      expect(isValidTIN('123456789')).toBe(true);
      expect(isValidTIN('123-456-789')).toBe(true); // With dashes
    });

    it('should reject invalid TIN numbers', () => {
      expect(isValidTIN('12345678')).toBe(false); // Too short
      expect(isValidTIN('1234567890')).toBe(false); // Too long
      expect(isValidTIN('abc123456')).toBe(false);
    });
  });

  describe('isValidVRN', () => {
    it('should accept valid VRN numbers', () => {
      expect(isValidVRN('1234567890')).toBe(true);
      expect(isValidVRN('123-456-7890')).toBe(true);
    });

    it('should reject invalid VRN numbers', () => {
      expect(isValidVRN('123456789')).toBe(false); // Too short
      expect(isValidVRN('12345678901')).toBe(false); // Too long
    });
  });

  describe('isValidPassword', () => {
    it('should accept valid passwords', () => {
      const result = isValidPassword('Password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords without uppercase', () => {
      const result = isValidPassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase', () => {
      const result = isValidPassword('PASSWORD123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = isValidPassword('Password');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject short passwords', () => {
      const result = isValidPassword('Pass1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });
  });

  describe('isRequired', () => {
    it('should accept non-empty values', () => {
      expect(isRequired('test')).toBe(true);
      expect(isRequired(123)).toBe(true);
      expect(isRequired(0)).toBe(true);
    });

    it('should reject empty values', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('should accept numeric strings', () => {
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('0')).toBe(true);
      expect(isNumeric('-123')).toBe(true);
      expect(isNumeric('123.45')).toBe(true);
    });

    it('should reject non-numeric strings', () => {
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric('12a')).toBe(false);
      expect(isNumeric('')).toBe(false);
      expect(isNumeric('   ')).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should accept positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(123.45)).toBe(true);
      expect(isPositiveNumber('100')).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber('-10')).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('should accept valid URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://localhost:3000')).toBe(true);
      expect(isValidURL('https://sub.domain.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('example.com')).toBe(false); // Missing protocol
      expect(isValidURL('http://')).toBe(false);
    });
  });
});
