import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    user?: {
      id: number;
      email: string;
      nickname: string;
      profileImage: string | null;
      bio: string | null;
    };
  }
}