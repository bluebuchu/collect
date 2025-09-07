import type { Express } from "express";
import Express from "express";
import { createServer, type Server } from "http";
import { storage, DatabaseStorage } from "./storage";
import { db } from "./db";
import { sentences } from "@shared/schema";
import { eq } from "drizzle-orm";
import { 
  insertSentenceSchema, 
  searchSchema, 
  updateSentenceSchema, 
  registerUserSchema, 
  loginUserSchema, 
  updateUserSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  findEmailSchema,
  deleteSentenceSchema,
  adminDeleteSchema
} from "@shared/schema";
import { AuthService, authMiddleware, requireAuth, type AuthRequest } from "./auth";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}

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
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', Express.static('server/uploads'));

  // Setup session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Add auth middleware to all routes
  app.use(authMiddleware);

  // Authentication routes
  app.post("/api/auth/register", async (req: AuthRequest, res) => {
    try {
      console.log("Register request:", req.body);
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "이미 등록된 이메일입니다." });
      }

      // Hash password
      const hashedPassword = await AuthService.hashPassword(validatedData.password);
      
      // Create user with hashed password
      const userData = {
        ...validatedData,
        password: hashedPassword
      };
      
      const user = await storage.createUser(userData);
      
      // Create session and force save
      req.session.userId = user.id;
      
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            console.log("Session saved for user:", user.id);
            resolve();
          }
        });
      });

      res.status(201).json({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        bio: user.bio,
      });
    } catch (error: any) {
      console.error("Register error details:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "입력 데이터가 올바르지 않습니다." });
      }
      res.status(500).json({ message: "회원가입에 실패했습니다." });
    }
  });

  app.post("/api/auth/login", async (req: AuthRequest, res) => {
    try {
      console.log("=== LOGIN ATTEMPT ===");
      console.log("Request body:", req.body);
      console.log("Before login - Session ID:", req.sessionID);
      
      const { email, password } = loginUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      }

      // Verify password
      const isValidPassword = await AuthService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      }

      // Regenerate session for security
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error("Session regeneration error:", err);
            reject(err);
          } else {
            console.log("Session regenerated - New ID:", req.sessionID);
            resolve();
          }
        });
      });
      
      // Set user ID in session
      req.session.userId = user.id;
      console.log("Set userId in session:", user.id);
      
      // Force save session
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            console.log("Session saved successfully - Final session:", req.session);
            resolve();
          }
        });
      });

      const userData = {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        bio: user.bio,
      };
      
      console.log("Login successful - returning:", userData.nickname);
      res.json(userData);
    } catch (error: any) {
      console.error("Login error details:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "입력 데이터가 올바르지 않습니다." });
      }
      res.status(500).json({ message: "로그인에 실패했습니다." });
    }
  });

  app.post("/api/auth/logout", async (req: AuthRequest, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Password reset request
  app.post("/api/auth/forgot-password", async (req: AuthRequest, res) => {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: "비밀번호 재설정 링크가 전송되었습니다." });
      }

      const resetToken = await AuthService.createPasswordResetToken(user.id);
      
      // In a real application, you would send an email here
      // For now, we'll just log the token for testing
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      res.json({ 
        message: "비밀번호 재설정 링크가 전송되었습니다.",
        // Include token for testing - remove in production
        token: resetToken
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "올바른 이메일 주소를 입력해주세요." });
      }
      res.status(500).json({ message: "비밀번호 재설정 요청에 실패했습니다." });
    }
  });

  // Password reset
  app.post("/api/auth/reset-password", async (req: AuthRequest, res) => {
    try {
      const { token, newPassword } = passwordResetSchema.parse(req.body);
      
      const userId = await AuthService.validateResetToken(token);
      if (!userId) {
        return res.status(400).json({ message: "유효하지 않거나 만료된 토큰입니다." });
      }

      // Update password
      const hashedPassword = await AuthService.hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPassword });
      
      // Delete the used token
      await AuthService.deleteResetToken(token);
      
      res.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "입력 데이터가 올바르지 않습니다." });
      }
      res.status(500).json({ message: "비밀번호 변경에 실패했습니다." });
    }
  });

  // Find email by nickname
  app.post("/api/auth/find-email", async (req: AuthRequest, res) => {
    try {
      const { nickname } = findEmailSchema.parse(req.body);
      
      const user = await storage.getUserByNickname(nickname);
      if (!user) {
        return res.status(404).json({ message: "해당 닉네임의 사용자를 찾을 수 없습니다." });
      }

      // Mask email for security (show first 2 chars and domain)
      const emailParts = user.email.split('@');
      const maskedEmail = emailParts[0].substring(0, 2) + '*'.repeat(emailParts[0].length - 2) + '@' + emailParts[1];
      
      res.json({ 
        email: maskedEmail,
        message: `회원님의 이메일은 ${maskedEmail} 입니다.`
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "닉네임을 입력해주세요." });
      }
      res.status(500).json({ message: "이메일 찾기에 실패했습니다." });
    }
  });

  app.get("/api/auth/me", async (req: AuthRequest, res) => {
    console.log("Auth check - userId:", req.session?.userId);
    
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      res.json({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        bio: user.bio,
      });
    } catch (error) {
      console.error("Auth validation error:", error);
      res.status(401).json({ message: "Authentication required" });
    }
  });

  // Get all sentences
  app.get("/api/sentences", async (req: AuthRequest, res) => {
    try {
      const sentences = await storage.getSentences();
      res.json(sentences);
    } catch (error) {
      console.error("Error fetching sentences:", error);
      res.status(500).json({ message: "문장을 불러오는데 실패했습니다." });
    }
  });

  // Create sentence
  app.post("/api/sentences", requireAuth, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertSentenceSchema.parse(req.body);
      const sentence = await storage.createSentence(validatedData, req.user!.id);
      res.status(201).json(sentence);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "입력 데이터가 올바르지 않습니다." });
      } else {
        res.status(500).json({ message: "문장 등록에 실패했습니다." });
      }
    }
  });

  // Update sentence
  app.put("/api/sentences/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateSentenceSchema.parse(req.body);
      const sentence = await storage.updateSentence(id, validatedData, req.user!.id);
      
      if (sentence) {
        res.json(sentence);
      } else {
        res.status(403).json({ message: "수정 권한이 없습니다." });
      }
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "입력 데이터가 올바르지 않습니다." });
      } else {
        res.status(500).json({ message: "문장 수정에 실패했습니다." });
      }
    }
  });

  // Delete sentence
  app.delete("/api/sentences/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSentence(id, req.user!.id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(403).json({ message: "삭제 권한이 없습니다." });
      }
    } catch (error) {
      res.status(500).json({ message: "문장 삭제에 실패했습니다." });
    }
  });

  // Admin delete sentence
  app.delete("/api/sentences/:id/admin", async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { adminPassword } = req.body;
      const success = await storage.adminDeleteSentence(id, adminPassword);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "관리자 비밀번호가 올바르지 않습니다." });
      }
    } catch (error) {
      res.status(500).json({ message: "문장 삭제에 실패했습니다." });
    }
  });

  // Like sentence - authentication optional for likes
  app.post("/api/sentences/:id/like", async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const sentence = await storage.incrementLikes(id);
      
      if (sentence) {
        res.json(sentence);
      } else {
        res.status(404).json({ message: "문장을 찾을 수 없습니다." });
      }
    } catch (error) {
      console.error("Like error:", error);
      res.status(500).json({ message: "좋아요 처리에 실패했습니다." });
    }
  });

  // Get user's own sentences
  app.get("/api/sentences/my", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { search } = req.query;
      let sentences;
      
      if (search && typeof search === 'string') {
        sentences = await storage.getUserSentencesWithSearch(req.user!.id, search);
      } else {
        sentences = await storage.getUserSentences(req.user!.id);
      }
      
      res.json(sentences);
    } catch (error) {
      console.error("Error fetching user sentences:", error);
      res.status(500).json({ message: "문장을 불러오는데 실패했습니다." });
    }
  });

  // Search sentences
  app.get("/api/sentences/search", async (req: AuthRequest, res) => {
    try {
      const { query } = req.query;
      let sentences;
      
      if (query && typeof query === 'string') {
        sentences = await storage.searchSentences(query);
      } else {
        sentences = await storage.getSentences();
      }
      
      res.json(sentences);
    } catch (error) {
      res.status(500).json({ message: "검색에 실패했습니다." });
    }
  });

  // Search books using Aladin API
  app.get("/api/books/search", async (req: AuthRequest, res) => {
    try {
      const { query } = req.query;
      console.log("Book search request for:", query);
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "검색어가 필요합니다." });
      }

      // Try Aladin API first
      const apiKey = "ttbkiyu001041002";
      const baseUrl = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx";
      
      const params = new URLSearchParams({
        ttbkey: apiKey,
        Query: query,
        QueryType: 'Title',
        MaxResults: '10',
        start: '1',
        SearchTarget: 'Book',
        output: 'xml',
        Version: '20131101'
      });

      try {
        console.log("Calling Aladin API:", `${baseUrl}?${params}`);
        const aladinResponse = await fetch(`${baseUrl}?${params}`);
        
        if (aladinResponse.ok) {
          const aladinData = await aladinResponse.text();
          console.log("Aladin raw response:", aladinData.substring(0, 1000));
          
          // Parse XML response
          const books = parseAladinXML(aladinData);
          
          console.log("Books from Aladin API:", books.length);
          
          // If we got results from Aladin, return them
          if (books.length > 0) {
            console.log("Formatted books from Aladin:", books);
            return res.json({ books });
          }
        }
      } catch (aladinError: any) {
        console.log("Aladin API failed, using fallback:", aladinError?.message || aladinError);
      }

      // Fallback: Use sample Korean books for demonstration
      const sampleBooks = [
        {
          title: "모모",
          author: "미하엘 엔데",
          publisher: "비룡소",
          pubDate: "2000-01-01",
          cover: "https://image.aladin.co.kr/product/132/12/cover/8949141272_1.jpg"
        },
        {
          title: "소년이 온다",
          author: "한강",
          publisher: "창비",
          pubDate: "2014-05-19",
          cover: "https://image.aladin.co.kr/product/473/70/cover/8936434594_1.jpg"
        },
        {
          title: "82년생 김지영",
          author: "조남주",
          publisher: "민음사",
          pubDate: "2016-10-14",
          cover: "https://image.aladin.co.kr/product/827/84/cover/8937461412_1.jpg"
        },
        {
          title: "코스모스",
          author: "칼 세이건",
          publisher: "사이언스북스",
          pubDate: "2006-12-20",
          cover: "https://image.aladin.co.kr/product/109/29/cover/8983711787_1.jpg"
        },
        {
          title: "해리 포터와 마법사의 돌",
          author: "J.K. 롤링",
          publisher: "문학수첩",
          pubDate: "1999-12-07",
          cover: "https://image.aladin.co.kr/product/109/47/cover/8983920653_1.jpg"
        },
        {
          title: "나미야 잡화점의 기적",
          author: "히가시노 게이고",
          publisher: "현대문학",
          pubDate: "2012-12-19",
          cover: "https://image.aladin.co.kr/product/292/64/cover/8972756865_1.jpg"
        }
      ];

      // Filter sample books based on search query
      const filteredBooks = sampleBooks.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
      );

      console.log("Using sample books, filtered results:", filteredBooks);
      res.json({ books: filteredBooks });
    } catch (error) {
      console.error("Book search error:", error);
      res.status(500).json({ message: "책 검색에 실패했습니다." });
    }
  });

  // Helper function to parse Aladin XML response
  function parseAladinXML(xmlData: string) {
    const books: any[] = [];
    
    try {
      console.log("Parsing XML, length:", xmlData.length);
      
      // Split by <item> tags and process each item
      const itemParts = xmlData.split('<item itemId="');
      
      for (let i = 1; i < itemParts.length; i++) {
        const itemContent = itemParts[i];
        const endIndex = itemContent.indexOf('</item>');
        
        if (endIndex > 0) {
          const fullItemContent = itemContent.substring(0, endIndex);
          console.log("Found item content:", fullItemContent.substring(0, 200));
          
          const title = extractXMLValue(fullItemContent, 'title');
          const author = extractXMLValue(fullItemContent, 'author');
          const publisher = extractXMLValue(fullItemContent, 'publisher');
          const pubDate = extractXMLValue(fullItemContent, 'pubDate');
          const cover = extractXMLValue(fullItemContent, 'cover');
          
          if (title) {
            const book = {
              title: cleanXMLText(title),
              author: cleanXMLText(author),
              publisher: cleanXMLText(publisher),
              pubDate: pubDate,
              cover: cover
            };
            
            console.log("Parsed book:", book);
            books.push(book);
          }
        }
      }
      
      console.log("Total books parsed:", books.length);
    } catch (error) {
      console.error("Error parsing XML:", error);
    }
    
    return books;
  }
  
  // Helper function to clean XML text content
  function cleanXMLText(text: string): string {
    if (!text) return '';
    return text
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')  // Remove CDATA
      .replace(/<[^>]*>/g, '')                   // Remove HTML tags
      .trim();
  }

  // Helper function to extract value from XML element
  function extractXMLValue(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's');
    const match = xml.match(regex);
    return match ? match[1] : '';
  }

  // Upload profile image
  app.post("/api/auth/upload-profile-image", requireAuth, upload.single('profileImage'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "이미지 파일이 필요합니다." });
      }

      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      
      // Update user profile with new image URL
      const updatedUser = await storage.updateUser(req.user!.id, {
        profileImage: imageUrl
      });

      if (updatedUser) {
        res.json({
          profileImage: updatedUser.profileImage,
          message: "프로필 이미지가 업로드되었습니다."
        });
      } else {
        res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }
    } catch (error: any) {
      console.error("Profile image upload error:", error);
      res.status(500).json({ message: "이미지 업로드에 실패했습니다." });
    }
  });

  // Update user profile
  app.put("/api/auth/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const validatedData = updateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user!.id, validatedData);
      
      if (updatedUser) {
        res.json({
          id: updatedUser.id,
          email: updatedUser.email,
          nickname: updatedUser.nickname,
          profileImage: updatedUser.profileImage,
          bio: updatedUser.bio,
        });
      } else {
        res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "입력 데이터가 올바르지 않습니다." });
      } else {
        res.status(500).json({ message: "프로필 업데이트에 실패했습니다." });
      }
    }
  });

  // Get user statistics
  app.get("/api/user/stats", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user's sentences with statistics
      const userSentences = await db
        .select({
          id: sentences.id,
          bookTitle: sentences.bookTitle,
          likes: sentences.likes,
          createdAt: sentences.createdAt,
        })
        .from(sentences)
        .where(eq(sentences.userId, userId));

      // Calculate statistics
      const totalSentences = userSentences.length;
      const totalLikes = userSentences.reduce((sum, sentence) => sum + sentence.likes, 0);
      
      // Get favorite books (most frequently cited)
      const bookCounts = userSentences
        .filter(sentence => sentence.bookTitle)
        .reduce((acc, sentence) => {
          acc[sentence.bookTitle!] = (acc[sentence.bookTitle!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      
      const favoriteBooks = Object.entries(bookCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([book]) => book);

      // Get join date from user
      const user = await storage.getUserById(userId);
      const joinedDate = user?.createdAt;

      // Recent activity
      const recentActivity = userSentences.length > 0 
        ? `최근 문장 등록: ${formatTimeAgo(new Date(userSentences[0].createdAt))}`
        : '아직 등록한 문장이 없습니다';

      res.json({
        totalSentences,
        totalLikes,
        favoriteBooks,
        joinedDate,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "사용자 통계를 불러오는데 실패했습니다." });
    }
  });

  // Delete sentence
  app.delete("/api/sentences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = deleteSentenceSchema.parse(req.body);
      
      const success = await storage.deleteSentence(id, validatedData.password);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "비밀번호가 올바르지 않거나 문장을 찾을 수 없습니다." });
      }
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "비밀번호를 입력해주세요." });
      } else {
        res.status(500).json({ message: "문장 삭제에 실패했습니다." });
      }
    }
  });

  // Increment likes
  app.post("/api/sentences/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sentence = await storage.incrementLikes(id);
      
      if (sentence) {
        res.json(sentence);
      } else {
        res.status(404).json({ message: "문장을 찾을 수 없습니다." });
      }
    } catch (error) {
      res.status(500).json({ message: "좋아요 처리에 실패했습니다." });
    }
  });

  // Update sentence
  app.put("/api/sentences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateSentenceSchema.parse(req.body);
      
      const sentence = await storage.updateSentence(id, updateData);
      
      if (sentence) {
        res.json(sentence);
      } else {
        res.status(404).json({ message: "문장을 찾을 수 없거나 비밀번호가 일치하지 않습니다." });
      }
    } catch (error) {
      res.status(500).json({ message: "문장 수정에 실패했습니다." });
    }
  });

  // Admin delete sentence
  app.delete("/api/sentences/:id/admin", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { adminPassword } = adminDeleteSchema.parse(req.body);
      
      const success = await storage.adminDeleteSentence(id, adminPassword);
      
      if (success) {
        res.json({ message: "문장이 삭제되었습니다." });
      } else {
        res.status(404).json({ message: "문장을 찾을 수 없거나 관리자 비밀번호가 일치하지 않습니다." });
      }
    } catch (error) {
      res.status(500).json({ message: "문장 삭제에 실패했습니다." });
    }
  });

  // Search sentences by nickname, book title, author, or content
  app.get("/api/sentences/search", async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        const sentences = await storage.getSentences();
        res.json(sentences);
        return;
      }
      
      const sentences = await storage.searchSentences(query);
      res.json(sentences);
    } catch (error) {
      res.status(500).json({ message: "검색에 실패했습니다." });
    }
  });

  // Authentication status check
  app.get("/api/auth/status", (req: any, res) => {
    const isAuthenticated = req.session?.authenticated === true;
    if (isAuthenticated) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
