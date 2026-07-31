import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bylines:bylines9088%40@cluster0.i4mm980.mongodb.net/blog-cms?retryWrites=true&w=majority&appName=Cluster0';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: 'blog-cms',
      bufferCommands: false,
    };

    console.log('[Next.js API] Establishing new Mongoose connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log(`[Next.js API] MongoDB Connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: any) {
    cached.promise = null;
    console.error(`[Next.js API] MongoDB connection failed: ${error.message}`);
    throw error;
  }

  return cached.conn;
}
