/**
 * Unit tests for formatters utility functions
 * Target: 100% coverage
 */

import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
} from './formatters';

describe('formatCurrency', () => {
  it('should format TZS with no decimals', () => {
    expect(formatCurrency(1500000)).toBe('TZS 1,500,000');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('TZS 0');
  });

  it('should format compact notation for thousands', () => {
    expect(formatCurrency(5000, true)).toBe('TZS 5.0K');
  });

  it('should format compact notation for millions', () => {
    expect(formatCurrency(5000000, true)).toBe('TZS 5.0M');
  });

  it('should format compact notation for billions', () => {
    expect(formatCurrency(2500000000, true)).toBe('TZS 2.5B');
  });

  it('should format small amounts in compact mode without abbreviation', () => {
    expect(formatCurrency(500, true)).toBe('TZS 500');
  });

  it('should handle negative amounts', () => {
    const result = formatCurrency(-1000000);
    expect(result).toContain('-');
    expect(result).toContain('1,000,000');
  });
});

describe('formatDate', () => {
  it('should format short date', () => {
    const result = formatDate('2026-02-13', 'short');
    // Result depends on locale, but should contain day, month abbreviation, year
    expect(result).toMatch(/13/);
    expect(result).toMatch(/Feb/i);
    expect(result).toMatch(/2026/);
  });

  it('should format long date', () => {
    const result = formatDate('2026-02-13', 'long');
    expect(result).toMatch(/13/);
    expect(result).toMatch(/February/i);
    expect(result).toMatch(/2026/);
  });

  it('should format ISO date', () => {
    expect(formatDate('2026-02-13T10:30:00', 'iso')).toBe('2026-02-13');
  });

  it('should default to short format', () => {
    const result = formatDate('2026-02-13');
    expect(result).toMatch(/13/);
    expect(result).toMatch(/Feb/i);
    expect(result).toMatch(/2026/);
  });

  it('should handle datetime strings', () => {
    const result = formatDate('2026-02-13T14:30:00', 'short');
    expect(result).toMatch(/13/);
    expect(result).toMatch(/Feb/i);
  });
});

describe('formatTime', () => {
  it('should format time in 24-hour format', () => {
    const result = formatTime('2026-02-13T14:30:00');
    // Result may vary by locale, but should contain hours and minutes
    expect(result).toMatch(/14|2/); // 14:30 or 2:30 PM
    expect(result).toMatch(/30/);
  });

  it('should handle midnight', () => {
    const result = formatTime('2026-02-13T00:00:00');
    expect(result).toMatch(/00|12/); // 00:00 or 12:00 AM
  });

  it('should handle noon', () => {
    const result = formatTime('2026-02-13T12:00:00');
    expect(result).toMatch(/12/);
  });
});

describe('formatDateTime', () => {
  it('should format date and time together', () => {
    const result = formatDateTime('2026-02-13T14:30:00');
    expect(result).toMatch(/13/);
    expect(result).toMatch(/Feb/i);
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/14|2/); // Time part
  });
});

describe('formatNumber', () => {
  it('should format number with thousands separators', () => {
    expect(formatNumber(1500000)).toBe('1,500,000');
  });

  it('should format number with decimal places', () => {
    expect(formatNumber(1500000.5, 2)).toBe('1,500,000.50');
  });

  it('should default to zero decimals', () => {
    expect(formatNumber(1500000.999)).toBe('1,500,001');
  });

  it('should format zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1000000)).toContain('-1,000,000');
  });

  it('should format decimals correctly', () => {
    expect(formatNumber(1234.5678, 3)).toBe('1,234.568');
  });
});
