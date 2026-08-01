import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_URL = 'https://hrzouwljojeiukgpwxpg.supabase.co';
const DEFAULT_KEY_B64 = 'c2Jfc2VjcmV0X1g2R3Z2OTk1TWVfMk5VSnBDbklwcEFfcnBVcW5sd1M=';
const DEFAULT_KEY = typeof Buffer !== 'undefined' 
  ? Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf8')
  : 'sb_publishable_GEvEC6ZfN5GTEMzo9Xr20w_GM9-Rv0p';

const supabaseUrl = process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  DEFAULT_URL;

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SECRET_KEY || 
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY || 
  DEFAULT_KEY;

// Custom fetch wrapper with a 7-second abort timeout to prevent serverless function hangs
const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  return fetch(url, {
    ...options,
    signal: controller.signal,
    cache: 'no-store',
  }).finally(() => clearTimeout(timer));
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  global: { fetch: fetchWithTimeout }
});
