import {
  sentences,
  users,
  passwordResetTokens,
  sentenceLikes,
  communities,
  communityMembers,
  communitySentences,
  books,
  type Sentence,
  type SentenceWithUser,
  type InsertSentence,
  type UpdateSentence,
  type User,
  type InsertUser,
  type UpdateUser,
  type Community,
  type CommunityWithStats,
  type Book,
  type BookWithStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, desc, sql, and } from "drizzle-orm";
import { AuthService } from "./auth";

export interface IStorage {
  // User operations
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByNickname(nickname: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User | undefined>;
  
  // Sentence operations
  getSentences(): Promise<SentenceWithUser[]>;
  getSentence(id: number): Promise<SentenceWithUser | null>;
  getSentenceById(id: number): Promise<SentenceWithUser | undefined>;
  getUserSentences(userId: number): Promise<SentenceWithUser[]>;
  getUserSentencesWithSearch(userId: number, query: string): Promise<SentenceWithUser[]>;
  createSentence(sentence: InsertSentence & { isPublic?: number }, userId: number): Promise<SentenceWithUser>;
  updateSentence(id: number, sentence: UpdateSentence | any, userId?: number): Promise<SentenceWithUser | undefined>;
  deleteSentence(id: number): Promise<boolean>;
  deleteSentenceWithPassword(id: number, password: string): Promise<boolean>;
  adminDeleteSentence(id: number, adminPassword: string): Promise<boolean>;
  incrementLikes(id: number): Promise<SentenceWithUser | undefined>;
  searchSentences(query: string): Promise<SentenceWithUser[]>;
  
  // Community operations
  getCommunitySentences(): Promise<SentenceWithUser[]>;
  getCommunityStats(): Promise<any>;
  
  // New community management operations
  getAllCommunities(userId?: number): Promise<any[]>;
  getAllCommunitiesEnhanced(options: { sort: string; search: string; includeTopSentences: boolean; offset: number; limit: number; userId?: number }): Promise<CommunityWithStats[]>;
  getUserCommunities(userId: number): Promise<any[]>;
  getCommunity(id: number, userId?: number): Promise<any>;
  getCommunityByName(name: string): Promise<any | undefined>;
  createCommunity(data: any): Promise<any>;
  updateCommunity(id: number, data: any): Promise<any>;
  deleteCommunity(id: number): Promise<boolean>;
  joinCommunity(communityId: number, userId: number): Promise<boolean>;
  leaveCommunity(communityId: number, userId: number): Promise<boolean>;
  isCommunitymember(communityId: number, userId: number): Promise<boolean>;
  addSentenceToCommunity(communityId: number, sentenceId: number): Promise<void>;
  getCommunitySentencesById(communityId: number, options: any): Promise<SentenceWithUser[]>;
  
  // Like operations
  getUserLikedSentences(userId: number): Promise<number[]>;
  toggleLike(sentenceId: number, userId: number): Promise<boolean>;
  removeLike(sentenceId: number, userId: number): Promise<void>;
  
  // Stats operations
  getUserStats(userId: number): Promise<any>;
  getOverallStats(): Promise<any>;
  getRecentActivity(limit: number): Promise<any[]>;
  getTopContributors(limit: number): Promise<any[]>;
  
  // Export operations
  getSentencesByBook(userId: number, bookTitle: string): Promise<SentenceWithUser[]>;
  
  // Password reset operations
  createPasswordResetToken(userId: number): Promise<string>;
  validatePasswordResetToken(token: string): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  
  // Book operations
  searchCachedBooks(query: string): Promise<Book[]>;
  getOrCreateBook(bookData: {
    isbn?: string;
    title: string;
    author?: string;
    publisher?: string;
    cover?: string;
  }): Promise<Book>;
  getPopularBooks(limit?: number): Promise<BookWithStats[]>;
  getBookSentences(bookTitle: string): Promise<SentenceWithUser[]>;
  getAuthorStats(): Promise<Array<{
    author: string;
    sentenceCount: number;
    totalLikes: number;
    books: string[];
  }>>;
  getRecentBooks(limit?: number): Promise<BookWithStats[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByNickname(nickname: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.nickname, nickname));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      console.log("Creating user with data:", { ...userData, password: "***" });
      
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      
      console.log("User created successfully:", user.id);
      return user;
    } catch (error) {
      console.error("Database user creation error:", error);
      throw error;
    }
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  // Sentence operations
  async getSentence(id: number): Promise<SentenceWithUser | null> {
    const result = await this.getSentenceById(id);
    return result || null;
  }

  async getSentences(): Promise<SentenceWithUser[]> {
    const results = await db
      .select({
        id: sentences.id,
        userId: sentences.userId,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        pageNumber: sentences.pageNumber,
        likes: sentences.likes,
        createdAt: sentences.createdAt,
        updatedAt: sentences.updatedAt,
        userNickname: users.nickname,
        userProfileImage: users.profileImage,
        legacyNickname: sentences.legacyNickname,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .orderBy(desc(sentences.createdAt));
    
    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      content: result.content,
      bookTitle: result.bookTitle,
      author: result.author,
      pageNumber: result.pageNumber,
      likes: result.likes,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      legacyNickname: result.legacyNickname,
      user: {
        nickname: result.userNickname || result.legacyNickname || '익명',
        profileImage: result.userProfileImage || null,
      }
    }));
  }

  async getSentenceById(id: number): Promise<SentenceWithUser | undefined> {
    const [result] = await db
      .select({
        id: sentences.id,
        userId: sentences.userId,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        pageNumber: sentences.pageNumber,
        likes: sentences.likes,
        createdAt: sentences.createdAt,
        updatedAt: sentences.updatedAt,
        userNickname: users.nickname,
        userProfileImage: users.profileImage,
        legacyNickname: sentences.legacyNickname,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(eq(sentences.id, id));
    
    if (!result) return undefined;
    
    return {
      id: result.id,
      userId: result.userId,
      content: result.content,
      bookTitle: result.bookTitle,
      author: result.author,
      pageNumber: result.pageNumber,
      likes: result.likes,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      legacyNickname: result.legacyNickname,
      user: {
        nickname: result.userNickname || result.legacyNickname || '익명',
        profileImage: result.userProfileImage || null,
      }
    };
  }

  async getUserSentences(userId: number): Promise<SentenceWithUser[]> {
    const results = await db
      .select({
        id: sentences.id,
        userId: sentences.userId,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        pageNumber: sentences.pageNumber,
        likes: sentences.likes,
        createdAt: sentences.createdAt,
        updatedAt: sentences.updatedAt,
        userNickname: users.nickname,
        userProfileImage: users.profileImage,
        legacyNickname: sentences.legacyNickname,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(eq(sentences.userId, userId))
      .orderBy(desc(sentences.createdAt));
    
    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      content: result.content,
      bookTitle: result.bookTitle,
      author: result.author,
      pageNumber: result.pageNumber,
      likes: result.likes,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      legacyNickname: result.legacyNickname,
      user: {
        nickname: result.userNickname || result.legacyNickname || '익명',
        profileImage: result.userProfileImage || null,
      }
    }));
  }

  async getUserSentencesWithSearch(userId: number, query: string): Promise<SentenceWithUser[]> {
    const searchTerm = `%${query}%`;
    
    const results = await db
      .select({
        id: sentences.id,
        userId: sentences.userId,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        pageNumber: sentences.pageNumber,
        likes: sentences.likes,
        createdAt: sentences.createdAt,
        updatedAt: sentences.updatedAt,
        userNickname: users.nickname,
        userProfileImage: users.profileImage,
        legacyNickname: sentences.legacyNickname,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(
        and(
          eq(sentences.userId, userId),
          or(
            like(sentences.content, searchTerm),
            like(sentences.bookTitle, searchTerm),
            like(sentences.author, searchTerm)
          )
        )
      )
      .orderBy(desc(sentences.createdAt));
    
    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      content: result.content,
      bookTitle: result.bookTitle,
      author: result.author,
      pageNumber: result.pageNumber,
      likes: result.likes,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      legacyNickname: result.legacyNickname,
      user: {
        nickname: result.userNickname || result.legacyNickname || '익명',
        profileImage: result.userProfileImage || null,
      }
    }));
  }

  async createSentence(insertSentence: InsertSentence & { isPublic?: number }, userId: number): Promise<SentenceWithUser> {
    const [sentence] = await db
      .insert(sentences)
      .values({
        ...insertSentence,
        userId,
        isPublic: insertSentence.isPublic || 0,
      })
      .returning();

    const sentenceWithUser = await this.getSentenceById(sentence.id);
    return sentenceWithUser!;
  }

  async updateSentence(id: number, updateData: UpdateSentence, userId: number): Promise<SentenceWithUser | undefined> {
    // Verify the user owns this sentence
    const existingSentence = await this.getSentenceById(id);
    if (!existingSentence || existingSentence.userId !== userId) {
      return undefined;
    }

    const [updatedSentence] = await db
      .update(sentences)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(sentences.id, id))
      .returning();
    
    if (!updatedSentence) {
      return undefined;
    }
    
    return await this.getSentenceById(updatedSentence.id);
  }

  async deleteSentence(id: number): Promise<boolean> {
    const result = await db.delete(sentences).where(eq(sentences.id, id));
    return result.rowCount! > 0;
  }

  async deleteSentenceWithPassword(id: number, password: string): Promise<boolean> {
    // In production this would verify password
    // For now, just check if password is provided
    if (!password) return false;
    const result = await db.delete(sentences).where(eq(sentences.id, id));
    return result.rowCount! > 0;
  }

  async adminDeleteSentence(id: number, adminPassword: string): Promise<boolean> {
    if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== "admin123") {
      return false;
    }
    const result = await db.delete(sentences).where(eq(sentences.id, id));
    return result.rowCount! > 0;
  }

  async incrementLikes(id: number): Promise<SentenceWithUser | undefined> {
    // First get the current sentence
    const currentSentence = await db
      .select()
      .from(sentences)
      .where(eq(sentences.id, id))
      .limit(1);
    
    if (currentSentence.length === 0) {
      return undefined;
    }
    
    // Update with the incremented likes value
    const [updatedSentence] = await db
      .update(sentences)
      .set({
        likes: currentSentence[0].likes + 1,
        updatedAt: new Date(),
      })
      .where(eq(sentences.id, id))
      .returning();
    
    if (!updatedSentence) {
      return undefined;
    }
    
    return await this.getSentenceById(updatedSentence.id);
  }


  async getUserLikedSentences(userId: number): Promise<number[]> {
    const likes = await db
      .select({ sentenceId: sentenceLikes.sentenceId })
      .from(sentenceLikes)
      .where(eq(sentenceLikes.userId, userId));
    
    return likes.map(l => l.sentenceId);
  }

  async toggleLike(sentenceId: number, userId: number): Promise<boolean> {
    // Check if like exists
    const existingLike = await db
      .select()
      .from(sentenceLikes)
      .where(
        and(
          eq(sentenceLikes.sentenceId, sentenceId),
          eq(sentenceLikes.userId, userId)
        )
      )
      .limit(1);
    
    if (existingLike.length > 0) {
      // Unlike: remove like and decrement count
      await db
        .delete(sentenceLikes)
        .where(
          and(
            eq(sentenceLikes.sentenceId, sentenceId),
            eq(sentenceLikes.userId, userId)
          )
        );
      
      await db
        .update(sentences)
        .set({ likes: sql`${sentences.likes} - 1` })
        .where(eq(sentences.id, sentenceId));
      
      return false; // unliked
    } else {
      // Like: add like and increment count
      await db.insert(sentenceLikes).values({
        sentenceId,
        userId,
      });
      
      await db
        .update(sentences)
        .set({ likes: sql`${sentences.likes} + 1` })
        .where(eq(sentences.id, sentenceId));
      
      return true; // liked
    }
  }

  async getUserStats(userId: number): Promise<any> {
    const userSentences = await this.getUserSentences(userId);
    const totalLikes = userSentences.reduce((sum, s) => sum + s.likes, 0);
    
    return {
      totalSentences: userSentences.length,
      totalLikes,
      averageLikes: userSentences.length > 0 ? totalLikes / userSentences.length : 0,
      recentSentences: userSentences.slice(0, 5)
    };
  }

  async getOverallStats(): Promise<any> {
    const allSentences = await this.getSentences();
    const totalUsers = await db.select({ count: users.id }).from(users);
    
    return {
      totalSentences: allSentences.length,
      totalUsers: totalUsers.length,
      totalLikes: allSentences.reduce((sum, s) => sum + s.likes, 0),
      popularSentences: allSentences.sort((a, b) => b.likes - a.likes).slice(0, 5)
    };
  }

  async getRecentActivity(limit: number): Promise<any[]> {
    const recentSentences = await db
      .select({
        type: sql<string>`'sentence_added'`,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        userNickname: users.nickname,
        createdAt: sentences.createdAt
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .orderBy(desc(sentences.createdAt))
      .limit(limit);
    
    return recentSentences;
  }

  async getTopContributors(limit: number): Promise<any[]> {
    const contributors = await db
      .select({
        userId: users.id,
        nickname: users.nickname,
        profileImage: users.profileImage,
        sentenceCount: sql<number>`COUNT(${sentences.id})`,
        totalLikes: sql<number>`SUM(${sentences.likes})`
      })
      .from(users)
      .leftJoin(sentences, eq(users.id, sentences.userId))
      .groupBy(users.id, users.nickname, users.profileImage)
      .orderBy(desc(sql`COUNT(${sentences.id})`))
      .limit(limit);
    
    return contributors;
  }

  async getSentencesByBook(userId: number, bookTitle: string): Promise<SentenceWithUser[]> {
    const result = await db
      .select({
        id: sentences.id,
        userId: sentences.userId,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        publisher: sentences.publisher,
        pageNumber: sentences.pageNumber,
        likes: sentences.likes,
        isPublic: sentences.isPublic,
        privateNote: sentences.privateNote,
        isBookmarked: sentences.isBookmarked,
        createdAt: sentences.createdAt,
        updatedAt: sentences.updatedAt,
        legacyNickname: sentences.legacyNickname,
        nickname: users.nickname,
        profileImage: users.profileImage,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(and(
        eq(sentences.userId, userId),
        eq(sentences.bookTitle, bookTitle)
      ))
      .orderBy(desc(sentences.createdAt));

    return result.map(row => ({
      id: row.id,
      userId: row.userId,
      content: row.content,
      bookTitle: row.bookTitle,
      author: row.author,
      publisher: row.publisher,
      pageNumber: row.pageNumber,
      likes: row.likes,
      isPublic: row.isPublic,
      privateNote: row.privateNote,
      isBookmarked: row.isBookmarked,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      legacyNickname: row.legacyNickname,
      user: {
        nickname: row.nickname || 'Unknown',
        profileImage: row.profileImage
      }
    }));
  }

  // Community operations
  async getCommunitySentences(): Promise<SentenceWithUser[]> {
    const results = await db
      .select({
        id: sentences.id,
        userId: sentences.userId,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        pageNumber: sentences.pageNumber,
        likes: sentences.likes,
        isPublic: sentences.isPublic,
        createdAt: sentences.createdAt,
        updatedAt: sentences.updatedAt,
        userNickname: users.nickname,
        userProfileImage: users.profileImage,
        legacyNickname: sentences.legacyNickname,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(eq(sentences.isPublic, 1))
      .orderBy(desc(sentences.createdAt));
    
    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      content: result.content,
      bookTitle: result.bookTitle,
      author: result.author,
      pageNumber: result.pageNumber,
      likes: result.likes,
      isPublic: result.isPublic,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      legacyNickname: result.legacyNickname,
      user: {
        nickname: result.userNickname || result.legacyNickname || '익명',
        profileImage: result.userProfileImage || null,
      }
    }));
  }

  async getCommunityStats(): Promise<any> {
    // Get top sentences by likes
    const topSentences = await db
      .select({
        id: sentences.id,
        userId: sentences.userId,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        pageNumber: sentences.pageNumber,
        likes: sentences.likes,
        createdAt: sentences.createdAt,
        updatedAt: sentences.updatedAt,
        userNickname: users.nickname,
        userProfileImage: users.profileImage,
        legacyNickname: sentences.legacyNickname,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(eq(sentences.isPublic, 1))
      .orderBy(desc(sentences.likes))
      .limit(3);
    
    const formattedTopSentences = topSentences.map(result => ({
      id: result.id,
      userId: result.userId,
      content: result.content,
      bookTitle: result.bookTitle,
      author: result.author,
      pageNumber: result.pageNumber,
      likes: result.likes,
      likesCount: result.likes,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      legacyNickname: result.legacyNickname,
      user: {
        nickname: result.userNickname || result.legacyNickname || '익명',
        profileImage: result.userProfileImage || null,
      }
    }));
    
    // Get top contributors
    const topContributors = await db
      .select({
        userId: users.id,
        nickname: users.nickname,
        profileImage: users.profileImage,
        sentenceCount: sql<number>`COUNT(DISTINCT ${sentences.id})`,
        totalLikes: sql<number>`COALESCE(SUM(${sentences.likes}), 0)`
      })
      .from(users)
      .leftJoin(sentences, and(
        eq(users.id, sentences.userId),
        eq(sentences.isPublic, 1)
      ))
      .groupBy(users.id, users.nickname, users.profileImage)
      .having(sql`COUNT(DISTINCT ${sentences.id}) > 0`)
      .orderBy(desc(sql`COALESCE(SUM(${sentences.likes}), 0)`))
      .limit(3);
    
    // Get total counts
    const [totalSentencesResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(sentences)
      .where(eq(sentences.isPublic, 1));
    
    const [totalUsersResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${sentences.userId})` })
      .from(sentences)
      .where(eq(sentences.isPublic, 1));
    
    return {
      topSentences: formattedTopSentences,
      topContributors,
      totalSentences: totalSentencesResult?.count || 0,
      totalUsers: totalUsersResult?.count || 0,
    };
  }

  async removeLike(sentenceId: number, userId: number): Promise<void> {
    // Remove like record
    await db
      .delete(sentenceLikes)
      .where(
        and(
          eq(sentenceLikes.sentenceId, sentenceId),
          eq(sentenceLikes.userId, userId)
        )
      );
    
    // Decrement like count
    await db
      .update(sentences)
      .set({ likes: sql`GREATEST(${sentences.likes} - 1, 0)` })
      .where(eq(sentences.id, sentenceId));
  }


  // Password reset operations
  async createPasswordResetToken(userId: number): Promise<string> {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt
    });
    
    return token;
  }

  async validatePasswordResetToken(token: string): Promise<boolean> {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          sql`${passwordResetTokens.expiresAt} > NOW()`
        )
      )
      .limit(1);
    
    return result.length > 0;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenData = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);
    
    if (tokenData.length === 0) {
      throw new Error("Invalid token");
    }
    
    const { userId } = tokenData[0];
    
    // Update user password
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId));
    
    // Delete the used token
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
  }

  async searchSentences(query: string): Promise<SentenceWithUser[]> {
    const results = await db
      .select({
        id: sentences.id,
        userId: sentences.userId,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        pageNumber: sentences.pageNumber,
        likes: sentences.likes,
        createdAt: sentences.createdAt,
        updatedAt: sentences.updatedAt,
        userNickname: users.nickname,
        userProfileImage: users.profileImage,
        legacyNickname: sentences.legacyNickname,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(
        or(
          like(users.nickname, `%${query}%`),
          like(sentences.legacyNickname, `%${query}%`),
          like(sentences.content, `%${query}%`),
          like(sentences.bookTitle, `%${query}%`),
          like(sentences.author, `%${query}%`)
        )
      )
      .orderBy(desc(sentences.createdAt));
    
    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      content: result.content,
      bookTitle: result.bookTitle,
      author: result.author,
      pageNumber: result.pageNumber,
      likes: result.likes,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      legacyNickname: result.legacyNickname,
      user: {
        nickname: result.userNickname || result.legacyNickname || '익명',
        profileImage: result.userProfileImage || null,
      }
    }));
  }

  // Community management operations
  async getAllCommunities(userId?: number): Promise<any[]> {
    const results = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        coverImage: communities.coverImage,
        category: communities.category,
        relatedBook: communities.relatedBook,
        creatorId: communities.creatorId,
        memberCount: communities.memberCount,
        isPublic: communities.isPublic,
        sentenceCount: communities.sentenceCount,
        totalLikes: communities.totalLikes,
        activityScore: communities.activityScore,
        lastActivityAt: communities.lastActivityAt,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
        creatorNickname: users.nickname,
        creatorProfileImage: users.profileImage,
      })
      .from(communities)
      .leftJoin(users, eq(communities.creatorId, users.id))
      .orderBy(desc(communities.activityScore));

    if (userId) {
      const membershipResults = await db
        .select({ communityId: communityMembers.communityId })
        .from(communityMembers)
        .where(eq(communityMembers.userId, userId));
      
      const memberCommunityIds = new Set(membershipResults.map(r => r.communityId));
      
      return results.map(result => ({
        ...result,
        creator: {
          nickname: result.creatorNickname || '익명',
          profileImage: result.creatorProfileImage || null,
        },
        isMember: memberCommunityIds.has(result.id),
      }));
    }

    return results.map(result => ({
      ...result,
      creator: {
        nickname: result.creatorNickname || '익명',
        profileImage: result.creatorProfileImage || null,
      },
      isMember: false,
    }));
  }

  async getAllCommunitiesEnhanced(options: { 
    sort: string; 
    search: string; 
    includeTopSentences: boolean;
    offset: number;
    limit: number;
    userId?: number 
  }): Promise<CommunityWithStats[]> {
    let query = db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        coverImage: communities.coverImage,
        category: communities.category,
        relatedBook: communities.relatedBook,
        creatorId: communities.creatorId,
        memberCount: communities.memberCount,
        isPublic: communities.isPublic,
        sentenceCount: communities.sentenceCount,
        totalLikes: communities.totalLikes,
        totalComments: communities.totalComments,
        activityScore: communities.activityScore,
        lastActivityAt: communities.lastActivityAt,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
        creatorNickname: users.nickname,
        creatorProfileImage: users.profileImage,
      })
      .from(communities)
      .leftJoin(users, eq(communities.creatorId, users.id));

    // Apply search filter
    if (options.search) {
      query = query.where(
        or(
          like(communities.name, `%${options.search}%`),
          like(communities.description, `%${options.search}%`)
        )
      );
    }

    // Apply sorting
    switch (options.sort) {
      case 'members':
        query = query.orderBy(desc(communities.memberCount));
        break;
      case 'recent':
        query = query.orderBy(desc(communities.lastActivityAt));
        break;
      case 'activity':
      default:
        query = query.orderBy(desc(communities.activityScore));
        break;
    }

    // Apply pagination
    query = query.limit(options.limit).offset(options.offset);
    
    const results = await query;

    // Get membership info if user is logged in
    let memberCommunityIds = new Set<number>();
    if (options.userId) {
      const membershipResults = await db
        .select({ communityId: communityMembers.communityId })
        .from(communityMembers)
        .where(eq(communityMembers.userId, options.userId));
      
      memberCommunityIds = new Set(membershipResults.map(r => r.communityId));
    }

    // Get top sentences for each community if requested
    const communitiesWithStats: CommunityWithStats[] = [];
    
    for (const result of results) {
      let topSentences: SentenceWithUser[] = [];
      
      if (options.includeTopSentences) {
        const sentenceResults = await db
          .select({
            id: sentences.id,
            userId: sentences.userId,
            content: sentences.content,
            bookTitle: sentences.bookTitle,
            author: sentences.author,
            pageNumber: sentences.pageNumber,
            likes: sentences.likes,
            isPublic: sentences.isPublic,
            createdAt: sentences.createdAt,
            updatedAt: sentences.updatedAt,
            userNickname: users.nickname,
            userProfileImage: users.profileImage,
          })
          .from(communitySentences)
          .innerJoin(sentences, eq(communitySentences.sentenceId, sentences.id))
          .leftJoin(users, eq(sentences.userId, users.id))
          .where(eq(communitySentences.communityId, result.id))
          .orderBy(desc(sentences.likes))
          .limit(3);

        topSentences = sentenceResults.map(s => ({
          id: s.id,
          userId: s.userId,
          content: s.content,
          bookTitle: s.bookTitle,
          author: s.author,
          pageNumber: s.pageNumber,
          likes: s.likes,
          isPublic: s.isPublic,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          user: {
            nickname: s.userNickname || '익명',
            profileImage: s.userProfileImage || null,
          }
        }));
      }

      communitiesWithStats.push({
        ...result,
        creator: {
          nickname: result.creatorNickname || '익명',
          profileImage: result.creatorProfileImage || null,
        },
        topSentences,
        isMember: memberCommunityIds.has(result.id),
      });
    }

    return communitiesWithStats;
  }

  async getUserCommunities(userId: number): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  async getCommunityByName(name: string): Promise<any | undefined> {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.name, name));
    return community || undefined;
  }

  async getCommunity(id: number, userId?: number): Promise<any> {
    const [community] = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        coverImage: communities.coverImage,
        category: communities.category,
        relatedBook: communities.relatedBook,
        creatorId: communities.creatorId,
        memberCount: communities.memberCount,
        isPublic: communities.isPublic,
        lastActivityAt: communities.lastActivityAt,
        sentenceCount: communities.sentenceCount,
        totalLikes: communities.totalLikes,
        totalComments: communities.totalComments,
        activityScore: communities.activityScore,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
        creatorNickname: users.nickname,
        creatorProfileImage: users.profileImage,
      })
      .from(communities)
      .leftJoin(users, eq(communities.creatorId, users.id))
      .where(eq(communities.id, id));

    if (!community) {
      return null;
    }

    // Check if user is a member
    let isMember = false;
    let memberRole = null;
    if (userId) {
      const [membership] = await db
        .select()
        .from(communityMembers)
        .where(
          and(
            eq(communityMembers.communityId, id),
            eq(communityMembers.userId, userId)
          )
        );
      
      if (membership) {
        isMember = true;
        memberRole = membership.role;
      }
    }

    return {
      ...community,
      isMember,
      memberRole,
    };
  }

  async createCommunity(data: any): Promise<any> {
    const [newCommunity] = await db
      .insert(communities)
      .values({
        name: data.name,
        description: data.description,
        coverImage: data.coverImage,
        category: data.category,
        relatedBook: data.relatedBook,
        creatorId: data.creatorId,
        memberCount: 1,
        isPublic: data.isPublic,
        sentenceCount: 0,
        totalLikes: 0,
        totalComments: 0,
        activityScore: 0,
        lastActivityAt: new Date(),
      })
      .returning();

    // Creator automatically becomes a member with owner role
    await db.insert(communityMembers).values({
      communityId: newCommunity.id,
      userId: data.creatorId,
      role: 'owner',
    });

    return newCommunity;
  }

  async updateCommunity(id: number, data: any): Promise<any> {
    // Placeholder implementation
    return {};
  }

  async deleteCommunity(id: number): Promise<boolean> {
    // Placeholder implementation
    return false;
  }

  async joinCommunity(communityId: number, userId: number): Promise<boolean> {
    // Check if already member
    const existing = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return false;
    }

    // Add member
    await db.insert(communityMembers).values({
      communityId,
      userId,
      role: 'member',
    });

    // Update member count
    await db
      .update(communities)
      .set({ 
        memberCount: sql`${communities.memberCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));

    return true;
  }

  async leaveCommunity(communityId: number, userId: number): Promise<boolean> {
    // Placeholder implementation
    return false;
  }

  async isCommunitymember(communityId: number, userId: number): Promise<boolean> {
    // Placeholder implementation
    return false;
  }

  async addSentenceToCommunity(communityId: number, sentenceId: number): Promise<void> {
    // Placeholder implementation
  }

  async getCommunitySentencesById(communityId: number, options: any): Promise<SentenceWithUser[]> {
    const result = await db
      .select({
        id: sentences.id,
        userId: sentences.userId,
        content: sentences.content,
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        publisher: sentences.publisher,
        pageNumber: sentences.pageNumber,
        likes: sentences.likes,
        isPublic: sentences.isPublic,
        privateNote: sentences.privateNote,
        isBookmarked: sentences.isBookmarked,
        createdAt: sentences.createdAt,
        updatedAt: sentences.updatedAt,
        legacyNickname: sentences.legacyNickname,
        nickname: users.nickname,
        profileImage: users.profileImage,
      })
      .from(communitySentences)
      .innerJoin(sentences, eq(communitySentences.sentenceId, sentences.id))
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(eq(communitySentences.communityId, communityId))
      .orderBy(desc(communitySentences.addedAt));

    return result.map(row => ({
      id: row.id,
      userId: row.userId,
      content: row.content,
      bookTitle: row.bookTitle,
      author: row.author,
      publisher: row.publisher,
      pageNumber: row.pageNumber,
      likes: row.likes,
      isPublic: row.isPublic,
      privateNote: row.privateNote,
      isBookmarked: row.isBookmarked,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      legacyNickname: row.legacyNickname,
      user: {
        nickname: row.nickname || 'Unknown',
        profileImage: row.profileImage
      }
    }));
  }

  // Book operations
  async searchCachedBooks(query: string): Promise<Book[]> {
    const searchLower = `%${query.toLowerCase()}%`;
    const result = await db
      .select()
      .from(books)
      .where(
        or(
          like(books.title, searchLower),
          like(books.author, searchLower),
          like(books.publisher, searchLower)
        )
      )
      .orderBy(desc(books.searchCount))
      .limit(10);
    
    return result;
  }

  async getOrCreateBook(bookData: {
    isbn?: string;
    title: string;
    author?: string;
    publisher?: string;
    cover?: string;
  }): Promise<Book> {
    // Check if book exists
    if (bookData.isbn) {
      const [existing] = await db
        .select()
        .from(books)
        .where(eq(books.isbn, bookData.isbn));
      
      if (existing) {
        // Update search count
        await db
          .update(books)
          .set({ 
            searchCount: sql`${books.searchCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(books.id, existing.id));
        
        return existing;
      }
    }

    // Create new book
    const [newBook] = await db
      .insert(books)
      .values({
        isbn: bookData.isbn || null,
        title: bookData.title,
        author: bookData.author || null,
        publisher: bookData.publisher || null,
        cover: bookData.cover || null,
        searchCount: 1,
        sentenceCount: 0,
      })
      .returning();
    
    return newBook;
  }

  async getUserBooks(userId: number, limit: number = 10): Promise<BookWithStats[]> {
    // Get books from user's sentences
    const result = await db
      .select({
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        publisher: sentences.publisher,
        sentenceCount: sql<number>`count(*)`,
        totalLikes: sql<number>`sum(${sentences.likes})`,
        cover: books.cover,
        isbn: books.isbn,
      })
      .from(sentences)
      .leftJoin(books, eq(sentences.bookTitle, books.title))
      .where(and(
        eq(sentences.userId, userId),
        sentences.bookTitle !== null
      ))
      .groupBy(sentences.bookTitle, sentences.author, sentences.publisher, books.cover, books.isbn)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return result.map(book => ({
      id: 0,
      isbn: book.isbn,
      title: book.bookTitle!,
      author: book.author,
      publisher: book.publisher,
      cover: book.cover || null,
      searchCount: 0,
      sentenceCount: book.sentenceCount,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalSentences: book.sentenceCount,
      totalLikes: book.totalLikes || 0,
    }));
  }

  async getPopularBooks(limit: number = 10): Promise<BookWithStats[]> {
    // Get books with sentence counts, joining with books table for cover
    const result = await db
      .select({
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        publisher: sentences.publisher,
        sentenceCount: sql<number>`count(*)`,
        totalLikes: sql<number>`sum(${sentences.likes})`,
        cover: books.cover,
        isbn: books.isbn,
      })
      .from(sentences)
      .leftJoin(books, eq(sentences.bookTitle, books.title))
      .where(sentences.bookTitle !== null)
      .groupBy(sentences.bookTitle, sentences.author, sentences.publisher, books.cover, books.isbn)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return result.map(book => ({
      id: 0,
      isbn: book.isbn,
      title: book.bookTitle!,
      author: book.author,
      publisher: book.publisher,
      cover: book.cover || null,
      searchCount: 0,
      sentenceCount: book.sentenceCount,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalSentences: book.sentenceCount,
      totalLikes: book.totalLikes || 0,
    }));
  }

  async getBookSentences(bookTitle: string): Promise<SentenceWithUser[]> {
    const result = await db
      .select({
        sentence: sentences,
        user: users,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(eq(sentences.bookTitle, bookTitle))
      .orderBy(desc(sentences.createdAt));

    return result.map(row => ({
      ...row.sentence,
      user: row.user ? {
        nickname: row.user.nickname,
        profileImage: row.user.profileImage,
      } : {
        nickname: row.sentence.legacyNickname || "익명",
        profileImage: null,
      },
    }));
  }

  async getAuthorStats(): Promise<Array<{
    author: string;
    sentenceCount: number;
    totalLikes: number;
    books: string[];
  }>> {
    const result = await db
      .select({
        author: sentences.author,
        sentenceCount: sql<number>`count(*)`,
        totalLikes: sql<number>`sum(${sentences.likes})`,
        books: sql<string[]>`array_agg(distinct ${sentences.bookTitle})`,
      })
      .from(sentences)
      .where(sentences.author !== null)
      .groupBy(sentences.author)
      .orderBy(desc(sql`count(*)`));

    return result.map(row => ({
      author: row.author!,
      sentenceCount: row.sentenceCount,
      totalLikes: row.totalLikes || 0,
      books: row.books || [],
    }));
  }

  async getRecentBooks(limit: number = 10): Promise<BookWithStats[]> {
    const result = await db
      .select({
        bookTitle: sentences.bookTitle,
        author: sentences.author,
        publisher: sentences.publisher,
        maxDate: sql<Date>`max(${sentences.createdAt})`,
        sentenceCount: sql<number>`count(*)`,
        totalLikes: sql<number>`sum(${sentences.likes})`,
      })
      .from(sentences)
      .where(sentences.bookTitle !== null)
      .groupBy(sentences.bookTitle, sentences.author, sentences.publisher)
      .orderBy(desc(sql`max(${sentences.createdAt})`))
      .limit(limit);

    return result.map(book => ({
      id: 0,
      isbn: null,
      title: book.bookTitle!,
      author: book.author,
      publisher: book.publisher,
      cover: null,
      searchCount: 0,
      sentenceCount: book.sentenceCount,
      createdAt: book.maxDate,
      updatedAt: book.maxDate,
      totalSentences: book.sentenceCount,
      totalLikes: book.totalLikes || 0,
    }));
  }
}

// Create singleton instance
let storageInstance: IStorage | null = null;

export function getStorage(): IStorage {
  if (!storageInstance) {
    console.log("Creating database storage instance...");
    storageInstance = new DatabaseStorage();
  }
  return storageInstance;
}

export const storage: IStorage = getStorage();