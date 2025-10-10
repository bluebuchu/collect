import { pgTable, text, serial, integer, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  profileImage: text("profile_image"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Express session table
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Simplified sessions - remove complex user session table
// We'll use Express sessions only

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sentences = pgTable("sentences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  bookTitle: text("book_title"),
  author: text("author"),
  publisher: text("publisher"),
  pageNumber: integer("page_number"),
  likes: integer("likes").notNull().default(0),
  isPublic: integer("is_public").notNull().default(0), // 0: private, 1: community
  privateNote: text("private_note"), // 개인 메모/감상
  isBookmarked: integer("is_bookmarked").notNull().default(0), // 0: no, 1: yes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  legacyNickname: text("legacy_nickname"),
});

// Sentence likes table - track which users liked which sentences
export const sentenceLikes = pgTable("sentence_likes", {
  id: serial("id").primaryKey(),
  sentenceId: integer("sentence_id").references(() => sentences.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Books table - cache book information for autocomplete
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  isbn: varchar("isbn", { length: 20 }).unique(),
  title: text("title").notNull(),
  author: text("author"),
  publisher: text("publisher"),
  cover: text("cover"),
  searchCount: integer("search_count").notNull().default(1),
  sentenceCount: integer("sentence_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Communities table
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  category: varchar("category", { length: 50 }), // book, genre, author, etc.
  relatedBook: varchar("related_book", { length: 255 }), // for book-specific communities
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  memberCount: integer("member_count").notNull().default(0),
  isPublic: integer("is_public").notNull().default(1), // 0: private, 1: public
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(), // for sorting by activity
  sentenceCount: integer("sentence_count").notNull().default(0), // for tracking sentences
  totalLikes: integer("total_likes").notNull().default(0), // for activity score
  totalComments: integer("total_comments").notNull().default(0), // for activity score
  activityScore: integer("activity_score").notNull().default(0), // combined activity metric
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Community members table
export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Community sentences - link sentences to communities
export const communitySentences = pgTable("community_sentences", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  sentenceId: integer("sentence_id").references(() => sentences.id).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// User schemas
export const registerUserSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "비밀번호는 대소문자와 숫자를 포함해야 합니다"),
  nickname: z.string()
    .min(2, "닉네임은 최소 2자 이상이어야 합니다")
    .max(50, "닉네임은 50자 이하여야 합니다")
    .regex(/^[a-zA-Z0-9가-힣_]+$/, "닉네임은 한글, 영문, 숫자, 밑줄만 사용 가능합니다"),
  bio: z.string().max(200, "소개는 200자 이하여야 합니다").optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const updateUserSchema = z.object({
  nickname: z.string()
    .min(2, "닉네임은 최소 2자 이상이어야 합니다")
    .max(50, "닉네임은 50자 이하여야 합니다")
    .regex(/^[a-zA-Z0-9가-힣_]+$/, "닉네임은 한글, 영문, 숫자, 밑줄만 사용 가능합니다")
    .optional(),
  bio: z.string().max(200, "소개는 200자 이하여야 합니다").optional(),
  profileImage: z.string().optional(),
});

// Sentence schemas
export const insertSentenceSchema = createInsertSchema(sentences).omit({
  id: true,
  userId: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  content: z.string()
    .min(1, "문장을 입력해주세요")
    .max(500, "문장은 500자 이하여야 합니다")
    .trim(),
  bookTitle: z.string().max(255, "책 제목은 255자 이하여야 합니다").optional(),
  author: z.string().max(255, "저자명은 255자 이하여야 합니다").optional(),
  publisher: z.string().max(255, "출판사명은 255자 이하여야 합니다").optional(),
  pageNumber: z.number().min(1).max(9999).optional(),
  isPublic: z.number().min(0).max(1).optional().default(0),
  communityId: z.number().optional(), // For linking to a specific community
  privateNote: z.string().max(1000, "개인 메모는 1000자 이하여야 합니다").optional(),
  isBookmarked: z.number().min(0).max(1).optional().default(0),
});

export const updateSentenceSchema = createInsertSchema(sentences).omit({
  id: true,
  userId: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  content: z.string()
    .min(1, "문장을 입력해주세요")
    .max(500, "문장은 500자 이하여야 합니다")
    .trim()
    .optional(),
  bookTitle: z.string().max(255, "책 제목은 255자 이하여야 합니다").optional(),
  author: z.string().max(255, "저자명은 255자 이하여야 합니다").optional(),
  publisher: z.string().max(255, "출판사명은 255자 이하여야 합니다").optional(),
  pageNumber: z.number().min(1).max(9999).optional(),
  isPublic: z.number().min(0).max(1).optional(),
  privateNote: z.string().max(1000, "개인 메모는 1000자 이하여야 합니다").optional(),
  isBookmarked: z.number().min(0).max(1).optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1, "검색어를 입력해주세요"),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "재설정 토큰이 필요합니다"),
  newPassword: z.string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "비밀번호는 대소문자와 숫자를 포함해야 합니다"),
});

export const findEmailSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
});

// Delete sentence schemas
export const deleteSentenceSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const adminDeleteSchema = z.object({
  adminPassword: z.string().min(1, "관리자 비밀번호를 입력해주세요"),
});

// Community schemas
export const createCommunitySchema = z.object({
  name: z.string().min(2, "커뮤니티 이름은 최소 2자 이상이어야 합니다").max(100),
  description: z.string().max(500, "설명은 500자 이하여야 합니다").optional(),
  category: z.string().optional(),
  relatedBook: z.string().optional(),
  coverImage: z.string().optional(),
  isPublic: z.number().min(0).max(1).optional().default(1),
});

export const updateCommunitySchema = createCommunitySchema.partial();

export const joinCommunitySchema = z.object({
  communityId: z.number(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSentence = z.infer<typeof insertSentenceSchema>;
export type UpdateSentence = z.infer<typeof updateSentenceSchema>;
export type Sentence = typeof sentences.$inferSelect;
export type SentenceLike = typeof sentenceLikes.$inferSelect;
export type SentenceWithUser = Sentence & { 
  user: { 
    nickname: string; 
    profileImage: string | null; 
  };
  isLiked?: boolean; // Whether current user liked this sentence
  privateNote?: string | null; // Private note for the sentence
  isBookmarked?: number; // 0: no, 1: yes
};

// Book types
export type Book = typeof books.$inferSelect;
export type BookWithStats = Book & {
  totalSentences: number;
  totalLikes: number;
  recentSentences?: SentenceWithUser[];
};

// Community types
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof createCommunitySchema>;
export type UpdateCommunity = z.infer<typeof updateCommunitySchema>;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type CommunitySentence = typeof communitySentences.$inferSelect;

export type CommunityWithStats = Community & {
  creator: {
    nickname: string;
    profileImage: string | null;
  };
  topSentences?: SentenceWithUser[];
  isMember?: boolean;
  memberRole?: string;
};

// ============= Book Club Tables =============

// Book clubs table
export const bookClubs = pgTable("book_clubs", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  bookTitle: varchar("book_title", { length: 255 }).notNull(),
  bookAuthor: varchar("book_author", { length: 255 }).notNull(),
  bookCover: text("book_cover"),
  totalPages: integer("total_pages").notNull(),
  currentChapter: integer("current_chapter").default(1),
  totalChapters: integer("total_chapters"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("upcoming"), // upcoming, active, completed
  description: text("description"),
  maxMembers: integer("max_members").default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Book club members table
export const bookClubMembers = pgTable("book_club_members", {
  id: serial("id").primaryKey(),
  bookClubId: integer("book_club_id").references(() => bookClubs.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  currentPage: integer("current_page").default(0),
  lastReadAt: timestamp("last_read_at"),
  role: varchar("role", { length: 20 }).notNull().default("member"), // leader, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Book club sentences - sentences linked to book clubs
export const bookClubSentences = pgTable("book_club_sentences", {
  id: serial("id").primaryKey(),
  bookClubId: integer("book_club_id").references(() => bookClubs.id).notNull(),
  sentenceId: integer("sentence_id").references(() => sentences.id).notNull(),
  chapterNum: integer("chapter_num"),
  pageNum: integer("page_num"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Book club progress milestones
export const bookClubMilestones = pgTable("book_club_milestones", {
  id: serial("id").primaryKey(),
  bookClubId: integer("book_club_id").references(() => bookClubs.id).notNull(),
  weekNumber: integer("week_number").notNull(),
  chapterStart: integer("chapter_start").notNull(),
  chapterEnd: integer("chapter_end").notNull(),
  targetDate: timestamp("target_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, active, completed
});

// ============= Book Club Schemas =============

// Create book club schema
export const createBookClubSchema = z.object({
  communityId: z.number().min(1),
  bookTitle: z.string().min(1, "책 제목을 입력해주세요").max(255),
  bookAuthor: z.string().min(1, "저자를 입력해주세요").max(255),
  bookCover: z.string().url().optional(),
  totalPages: z.number().min(1, "총 페이지 수를 입력해주세요"),
  totalChapters: z.number().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  description: z.string().max(1000).optional(),
  maxMembers: z.number().min(2).max(100).optional(),
});

// Update book club schema
export const updateBookClubSchema = z.object({
  description: z.string().max(1000).optional(),
  maxMembers: z.number().min(2).max(100).optional(),
  status: z.enum(["upcoming", "active", "completed"]).optional(),
});

// Join book club schema
export const joinBookClubSchema = z.object({
  bookClubId: z.number().min(1),
});

// Update progress schema
export const updateProgressSchema = z.object({
  currentPage: z.number().min(0),
});

// ============= Book Club Types =============

export type BookClub = typeof bookClubs.$inferSelect;
export type InsertBookClub = z.infer<typeof createBookClubSchema>;
export type UpdateBookClub = z.infer<typeof updateBookClubSchema>;
export type BookClubMember = typeof bookClubMembers.$inferSelect;
export type BookClubSentence = typeof bookClubSentences.$inferSelect;
export type BookClubMilestone = typeof bookClubMilestones.$inferSelect;

export type BookClubWithDetails = BookClub & {
  creator: {
    id: number;
    nickname: string;
    profileImage: string | null;
  };
  community: {
    id: number;
    name: string;
  };
  memberCount: number;
  currentUserProgress?: number;
  isJoined?: boolean;
  averageProgress?: number;
};
