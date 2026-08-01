// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import User from '../../../../../backend/models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bylines_dev_default_super_secure_jwt_secret_key_2026';

const generateToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password').catch(() => null);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userId = user._id || user.id;
    const token = generateToken(userId);

    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium || false,
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        socialLinks: user.socialLinks || {},
        followers: user.followers || [],
        following: user.following || []
      }
    });
  } catch (error: any) {
    console.error('[Login API Route Error]:', error?.message || error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Login failed' },
      { status: 500 }
    );
  }
}
