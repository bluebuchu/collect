"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schema_1 = require("@shared/schema");
const auth_1 = require("../auth");
const storage_1 = require("../storage");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const passport_1 = __importDefault(require("passport"));
// Configure multer for file uploads
const multerStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'server/uploads/profiles';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
const router = (0, express_1.Router)();
// Register
router.post("/api/auth/register", async (req, res) => {
    try {
        const validatedData = schema_1.registerUserSchema.parse(req.body);
        const existingUser = await storage_1.storage.getUserByEmail(validatedData.email);
        if (existingUser) {
            return res.status(400).json({ error: "이미 사용 중인 이메일입니다" });
        }
        const hashedPassword = await auth_1.AuthService.hashPassword(validatedData.password);
        const newUser = await storage_1.storage.createUser({
            ...validatedData,
            password: hashedPassword,
        });
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
            message: "회원가입이 완료되었습니다"
        });
    }
    catch (error) {
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
        const validatedData = schema_1.loginUserSchema.parse(req.body);
        const user = await storage_1.storage.getUserByEmail(validatedData.email);
        if (!user) {
            return res.status(400).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });
        }
        const isValid = await auth_1.AuthService.verifyPassword(validatedData.password, user.password);
        if (!isValid) {
            return res.status(400).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });
        }
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
            message: "로그인되었습니다"
        });
    }
    catch (error) {
        console.error("Login error:", error);
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: "로그인 처리 중 오류가 발생했습니다" });
    }
});
// Logout
router.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "로그아웃 처리 중 오류가 발생했습니다" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "로그아웃되었습니다" });
    });
});
// Get current user
router.get("/api/auth/me", auth_1.authMiddleware, async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({ error: "인증이 필요합니다" });
        }
        const user = await storage_1.storage.getUserById(req.session.userId);
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
    }
    catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ error: "사용자 정보 조회 중 오류가 발생했습니다" });
    }
});
// Update profile
router.put("/api/auth/profile", auth_1.requireAuth, upload.single('profileImage'), async (req, res) => {
    try {
        const userId = req.session.userId;
        const validatedData = schema_1.updateUserSchema.parse(req.body);
        if (req.file) {
            validatedData.profileImage = `/uploads/profiles/${req.file.filename}`;
        }
        const updatedUser = await storage_1.storage.updateUser(userId, validatedData);
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
    }
    catch (error) {
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
        const validatedData = schema_1.passwordResetRequestSchema.parse(req.body);
        const user = await storage_1.storage.getUserByEmail(validatedData.email);
        if (!user) {
            return res.json({ message: "비밀번호 재설정 링크가 이메일로 전송되었습니다" });
        }
        const token = await storage_1.storage.createPasswordResetToken(user.id);
        console.log(`Password reset token for ${user.email}: ${token}`);
        res.json({ message: "비밀번호 재설정 링크가 이메일로 전송되었습니다" });
    }
    catch (error) {
        console.error("Password reset request error:", error);
        res.status(500).json({ error: "비밀번호 재설정 요청 처리 중 오류가 발생했습니다" });
    }
});
// Password reset
router.post("/api/auth/password-reset", async (req, res) => {
    try {
        const validatedData = schema_1.passwordResetSchema.parse(req.body);
        const isValid = await storage_1.storage.validatePasswordResetToken(validatedData.token);
        if (!isValid) {
            return res.status(400).json({ error: "유효하지 않거나 만료된 토큰입니다" });
        }
        const hashedPassword = await auth_1.AuthService.hashPassword(validatedData.newPassword);
        await storage_1.storage.resetPassword(validatedData.token, hashedPassword);
        res.json({ message: "비밀번호가 성공적으로 변경되었습니다" });
    }
    catch (error) {
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
        const validatedData = schema_1.findEmailSchema.parse(req.body);
        const user = await storage_1.storage.getUserByNickname(validatedData.nickname);
        if (!user) {
            return res.status(404).json({ error: "해당 닉네임으로 등록된 사용자를 찾을 수 없습니다" });
        }
        const maskedEmail = user.email.replace(/^(.{2})(.*)(@.*)$/, (match, p1, p2, p3) => {
            return p1 + '*'.repeat(Math.min(p2.length, 5)) + p3;
        });
        res.json({ email: maskedEmail });
    }
    catch (error) {
        console.error("Find email error:", error);
        res.status(500).json({ error: "이메일 찾기 중 오류가 발생했습니다" });
    }
});
// Google OAuth routes
router.get("/api/auth/google", passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get("/api/auth/google/callback", passport_1.default.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    // 구글 로그인 성공 후 세션에 사용자 정보 저장
    if (req.user) {
        req.session.userId = req.user.id;
        req.session.user = req.user;
    }
    // 클라이언트 홈페이지로 리디렉션
    res.redirect('/');
});
exports.default = router;
