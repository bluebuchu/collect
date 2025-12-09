import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'jwt-secret-change-in-production';

export interface TokenPayload {
  userId: number;
  email: string;
  nickname: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // 1시간에서 7일로 변경
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    nickname: string;
    profileImage?: string;
    bio?: string;
  };
}

export async function jwtAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    req.user = {
      id: payload.userId,
      email: payload.email,
      nickname: payload.nickname
    };
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    next();
  }
}

export function requireJwtAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "인증이 필요합니다" });
  }
  next();
}