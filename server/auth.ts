import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db';
import { users, sessions, passwordResetTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { verifyToken } from './jwt-auth';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    nickname: string;
    profileImage?: string;
    bio?: string;
  };
}

// Google OAuth 설정
export function initializeGoogleOAuth() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Dynamically set redirect URI based on environment
  let googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!googleRedirectUri) {
    if (process.env.VERCEL_URL) {
      googleRedirectUri = `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
    } else if (process.env.NODE_ENV === 'production') {
      googleRedirectUri = 'https://collect-topaz.vercel.app/api/auth/google/callback';
    } else {
      googleRedirectUri = 'http://localhost:5000/api/auth/google/callback';
    }
  }

  if (!googleClientId || !googleClientSecret) {
    console.log('Google OAuth not configured. Skipping Google authentication setup.');
    return;
  }

  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleRedirectUri
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 구글에서 받은 정보
      const googleEmail = profile.emails?.[0]?.value;
      const googleName = profile.displayName;
      const googlePicture = profile.photos?.[0]?.value;
      
      if (!googleEmail) {
        return done(new Error('No email from Google'), false);
      }

      // 기존 사용자 확인
      let user = await storage.getUserByEmail(googleEmail);
      
      if (!user) {
        // 새 사용자 생성
        const newUser = await storage.createUser({
          email: googleEmail,
          nickname: googleName || googleEmail.split('@')[0],
          password: crypto.randomBytes(32).toString('hex'), // 랜덤 패스워드 (구글 로그인이므로 사용되지 않음)
          profileImage: googlePicture
        });
        user = newUser;
      } else if (googlePicture && !user.profileImage) {
        // 기존 사용자의 프로필 이미지 업데이트
        await storage.updateUser(user.id, { profileImage: googlePicture });
        user.profileImage = googlePicture;
      }
      
      return done(null, user);
    } catch (error) {
      return done(error as Error, false);
    }
  }));

  // Passport 세션 직렬화
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async createPasswordResetToken(userId: number): Promise<string> {
    const token = this.generateResetToken();
    const expiresAt = new Date(Date.now() + this.RESET_TOKEN_EXPIRY);

    // Delete any existing tokens for this user
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));

    // Create new token
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  static async validateResetToken(token: string): Promise<number | null> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );

    if (!resetToken) {
      return null;
    }

    return resetToken.userId;
  }

  static async deleteResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  static async cleanupExpiredResetTokens(): Promise<void> {
    await db.delete(passwordResetTokens).where(gt(new Date(), passwordResetTokens.expiresAt));
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // First check JWT token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      // Set user info from JWT
      req.user = {
        id: payload.userId,
        email: payload.email,
        nickname: payload.nickname
      };
      
      // Also set session for backward compatibility
      req.session = req.session || {};
      req.session.userId = payload.userId;
      
      return next();
    } catch (error) {
      console.error('JWT verification failed in requireAuth:', error);
      // Continue to session check if JWT fails
    }
  }
  
  // Fall back to session check
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // Only log for non-static requests to reduce noise
  if (!req.path.includes('.') && !req.path.includes('_next')) {
    console.log("Auth middleware - Path:", req.path, "Session ID:", req.sessionID, "UserId:", req.session?.userId);
  }
  
  if (req.session?.userId) {
    try {
      const user = await storage.getUserById(req.session.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          profileImage: user.profileImage || undefined,
          bio: user.bio || undefined
        };
        if (!req.path.includes('.')) {
          console.log("Auth middleware - user loaded:", user.nickname);
        }
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
    }
  }
  next();
}