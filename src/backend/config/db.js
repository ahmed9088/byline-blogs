import { supabase } from './supabase.js';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    // Perform a simple select to verify connection
    const { error } = await supabase.from('settings').select('id').limit(1);
    
    // If table doesn't exist yet, we will create it during seed, so we treat it as connected
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "settings" does not exist')) {
      throw error;
    }
    
    isConnected = true;
    console.log('[Supabase] Connection verified successfully.');
  } catch (error) {
    console.error('[Supabase] Connection verification failed:');
    console.error(`Message: ${error.message}`);
    throw error;
  }
};

export default connectDB;
