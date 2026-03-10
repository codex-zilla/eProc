/**
 * Centralized constants for BOQ Request creation forms.
 * Shared between CreateRequest page and related components.
 */

export const RATE_TYPES = [
  { value: 'ENGINEER_ESTIMATE', label: 'Engineer Estimate' },
  { value: 'MARKET_RATE', label: 'Market Rate' },
] as const;

/** Units available for material line items (excludes labour-only units) */
export const MATERIAL_UNITS = [
  { value: 'm³', label: 'm³ - Cubic Meter' },
  { value: 'm²', label: 'm² - Square Meter' },
  { value: 'm', label: 'm - Linear Meter' },
  { value: 'kg', label: 'kg - Kilogram' },
  { value: 'ton', label: 'ton - Metric Ton' },
  { value: 'No', label: 'No - Number (count)' },
  { value: 'LS', label: 'LS - Lump Sum' },
  { value: 'bag', label: 'bag - Bag (cement, aggregates)' },
  { value: 'bundle', label: 'bundle - Bundle (reinforcement)' },
  { value: 'trip', label: 'trip - Trip (lorry deliveries)' },
  { value: 'drum', label: 'drum - Drum (bitumen/asphalt)' },
  { value: 'pcs', label: 'pcs - Pieces' },
] as const;

/** Units available for labour line items */
export const LABOUR_UNITS = [
  { value: 'Days', label: 'Days' },
  { value: 'No', label: 'No - Count' },
] as const;
