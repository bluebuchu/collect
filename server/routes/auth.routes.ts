import { Router } from "express";
import { 
  registerUserSchema, 
  loginUserSchema, 
  updateUserSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  findEmailSchema
} from "@shared/schema";
import { AuthService, authMiddleware, requireAuth, isGoogleOAuthAllowed, type AuthRequest } from "../auth";
import * as authModule from "../auth";
import { storage } from "../storage";
import { emailService } from "../email";
import multer from "multer";
import path from "path";
import fs from "fs";
import passport from "passport";
import { generateToken, jwtAuthMiddleware, requireJwtAuth } from "../jwt-auth";
import { put } from "@vercel/blob";

// Configure multer for file uploads - using memory storage for Vercel Blob
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const router = Router();

// Register
router.post("/api/auth/register", async (req, res) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);
    
    // Check for duplicate email
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ error: "이미 사용 중인 이메일입니다" });
    }
    
    // Check for duplicate nickname
    const existingNickname = await storage.getUserByNickname(validatedData.nickname);
    if (existingNickname) {
      return res.status(400).json({ error: "이미 사용 중인 닉네임입니다" });
    }
    
    const hashedPassword = await AuthService.hashPassword(validatedData.password);
    const newUser = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
    });
    
    // Generate JWT token for auto-login
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      nickname: newUser.nickname
    });
    
    // Set session for auto-login
    req.session.userId = newUser.id;
    req.session.user = newUser;
    
    res.json({ 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        nickname: newUser.nickname,
        profileImage: newUser.profileImage,
        bio: newUser.bio
      },
      token,
      autoLogin: true,
      message: "회원가입이 완료되었습니다. 자동으로 로그인됩니다."
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "회원가입 처리 중 오류가 발생했습니다" });
  }
});

// Login
router.post("/api/auth/login", async (req, res) => {
  try {
    const validatedData = loginUserSchema.parse(req.body);
    const user = await storage.getUserByEmail(validatedData.email);
    
    if (!user) {
      return res.status(400).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });
    }
    
    const isValid = await AuthService.verifyPassword(validatedData.password, user.password);
    
    if (!isValid) {
      return res.status(400).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname
    });
    
    // Still set session for backward compatibility
    req.session.userId = user.id;
    req.session.user = user;
    
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        nickname: user.nickname,
        profileImage: user.profileImage,
        bio: user.bio
      },
      token,
      message: "로그인되었습니다"
    });
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "로그인 처리 중 오류가 발생했습니다" });
  }
});

// Logout - 완전한 세션 파괴
router.post("/api/auth/logout", async (req, res) => {
  console.log("[Logout] Starting complete logout process");
  console.log("[Logout] Session ID:", req.sessionID);
  console.log("[Logout] User ID:", req.session?.userId);
  console.log("[Logout] User:", req.session?.user?.email);
  
  // 1. 세션 데이터 완전 삭제
  if (req.session) {
    // 세션 데이터 수동 삭제
    req.session.userId = undefined;
    req.session.user = undefined;
    
    // 세션 완전 파괴 (Promise로 변환)
    await new Promise<void>((resolve) => {
      req.session!.destroy((err) => {
        if (err) {
          console.error("[Logout] Session destroy error:", err);
        }
        resolve();
      });
    });
  }
  
  // 2. 모든 가능한 쿠키 이름 삭제
  const cookieNames = [
    'sessionId', 
    'connect.sid', 
    'jwt', 
    'auth_token',
    'auth-token',
    'session',
    'sid'
  ];
  
  // 3. 다양한 방법으로 쿠키 삭제
  cookieNames.forEach(name => {
    // 기본 삭제
    res.clearCookie(name);
    
    // 옵션 포함 삭제
    res.clearCookie(name, { path: '/' });
    res.clearCookie(name, { path: '/', domain: req.hostname });
    
    // 프로덕션 환경 삭제
    if (process.env.NODE_ENV === 'production') {
      res.clearCookie(name, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
    }
  });
  
  // 4. Set-Cookie 헤더로 강제 삭제
  const setCookieHeaders = cookieNames.map(name => 
    `${name}=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
  res.setHeader('Set-Cookie', setCookieHeaders);
  
  // 5. 캐시 방지 헤더
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  console.log("[Logout] Complete - all sessions and cookies cleared");
  
  // 6. 성공 응답
  res.status(200).json({ 
    success: true,
    message: "로그아웃되었습니다", 
    cleared: true,
    requireReload: true
  });
});

// Get current user - session-based authentication only
router.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Use session-based authentication only
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "인증이 필요합니다" });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      // Clear invalid session
      if (req.session) {
        req.session.userId = undefined;
        req.session.user = undefined;
      }
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
    }

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "사용자 정보 조회 중 오류가 발생했습니다" });
  }
});

// Update profile
router.put("/api/auth/profile", requireAuth, upload.single('profileImage'), async (req: AuthRequest, res) => {
  try {
    const userId = req.session!.userId!;
    const validatedData = updateUserSchema.parse(req.body);
    
    // Check for duplicate nickname if changing nickname
    if (validatedData.nickname) {
      const currentUser = await storage.getUserById(userId);
      if (currentUser && currentUser.nickname !== validatedData.nickname) {
        const existingNickname = await storage.getUserByNickname(validatedData.nickname);
        if (existingNickname) {
          return res.status(400).json({ error: "이미 사용 중인 닉네임입니다" });
        }
      }
    }
    
    // Handle profile image upload using Vercel Blob
    if (req.file) {
      try {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `profile-${uniqueSuffix}${path.extname(req.file.originalname)}`;
        
        // Upload to Vercel Blob
        const blob = await put(filename, req.file.buffer, {
          access: 'public',
          contentType: req.file.mimetype,
        });
        
        // Store the blob URL
        validatedData.profileImage = blob.url;
        console.log('Profile image uploaded to Vercel Blob:', blob.url);
      } catch (blobError) {
        console.error('Vercel Blob upload error:', blobError);
        return res.status(500).json({ error: "이미지 업로드에 실패했습니다" });
      }
    }
    
    const updatedUser = await storage.updateUser(userId, validatedData);
    
    req.session.user = updatedUser;
    
    res.json({ 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio
      },
      message: "프로필이 업데이트되었습니다"
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "프로필 업데이트 중 오류가 발생했습니다" });
  }
});

// Password reset request
router.post("/api/auth/password-reset/request", async (req, res) => {
  try {
    const validatedData = passwordResetRequestSchema.parse(req.body);
    const user = await storage.getUserByEmail(validatedData.email);
    
    if (!user) {
      // Don't reveal whether the email exists for security
      return res.json({ message: "입력하신 이메일이 등록되어 있다면, 비밀번호 재설정 링크가 전송됩니다." });
    }
    
    const token = await storage.createPasswordResetToken(user.id);
    
    // Send email with reset link
    const emailSent = await emailService.sendPasswordResetEmail(user.email, token, user.nickname);
    
    if (!emailSent) {
      // If email fails, still log the token for development
      console.log(`[Dev Mode] Password reset token for ${user.email}: ${token}`);
      // In development, return token for testing
      if (process.env.NODE_ENV !== "production") {
        return res.json({ 
          message: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
          token // Only include token in development
        });
      }
    }
    
    res.json({ message: "입력하신 이메일이 등록되어 있다면, 비밀번호 재설정 링크가 전송됩니다." });
  } catch (error: any) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "비밀번호 재설정 요청 처리 중 오류가 발생했습니다" });
  }
});

// Password reset
router.post("/api/auth/password-reset", async (req, res) => {
  try {
    const validatedData = passwordResetSchema.parse(req.body);
    
    const isValid = await storage.validatePasswordResetToken(validatedData.token);
    if (!isValid) {
      return res.status(400).json({ error: "유효하지 않거나 만료된 토큰입니다" });
    }
    
    const hashedPassword = await AuthService.hashPassword(validatedData.newPassword);
    await storage.resetPassword(validatedData.token, hashedPassword);
    
    res.json({ message: "비밀번호가 성공적으로 변경되었습니다" });
  } catch (error: any) {
    console.error("Password reset error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "비밀번호 재설정 중 오류가 발생했습니다" });
  }
});

// Find email by nickname
router.post("/api/auth/find-email", async (req, res) => {
  try {
    const validatedData = findEmailSchema.parse(req.body);
    const user = await storage.getUserByNickname(validatedData.nickname);
    
    if (!user) {
      return res.status(404).json({ error: "해당 닉네임으로 등록된 사용자를 찾을 수 없습니다" });
    }
    
    const maskedEmail = user.email.replace(/^(.{2})(.*)(@.*)$/, (match, p1, p2, p3) => {
      return p1 + '*'.repeat(Math.min(p2.length, 5)) + p3;
    });
    
    res.json({ email: maskedEmail });
  } catch (error: any) {
    console.error("Find email error:", error);
    res.status(500).json({ error: "이메일 찾기 중 오류가 발생했습니다" });
  }
});

// Google OAuth routes
router.get("/api/auth/google", 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get("/api/auth/google/callback",
  passport.authenticate('google', { 
    failureRedirect: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173/?error=google_auth_failed&reason=authentication_error'
      : '/?error=google_auth_failed&reason=authentication_error' 
  }),
  async (req: any, res) => {
    // 구글 로그인 성공 후 세션에 사용자 정보 저장
    if (req.user) {
      req.session.userId = req.user.id;
      req.session.user = req.user;
      
      console.log('[Google OAuth] Login successful for user:', req.user.email);
      
      // 세션 저장 확인
      req.session.save((err: any) => {
        if (err) {
          console.error('[Google OAuth] Session save error:', err);
        }
        
        // 개발 환경에서는 Vite 개발 서버로 리디렉션
        const redirectUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5173/?success=google_login'
          : '/?success=google_login';
        
        console.log('[Google OAuth] Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
      });
    } else {
      // 사용자 정보가 없는 경우
      console.error('[Google OAuth] No user data after authentication');
      const redirectUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173/?error=google_auth_failed&reason=no_user_data'
        : '/?error=google_auth_failed&reason=no_user_data';
      res.redirect(redirectUrl);
    }
  }
);

// Google OAuth 상태 확인
router.get("/api/auth/google/status", async (req: AuthRequest, res) => {
  try {
    // Google OAuth 가능 여부 확인
    const host = req.get('host') || '';
    const isOAuthAllowed = authModule.isGoogleOAuthAllowed(host);
    
    let user = null;
    if (req.session?.userId) {
      const userData = await storage.getUserById(req.session.userId);
      if (userData) {
        user = {
          id: userData.id,
          email: userData.email,
          nickname: userData.nickname,
          profileImage: userData.profileImage,
          bio: userData.bio
        };
      }
    }
    
    res.json({ 
      user,
      isGoogleOAuthEnabled: isOAuthAllowed,
      currentHost: host,
      message: isOAuthAllowed ? null : 'Google OAuth is not available on preview deployments'
    });
  } catch (error) {
    console.error("Google OAuth status check error:", error);
    res.json({ 
      user: null, 
      isGoogleOAuthEnabled: false,
      message: 'Error checking OAuth status'
    });
  }
});

// Google OAuth 로그아웃
router.post("/api/auth/google/logout", (req, res) => {
  console.log("[Google Logout] Starting logout process");
  
  // 세션 파괴
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("[Google Logout] Session destroy error:", err);
      }
    });
  }
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  // 쿠키 삭제
  res.clearCookie('sessionId');
  res.clearCookie('connect.sid');
  
  if (isProduction) {
    res.clearCookie('sessionId', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
  }
  
  // Set-Cookie 헤더 강제 설정
  res.setHeader('Set-Cookie', [
    'sessionId=; Max-Age=0; Path=/; HttpOnly',
    'connect.sid=; Max-Age=0; Path=/; HttpOnly'
  ]);
  
  console.log("[Google Logout] Cookies cleared");
  res.json({ 
    message: "Google 로그아웃되었습니다", 
    cleared: true,
    requireReload: true
  });
});

// Supabase Auth 사용자 동기화
router.post("/api/auth/sync", async (req: AuthRequest, res) => {
  try {
    const { id, email, name, avatar, provider } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // 기존 사용자 확인
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // 새 사용자 생성
      user = await storage.createUser({
        email,
        nickname: name || email.split('@')[0],
        password: `supabase_${id}_${Date.now()}`, // Supabase Auth 사용자는 패스워드 불필요
        profileImage: avatar,
        bio: `Joined via ${provider}`
      });
    } else {
      // 기존 사용자 업데이트
      if (avatar && !user.profileImage) {
        await storage.updateUser(user.id, { 
          profileImage: avatar 
        });
      }
    }

    // 세션 생성
    req.session.userId = user.id;
    req.session.user = user;
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage
      }
    });
  } catch (error: any) {
    console.error("Supabase user sync error:", error);
    res.status(500).json({ error: "Failed to sync user data" });
  }
});

// Token refresh endpoint
router.post("/api/auth/refresh", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "인증이 필요합니다" });
    }

    // Get user data for new token
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
    }

    // Generate new JWT token
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname
    });

    // Update session expiry
    if (req.session) {
      req.session.touch(); // Refresh session expiry
    }

    console.log(`Token refreshed for user ${userId}`);
    res.json({ 
      token: newToken,
      message: "토큰이 갱신되었습니다"
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "토큰 갱신 중 오류가 발생했습니다" });
  }
});

export default router;