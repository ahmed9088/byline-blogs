import { useState, useEffect } from 'react';

const FALLBACKS: Record<string, { country: string; countryCode: string; currency: string; symbol: string; rate: number }> = {
  'America/New_York': { country: 'United States', countryCode: 'US', currency: 'USD', symbol: '$', rate: 1 },
  'America/Chicago': { country: 'United States', countryCode: 'US', currency: 'USD', symbol: '$', rate: 1 },
  'America/Denver': { country: 'United States', countryCode: 'US', currency: 'USD', symbol: '$', rate: 1 },
  'America/Los_Angeles': { country: 'United States', countryCode: 'US', currency: 'USD', symbol: '$', rate: 1 },
  'Europe/London': { country: 'United Kingdom', countryCode: 'GB', currency: 'GBP', symbol: '£', rate: 0.8 },
  'Europe/Paris': { country: 'France', countryCode: 'FR', currency: 'EUR', symbol: '€', rate: 0.9 },
  'Europe/Berlin': { country: 'Germany', countryCode: 'DE', currency: 'EUR', symbol: '€', rate: 0.9 },
  'Asia/Karachi': { country: 'Pakistan', countryCode: 'PK', currency: 'PKR', symbol: '₨', rate: 278 },
  'Asia/Kolkata': { country: 'India', countryCode: 'IN', currency: 'INR', symbol: '₹', rate: 83 },
  'Asia/Dubai': { country: 'UAE', countryCode: 'AE', currency: 'AED', symbol: 'د.إ', rate: 3.67 },
  'Asia/Tokyo': { country: 'Japan', countryCode: 'JP', currency: 'JPY', symbol: '¥', rate: 150 },
  'Australia/Sydney': { country: 'Australia', countryCode: 'AU', currency: 'AUD', symbol: 'A$', rate: 1.5 },
};

export const useGeolocation = () => {
  const [geo, setGeo] = useState({
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    symbol: '$',
    rate: 1,
    city: 'Global',
    loading: true
  });

  useEffect(() => {
    // Use timezone-based detection (no external API calls — avoids CORS issues)
    const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/New_York';
    const matched = FALLBACKS[tz] || FALLBACKS['America/New_York'];
    
    setGeo({
      country: matched.country,
      countryCode: matched.countryCode,
      currency: matched.currency,
      symbol: matched.symbol,
      rate: matched.rate,
      city: 'Global',
      loading: false
    });
  }, []);

  return geo;
};
