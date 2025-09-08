"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
exports.initializeGoogleOAuth = initializeGoogleOAuth;
exports.requireAuth = requireAuth;
exports.authMiddleware = authMiddleware;
const bcrypt_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("./db");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const storage_1 = require("./storage");
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
// Google OAuth 설정
function initializeGoogleOAuth() {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
    if (!googleClientId || !googleClientSecret) {
        console.log('Google OAuth not configured. Skipping Google authentication setup.');
        return;
    }
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleRedirectUri
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // 구글에서 받은 정보
            const googleEmail = profile.emails?.[0]?.value;
            const googleName = profile.displayName;
            const googlePicture = profile.photos?.[0]?.value;
            if (!googleEmail) {
                return done(new Error('No email from Google'), false);
            }
            // 기존 사용자 확인
            let user = await storage_1.storage.getUserByEmail(googleEmail);
            if (!user) {
                // 새 사용자 생성
                const newUser = await storage_1.storage.createUser({
                    email: googleEmail,
                    nickname: googleName || googleEmail.split('@')[0],
                    password: crypto_1.default.randomBytes(32).toString('hex'), // 랜덤 패스워드 (구글 로그인이므로 사용되지 않음)
                    profileImage: googlePicture
                });
                user = newUser;
            }
            else if (googlePicture && !user.profileImage) {
                // 기존 사용자의 프로필 이미지 업데이트
                await storage_1.storage.updateUser(user.id, { profileImage: googlePicture });
                user.profileImage = googlePicture;
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    }));
    // Passport 세션 직렬화
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await storage_1.storage.getUserById(id);
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    });
}
class AuthService {
    static async hashPassword(password) {
        return bcrypt_1.default.hash(password, this.SALT_ROUNDS);
    }
    static async verifyPassword(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
    static generateSessionId() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    static generateResetToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    static async createPasswordResetToken(userId) {
        const token = this.generateResetToken();
        const expiresAt = new Date(Date.now() + this.RESET_TOKEN_EXPIRY);
        // Delete any existing tokens for this user
        await db_1.db.delete(schema_1.passwordResetTokens).where((0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.userId, userId));
        // Create new token
        await db_1.db.insert(schema_1.passwordResetTokens).values({
            userId,
            token,
            expiresAt,
        });
        return token;
    }
    static async validateResetToken(token) {
        const [resetToken] = await db_1.db
            .select()
            .from(schema_1.passwordResetTokens)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.token, token), (0, drizzle_orm_1.gt)(schema_1.passwordResetTokens.expiresAt, new Date())));
        if (!resetToken) {
            return null;
        }
        return resetToken.userId;
    }
    static async deleteResetToken(token) {
        await db_1.db.delete(schema_1.passwordResetTokens).where((0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.token, token));
    }
    static async cleanupExpiredResetTokens() {
        await db_1.db.delete(schema_1.passwordResetTokens).where((0, drizzle_orm_1.gt)(new Date(), schema_1.passwordResetTokens.expiresAt));
    }
}
exports.AuthService = AuthService;
AuthService.SALT_ROUNDS = 12;
AuthService.SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
AuthService.RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour
function requireAuth(req, res, next) {
    if (!req.session?.userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
}
async function authMiddleware(req, res, next) {
    // Only log for non-static requests to reduce noise
    if (!req.path.includes('.') && !req.path.includes('_next')) {
        console.log("Auth middleware - Path:", req.path, "Session ID:", req.sessionID, "UserId:", req.session?.userId);
    }
    if (req.session?.userId) {
        try {
            const user = await storage_1.storage.getUserById(req.session.userId);
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
        }
        catch (error) {
            console.error("Auth middleware error:", error);
        }
    }
    next();
}
