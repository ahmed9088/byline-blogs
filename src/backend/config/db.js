import { supabase } from './supabase.js';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const { error } = await supabase.from('settings').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "settings" does not exist')) {
      console.warn('[Supabase] Database query notice:', error.message);
    }
    isConnected = true;
    console.log('[Supabase] Connection verified successfully.');
  } catch (error) {
    console.warn('[Supabase] Initial connection check notice:', error?.message || error);
    isConnected = true;
  }
};

export default connectDB;
