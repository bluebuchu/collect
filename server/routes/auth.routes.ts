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

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'server/uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: multerStorage,
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

// Logout
router.post("/api/auth/logout", (req, res) => {
  // 디버깅: 로그아웃 시작
  console.log("[Logout] Session ID:", req.sessionID);
  console.log("[Logout] User:", req.session?.user?.email);
  console.log("[Logout] Cookies:", req.cookies);
  console.log("[Logout] User-Agent:", req.headers['user-agent']);
  console.log("[Logout] Host:", req.headers.host);
  
  req.session.destroy((err) => {
    if (err) {
      console.error("[Logout] Session destroy error:", err);
      return res.status(500).json({ error: "로그아웃 처리 중 오류가 발생했습니다" });
    }
    
    // 호스트에서 도메인 추출
    const host = req.headers.host || '';
    const isVercel = host.includes('vercel.app');
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Vercel에서의 도메인 처리
    let domain: string | undefined;
    if (isVercel) {
      // .vercel.app 도메인 추출
      const domainMatch = host.match(/([^.]+\.vercel\.app)/);
      domain = domainMatch ? `.${domainMatch[1]}` : undefined;
    }
    
    console.log("[Logout] Environment:", { isProduction, isVercel, host, domain });
    
    // 여러 조합으로 쿠키 삭제 시도
    const cookieVariants = [
      // 1. 프로덕션 설정과 일치하는 옵션
      {
        path: '/',
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: isProduction
      },
      // 2. 도메인 포함
      {
        path: '/',
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: isProduction,
        domain
      },
      // 3. 기본 설정
      { path: '/' },
      // 4. secure와 sameSite 없이
      { 
        path: '/',
        httpOnly: true 
      }
    ];
    
    // 모든 조합으로 쿠키 삭제
    cookieVariants.forEach((options, index) => {
      console.log(`[Logout] Attempt ${index + 1} with options:`, options);
      res.clearCookie('sessionId', options);
      res.clearCookie('connect.sid', options);
    });
    
    // Response headers에 Set-Cookie 헤더 강제 추가
    if (isProduction) {
      const expiredDate = new Date(0).toUTCString();
      res.setHeader('Set-Cookie', [
        `sessionId=; Path=/; Expires=${expiredDate}; HttpOnly`,
        `connect.sid=; Path=/; Expires=${expiredDate}; HttpOnly`
      ]);
    }
    
    console.log("[Logout] Logout completed with multiple attempts");
    res.json({ message: "로그아웃되었습니다", cleared: true, attempts: cookieVariants.length });
  });
});

// Get current user - now supports both JWT and session
router.get("/api/auth/me", jwtAuthMiddleware, authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Check JWT first, then session
    const userId = req.user?.id || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "인증이 필요합니다" });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
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
    
    if (req.file) {
      validatedData.profileImage = `/uploads/profiles/${req.file.filename}`;
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
    failureRedirect: '/?error=google_auth_failed&reason=redirect_uri_mismatch' 
  }),
  async (req: any, res) => {
    // 구글 로그인 성공 후 세션에 사용자 정보 저장
    if (req.user) {
      req.session.userId = req.user.id;
      req.session.user = req.user;
      // 성공 메시지와 함께 리디렉션
      res.redirect('/?success=google_login');
    } else {
      // 사용자 정보가 없는 경우
      res.redirect('/?error=google_auth_failed');
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
  // 디버깅: Google 로그아웃 시작
  console.log("[Google Logout] Session ID:", req.sessionID);
  console.log("[Google Logout] User:", req.session?.user?.email);
  
  req.session.destroy((err) => {
    if (err) {
      console.error("[Google Logout] Session destroy error:", err);
      return res.status(500).json({ error: "로그아웃 처리 중 오류가 발생했습니다" });
    }
    
    // 호스트에서 도메인 추출
    const host = req.headers.host || '';
    const isVercel = host.includes('vercel.app');
    const isProduction = process.env.NODE_ENV === 'production';
    
    // 여러 조합으로 쿠키 삭제 시도
    const cookieVariants = [
      { path: '/', httpOnly: true, sameSite: 'lax' as const, secure: isProduction },
      { path: '/', httpOnly: true },
      { path: '/' }
    ];
    
    cookieVariants.forEach((options) => {
      res.clearCookie('sessionId', options);
      res.clearCookie('connect.sid', options);
    });
    
    // Response headers에 Set-Cookie 헤더 강제 추가
    if (isProduction) {
      const expiredDate = new Date(0).toUTCString();
      res.setHeader('Set-Cookie', [
        `sessionId=; Path=/; Expires=${expiredDate}; HttpOnly`,
        `connect.sid=; Path=/; Expires=${expiredDate}; HttpOnly`
      ]);
    }
    
    console.log("[Google Logout] Logout completed successfully");
    res.json({ message: "Google 로그아웃되었습니다", cleared: true });
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

export default router;