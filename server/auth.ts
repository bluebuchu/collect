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

// 허용된 Google OAuth 도메인 목록
const ALLOWED_OAUTH_DOMAINS = [
  'localhost:5000',
  'collect-topaz.vercel.app',
  // 필요한 경우 여기에 추가 도메인 입력
];

// 현재 도메인이 Google OAuth를 사용할 수 있는지 확인
export function isGoogleOAuthAllowed(host: string): boolean {
  if (!host) return false;
  
  // 프로토콜 제거하고 도메인만 추출
  const domain = host.replace(/^https?:\/\//, '').split('/')[0];
  
  // 허용된 도메인 목록에 있는지 확인
  return ALLOWED_OAUTH_DOMAINS.some(allowed => 
    domain === allowed || domain.startsWith(allowed)
  );
}

// Google OAuth 설정
export function initializeGoogleOAuth() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Redirect URI 설정 - 명확한 우선순위
  let googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  if (!googleRedirectUri) {
    // 1. 명시적 환경 변수가 있으면 사용
    if (process.env.GOOGLE_REDIRECT_URI) {
      googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
    }
    // 2. Vercel 프로덕션 도메인
    else if (process.env.VERCEL_ENV === 'production') {
      googleRedirectUri = 'https://collect-topaz.vercel.app/api/auth/google/callback';
    }
    // 3. Vercel 프리뷰는 지원하지 않음 (와일드카드 불가)
    else if (process.env.VERCEL_ENV === 'preview') {
      console.log('Google OAuth is not supported on Vercel preview deployments (wildcard domains not allowed)');
      return;
    }
    // 4. 로컬 개발
    else {
      googleRedirectUri = 'http://localhost:5000/api/auth/google/callback';
    }
  }

  if (!googleClientId || !googleClientSecret) {
    console.log('Google OAuth not configured. Skipping Google authentication setup.');
    console.log('To enable Google OAuth, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    return;
  }

  console.log('Initializing Google OAuth');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Vercel Environment:', process.env.VERCEL_ENV);
  console.log('Redirect URI:', googleRedirectUri);

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
  console.log('[requireAuth] Authorization header:', authHeader ? 'Present' : 'Missing');
  console.log('[requireAuth] Session userId:', req.session?.userId);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      console.log('[requireAuth] JWT verified for user:', payload.userId);
      
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
      console.error('[requireAuth] JWT verification failed:', error);
      // Continue to session check if JWT fails
    }
  }
  
  // Fall back to session check
  if (!req.session?.userId) {
    console.error('[requireAuth] No authentication found - returning 401');
    return res.status(401).json({ 
      error: 'Authentication required',
      message: '인증이 필요합니다. 로그인 해주세요.'
    });
  }
  console.log('[requireAuth] Authenticated via session:', req.session.userId);
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