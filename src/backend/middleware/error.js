export const errorHandler = (err, req, res, next) => {
  // Log the full error to server console (visible in Vercel Function Logs)
  console.error('[ErrorHandler]', err.message || err);
  if (err.stack) console.error(err.stack);

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Server Error';

  // Supabase-specific errors
  if (err.code === 'PGRST116') {
    // Table not found in Supabase schema cache
    message = 'Database table not found. Run the database initialization script.';
    statusCode = 503;
  }

  // Supabase duplicate key
  if (err.code === '23505') {
    message = `Duplicate value: ${err.details || err.message}`;
    statusCode = 400;
  }

  // Supabase foreign key violation
  if (err.code === '23503') {
    message = `Reference error: ${err.details || err.message}`;
    statusCode = 400;
  }

  // Send response — always include message for debugging on Vercel
  try {
    if (!res.headersSent) {
      res.status(statusCode).json({
        success: false,
        message,
        // Include stack trace details in all environments for now to help debug
        ...(err.stack && { debug: err.stack.split('\n').slice(0, 3).join(' | ') })
      });
    }
  } catch (resError) {
    console.error('[ErrorHandler] Failed to send error response:', resError.message);
  }
};
