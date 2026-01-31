const CURRENCY_API_URL = import.meta.env.VITE_CURRENCY_API_URL;

// Default fallback rate if API fails (1 USD = 2500 TZS)
const DEFAULT_EXCHANGE_RATE = 2500;

/**
 * Fetches the current USD to TZS exchange rate.
 * @returns Promise<number> The exchange rate (TZS per 1 USD)
 */
export const getExchangeRate = async (): Promise<number> => {
  try {
    const res = await fetch(CURRENCY_API_URL);
    const data = await res.json();
    if (data && data.rates && data.rates.TZS) {
      return data.rates.TZS;
    }
    console.warn('Currency API did not return TZS rate, using fallback.');
    return DEFAULT_EXCHANGE_RATE;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return DEFAULT_EXCHANGE_RATE;
  }
};

/**
 * Converts an amount from a source currency to TZS.
 * @param amount The amount to convert
 * @param currency The source currency code (e.g., 'USD', 'TZS')
 * @param rate The current exchange rate (TZS per 1 USD)
 * @returns number The equivalent amount in TZS
 */
export const convertToTZS = (amount: number, currency: string, rate: number): number => {
  if (currency === 'TZS') return amount;
  if (currency === 'USD') return Math.round(amount * rate);
  // Add other currencies here if needed
  return amount;
};

/**
 * Converts an amount from TZS to a target currency.
 * @param tzsAmount The amount in TZS
 * @param targetCurrency The target currency code
 * @param rate The current exchange rate (TZS per 1 USD)
 * @returns string The equivalent amount formatted to 2 decimals (if not TZS)
 */
export const convertFromTZS = (tzsAmount: number, targetCurrency: string, rate: number): string => {
  if (targetCurrency === 'TZS') return tzsAmount.toString();
  if (targetCurrency === 'USD') return (tzsAmount / rate).toFixed(2);
  return tzsAmount.toString();
};
