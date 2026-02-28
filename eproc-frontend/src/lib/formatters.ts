/**
 * Centralized formatting utilities for the eProc application
 * 
 * This module provides consistent formatting functions for:
 * - Currency (TZS)
 * - Dates and times
 * - Numbers
 * 
 * These functions replace 10+ duplicate implementations across the codebase.
 */

/**
 * Format a number as Tanzanian Shillings (TZS) currency
 * 
 * @param amount - The amount to format
 * @param compact - If true, format as compact notation (e.g., "5.0M" instead of "5,000,000")
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1500000) // "TZS 1,500,000"
 * formatCurrency(5000000, true) // "TZS 5.0M"
 * formatCurrency(2500000000, true) // "TZS 2.5B"
 */
export const formatCurrency = (amount: number, compact = false): string => {
  if (compact) {
    if (amount >= 1_000_000_000) {
      return `TZS ${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      return `TZS ${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `TZS ${(amount / 1_000).toFixed(1)}K`;
    }
  }
  
  // Format with thousands separators but no currency symbol
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  // Manually add TZS prefix (locale returns "TSh" which is incorrect)
  return `TZS ${formatted}`;
};

/**
 * Format a date string in various formats
 * 
 * @param dateString - ISO date string or Date object
 * @param format - Format type: 'short', 'long', or 'iso'
 * @returns Formatted date string
 * 
 * @example
 * formatDate('2026-02-13', 'short') // "13 Feb 2026"
 * formatDate('2026-02-13', 'long') // "13 February 2026"
 * formatDate('2026-02-13T10:30:00', 'iso') // "2026-02-13"
 */
export const formatDate = (
  dateString: string | Date,
  format: 'short' | 'long' | 'iso' = 'short'
): string => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-TZ', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    case 'long':
      return date.toLocaleDateString('en-TZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    case 'iso':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString();
  }
};

/**
 * Format a time from a date string
 * 
 * @param dateString - ISO date string with time
 * @returns Formatted time string (24-hour format)
 * 
 * @example
 * formatTime('2026-02-13T14:30:00') // "14:30"
 */
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-TZ', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a date and time together
 * 
 * @param dateString - ISO date string with time
 * @returns Formatted date and time string
 * 
 * @example
 * formatDateTime('2026-02-13T14:30:00') // "13 Feb 2026 14:30"
 */
export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString, 'short')} ${formatTime(dateString)}`;
};

/**
 * Format a number with thousands separators
 * 
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 * 
 * @example
 * formatNumber(1500000) // "1,500,000"
 * formatNumber(1500000.5, 2) // "1,500,000.50"
 */
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format GPS coordinates to 4 decimal places
 * Formats strings like "-6.7924344, 39.2083232" to "-6.7924, 39.2083"
 * 
 * @param gpsString - The GPS coordinate string
 * @returns Formatted GPS string
 */
export const formatGPS = (gpsString: string | null | undefined): string => {
  if (!gpsString) return 'Not pinned';
  
  try {
    const parts = gpsString.split(',');
    if (parts.length !== 2) return gpsString; // Return as is if not a comma-separated pair
    
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    
    if (isNaN(lat) || isNaN(lng)) return gpsString; // Return as is if not valid numbers
    
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    return gpsString; // Fallback to raw string on any error
  }
};

