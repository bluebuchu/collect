"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
exports.getStorage = getStorage;
const schema_1 = require("@shared/schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const mock_storage_1 = require("./mock-storage");
class DatabaseStorage {
    // User operations
    async getUserById(id) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return user || undefined;
    }
    async getUserByEmail(email) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        return user || undefined;
    }
    async getUserByNickname(nickname) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.nickname, nickname));
        return user || undefined;
    }
    async createUser(userData) {
        try {
            console.log("Creating user with data:", { ...userData, password: "***" });
            const [user] = await db_1.db
                .insert(schema_1.users)
                .values(userData)
                .returning();
            console.log("User created successfully:", user.id);
            return user;
        }
        catch (error) {
            console.error("Database user creation error:", error);
            throw error;
        }
    }
    async updateUser(id, updates) {
        const [updatedUser] = await db_1.db
            .update(schema_1.users)
            .set({
            ...updates,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
            .returning();
        return updatedUser;
    }
    // Sentence operations
    async getSentence(id) {
        const result = await this.getSentenceById(id);
        return result || null;
    }
    async getSentences() {
        const results = await db_1.db
            .select({
            id: schema_1.sentences.id,
            userId: schema_1.sentences.userId,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            pageNumber: schema_1.sentences.pageNumber,
            likes: schema_1.sentences.likes,
            createdAt: schema_1.sentences.createdAt,
            updatedAt: schema_1.sentences.updatedAt,
            userNickname: schema_1.users.nickname,
            userProfileImage: schema_1.users.profileImage,
            legacyNickname: schema_1.sentences.legacyNickname,
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.createdAt));
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
    async getSentenceById(id) {
        const [result] = await db_1.db
            .select({
            id: schema_1.sentences.id,
            userId: schema_1.sentences.userId,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            pageNumber: schema_1.sentences.pageNumber,
            likes: schema_1.sentences.likes,
            createdAt: schema_1.sentences.createdAt,
            updatedAt: schema_1.sentences.updatedAt,
            userNickname: schema_1.users.nickname,
            userProfileImage: schema_1.users.profileImage,
            legacyNickname: schema_1.sentences.legacyNickname,
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.id, id));
        if (!result)
            return undefined;
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
    async getUserSentences(userId) {
        const results = await db_1.db
            .select({
            id: schema_1.sentences.id,
            userId: schema_1.sentences.userId,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            pageNumber: schema_1.sentences.pageNumber,
            likes: schema_1.sentences.likes,
            createdAt: schema_1.sentences.createdAt,
            updatedAt: schema_1.sentences.updatedAt,
            userNickname: schema_1.users.nickname,
            userProfileImage: schema_1.users.profileImage,
            legacyNickname: schema_1.sentences.legacyNickname,
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.createdAt));
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
    async getUserSentencesWithSearch(userId, query) {
        const searchTerm = `%${query}%`;
        const results = await db_1.db
            .select({
            id: schema_1.sentences.id,
            userId: schema_1.sentences.userId,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            pageNumber: schema_1.sentences.pageNumber,
            likes: schema_1.sentences.likes,
            createdAt: schema_1.sentences.createdAt,
            updatedAt: schema_1.sentences.updatedAt,
            userNickname: schema_1.users.nickname,
            userProfileImage: schema_1.users.profileImage,
            legacyNickname: schema_1.sentences.legacyNickname,
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sentences.userId, userId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.sentences.content, searchTerm), (0, drizzle_orm_1.like)(schema_1.sentences.bookTitle, searchTerm), (0, drizzle_orm_1.like)(schema_1.sentences.author, searchTerm))))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.createdAt));
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
    async createSentence(insertSentence, userId) {
        const [sentence] = await db_1.db
            .insert(schema_1.sentences)
            .values({
            ...insertSentence,
            userId,
            isPublic: insertSentence.isPublic || 0,
        })
            .returning();
        const sentenceWithUser = await this.getSentenceById(sentence.id);
        return sentenceWithUser;
    }
    async updateSentence(id, updateData, userId) {
        // Verify the user owns this sentence
        const existingSentence = await this.getSentenceById(id);
        if (!existingSentence || existingSentence.userId !== userId) {
            return undefined;
        }
        const [updatedSentence] = await db_1.db
            .update(schema_1.sentences)
            .set({
            ...updateData,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.id, id))
            .returning();
        if (!updatedSentence) {
            return undefined;
        }
        return await this.getSentenceById(updatedSentence.id);
    }
    async deleteSentence(id) {
        const result = await db_1.db.delete(schema_1.sentences).where((0, drizzle_orm_1.eq)(schema_1.sentences.id, id));
        return result.rowCount > 0;
    }
    async deleteSentenceWithPassword(id, password) {
        // In production this would verify password
        // For now, just check if password is provided
        if (!password)
            return false;
        const result = await db_1.db.delete(schema_1.sentences).where((0, drizzle_orm_1.eq)(schema_1.sentences.id, id));
        return result.rowCount > 0;
    }
    async adminDeleteSentence(id, adminPassword) {
        if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== "admin123") {
            return false;
        }
        const result = await db_1.db.delete(schema_1.sentences).where((0, drizzle_orm_1.eq)(schema_1.sentences.id, id));
        return result.rowCount > 0;
    }
    async incrementLikes(id) {
        // First get the current sentence
        const currentSentence = await db_1.db
            .select()
            .from(schema_1.sentences)
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.id, id))
            .limit(1);
        if (currentSentence.length === 0) {
            return undefined;
        }
        // Update with the incremented likes value
        const [updatedSentence] = await db_1.db
            .update(schema_1.sentences)
            .set({
            likes: currentSentence[0].likes + 1,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.id, id))
            .returning();
        if (!updatedSentence) {
            return undefined;
        }
        return await this.getSentenceById(updatedSentence.id);
    }
    async getUserLikedSentences(userId) {
        const likes = await db_1.db
            .select({ sentenceId: schema_1.sentenceLikes.sentenceId })
            .from(schema_1.sentenceLikes)
            .where((0, drizzle_orm_1.eq)(schema_1.sentenceLikes.userId, userId));
        return likes.map(l => l.sentenceId);
    }
    async toggleLike(sentenceId, userId) {
        // Check if like exists
        const existingLike = await db_1.db
            .select()
            .from(schema_1.sentenceLikes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sentenceLikes.sentenceId, sentenceId), (0, drizzle_orm_1.eq)(schema_1.sentenceLikes.userId, userId)))
            .limit(1);
        if (existingLike.length > 0) {
            // Unlike: remove like and decrement count
            await db_1.db
                .delete(schema_1.sentenceLikes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sentenceLikes.sentenceId, sentenceId), (0, drizzle_orm_1.eq)(schema_1.sentenceLikes.userId, userId)));
            await db_1.db
                .update(schema_1.sentences)
                .set({ likes: (0, drizzle_orm_1.sql) `${schema_1.sentences.likes} - 1` })
                .where((0, drizzle_orm_1.eq)(schema_1.sentences.id, sentenceId));
            return false; // unliked
        }
        else {
            // Like: add like and increment count
            await db_1.db.insert(schema_1.sentenceLikes).values({
                sentenceId,
                userId,
            });
            await db_1.db
                .update(schema_1.sentences)
                .set({ likes: (0, drizzle_orm_1.sql) `${schema_1.sentences.likes} + 1` })
                .where((0, drizzle_orm_1.eq)(schema_1.sentences.id, sentenceId));
            return true; // liked
        }
    }
    async getUserStats(userId) {
        const userSentences = await this.getUserSentences(userId);
        const totalLikes = userSentences.reduce((sum, s) => sum + s.likes, 0);
        return {
            totalSentences: userSentences.length,
            totalLikes,
            averageLikes: userSentences.length > 0 ? totalLikes / userSentences.length : 0,
            recentSentences: userSentences.slice(0, 5)
        };
    }
    async getOverallStats() {
        const allSentences = await this.getSentences();
        const totalUsers = await db_1.db.select({ count: schema_1.users.id }).from(schema_1.users);
        return {
            totalSentences: allSentences.length,
            totalUsers: totalUsers.length,
            totalLikes: allSentences.reduce((sum, s) => sum + s.likes, 0),
            popularSentences: allSentences.sort((a, b) => b.likes - a.likes).slice(0, 5)
        };
    }
    async getRecentActivity(limit) {
        const recentSentences = await db_1.db
            .select({
            type: (0, drizzle_orm_1.sql) `'sentence_added'`,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            userNickname: schema_1.users.nickname,
            createdAt: schema_1.sentences.createdAt
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.createdAt))
            .limit(limit);
        return recentSentences;
    }
    async getTopContributors(limit) {
        const contributors = await db_1.db
            .select({
            userId: schema_1.users.id,
            nickname: schema_1.users.nickname,
            profileImage: schema_1.users.profileImage,
            sentenceCount: (0, drizzle_orm_1.sql) `COUNT(${schema_1.sentences.id})`,
            totalLikes: (0, drizzle_orm_1.sql) `SUM(${schema_1.sentences.likes})`
        })
            .from(schema_1.users)
            .leftJoin(schema_1.sentences, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.sentences.userId))
            .groupBy(schema_1.users.id, schema_1.users.nickname, schema_1.users.profileImage)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(${schema_1.sentences.id})`))
            .limit(limit);
        return contributors;
    }
    async getSentencesByBook(userId, bookTitle) {
        const result = await db_1.db
            .select({
            id: schema_1.sentences.id,
            userId: schema_1.sentences.userId,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            publisher: schema_1.sentences.publisher,
            pageNumber: schema_1.sentences.pageNumber,
            likes: schema_1.sentences.likes,
            isPublic: schema_1.sentences.isPublic,
            privateNote: schema_1.sentences.privateNote,
            isBookmarked: schema_1.sentences.isBookmarked,
            createdAt: schema_1.sentences.createdAt,
            updatedAt: schema_1.sentences.updatedAt,
            legacyNickname: schema_1.sentences.legacyNickname,
            nickname: schema_1.users.nickname,
            profileImage: schema_1.users.profileImage,
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sentences.userId, userId), (0, drizzle_orm_1.eq)(schema_1.sentences.bookTitle, bookTitle)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.createdAt));
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
    async getCommunitySentences() {
        const results = await db_1.db
            .select({
            id: schema_1.sentences.id,
            userId: schema_1.sentences.userId,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            pageNumber: schema_1.sentences.pageNumber,
            likes: schema_1.sentences.likes,
            isPublic: schema_1.sentences.isPublic,
            createdAt: schema_1.sentences.createdAt,
            updatedAt: schema_1.sentences.updatedAt,
            userNickname: schema_1.users.nickname,
            userProfileImage: schema_1.users.profileImage,
            legacyNickname: schema_1.sentences.legacyNickname,
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.isPublic, 1))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.createdAt));
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
    async getCommunityStats() {
        // Get top sentences by likes
        const topSentences = await db_1.db
            .select({
            id: schema_1.sentences.id,
            userId: schema_1.sentences.userId,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            pageNumber: schema_1.sentences.pageNumber,
            likes: schema_1.sentences.likes,
            createdAt: schema_1.sentences.createdAt,
            updatedAt: schema_1.sentences.updatedAt,
            userNickname: schema_1.users.nickname,
            userProfileImage: schema_1.users.profileImage,
            legacyNickname: schema_1.sentences.legacyNickname,
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.isPublic, 1))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.likes))
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
        const topContributors = await db_1.db
            .select({
            userId: schema_1.users.id,
            nickname: schema_1.users.nickname,
            profileImage: schema_1.users.profileImage,
            sentenceCount: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.sentences.id})`,
            totalLikes: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.sentences.likes}), 0)`
        })
            .from(schema_1.users)
            .leftJoin(schema_1.sentences, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.sentences.userId), (0, drizzle_orm_1.eq)(schema_1.sentences.isPublic, 1)))
            .groupBy(schema_1.users.id, schema_1.users.nickname, schema_1.users.profileImage)
            .having((0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.sentences.id}) > 0`)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.sentences.likes}), 0)`))
            .limit(3);
        // Get total counts
        const [totalSentencesResult] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
            .from(schema_1.sentences)
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.isPublic, 1));
        const [totalUsersResult] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.sentences.userId})` })
            .from(schema_1.sentences)
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.isPublic, 1));
        return {
            topSentences: formattedTopSentences,
            topContributors,
            totalSentences: totalSentencesResult?.count || 0,
            totalUsers: totalUsersResult?.count || 0,
        };
    }
    async removeLike(sentenceId, userId) {
        // Remove like record
        await db_1.db
            .delete(schema_1.sentenceLikes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sentenceLikes.sentenceId, sentenceId), (0, drizzle_orm_1.eq)(schema_1.sentenceLikes.userId, userId)));
        // Decrement like count
        await db_1.db
            .update(schema_1.sentences)
            .set({ likes: (0, drizzle_orm_1.sql) `GREATEST(${schema_1.sentences.likes} - 1, 0)` })
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.id, sentenceId));
    }
    // Password reset operations
    async createPasswordResetToken(userId) {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
        await db_1.db.insert(schema_1.passwordResetTokens).values({
            userId,
            token,
            expiresAt
        });
        return token;
    }
    async validatePasswordResetToken(token) {
        const result = await db_1.db
            .select()
            .from(schema_1.passwordResetTokens)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.token, token), (0, drizzle_orm_1.sql) `${schema_1.passwordResetTokens.expiresAt} > NOW()`))
            .limit(1);
        return result.length > 0;
    }
    async resetPassword(token, newPassword) {
        const tokenData = await db_1.db
            .select()
            .from(schema_1.passwordResetTokens)
            .where((0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.token, token))
            .limit(1);
        if (tokenData.length === 0) {
            throw new Error("Invalid token");
        }
        const { userId } = tokenData[0];
        // Update user password
        await db_1.db
            .update(schema_1.users)
            .set({ password: newPassword })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        // Delete the used token
        await db_1.db
            .delete(schema_1.passwordResetTokens)
            .where((0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.token, token));
    }
    async searchSentences(query) {
        const results = await db_1.db
            .select({
            id: schema_1.sentences.id,
            userId: schema_1.sentences.userId,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            pageNumber: schema_1.sentences.pageNumber,
            likes: schema_1.sentences.likes,
            createdAt: schema_1.sentences.createdAt,
            updatedAt: schema_1.sentences.updatedAt,
            userNickname: schema_1.users.nickname,
            userProfileImage: schema_1.users.profileImage,
            legacyNickname: schema_1.sentences.legacyNickname,
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.users.nickname, `%${query}%`), (0, drizzle_orm_1.like)(schema_1.sentences.legacyNickname, `%${query}%`), (0, drizzle_orm_1.like)(schema_1.sentences.content, `%${query}%`), (0, drizzle_orm_1.like)(schema_1.sentences.bookTitle, `%${query}%`), (0, drizzle_orm_1.like)(schema_1.sentences.author, `%${query}%`)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.createdAt));
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
    async getAllCommunities(userId) {
        const results = await db_1.db
            .select({
            id: schema_1.communities.id,
            name: schema_1.communities.name,
            description: schema_1.communities.description,
            coverImage: schema_1.communities.coverImage,
            category: schema_1.communities.category,
            relatedBook: schema_1.communities.relatedBook,
            creatorId: schema_1.communities.creatorId,
            memberCount: schema_1.communities.memberCount,
            isPublic: schema_1.communities.isPublic,
            sentenceCount: schema_1.communities.sentenceCount,
            totalLikes: schema_1.communities.totalLikes,
            activityScore: schema_1.communities.activityScore,
            lastActivityAt: schema_1.communities.lastActivityAt,
            createdAt: schema_1.communities.createdAt,
            updatedAt: schema_1.communities.updatedAt,
            creatorNickname: schema_1.users.nickname,
            creatorProfileImage: schema_1.users.profileImage,
        })
            .from(schema_1.communities)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, schema_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.communities.activityScore));
        if (userId) {
            const membershipResults = await db_1.db
                .select({ communityId: schema_1.communityMembers.communityId })
                .from(schema_1.communityMembers)
                .where((0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId));
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
    async getAllCommunitiesEnhanced(options) {
        let query = db_1.db
            .select({
            id: schema_1.communities.id,
            name: schema_1.communities.name,
            description: schema_1.communities.description,
            coverImage: schema_1.communities.coverImage,
            category: schema_1.communities.category,
            relatedBook: schema_1.communities.relatedBook,
            creatorId: schema_1.communities.creatorId,
            memberCount: schema_1.communities.memberCount,
            isPublic: schema_1.communities.isPublic,
            sentenceCount: schema_1.communities.sentenceCount,
            totalLikes: schema_1.communities.totalLikes,
            totalComments: schema_1.communities.totalComments,
            activityScore: schema_1.communities.activityScore,
            lastActivityAt: schema_1.communities.lastActivityAt,
            createdAt: schema_1.communities.createdAt,
            updatedAt: schema_1.communities.updatedAt,
            creatorNickname: schema_1.users.nickname,
            creatorProfileImage: schema_1.users.profileImage,
        })
            .from(schema_1.communities)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, schema_1.users.id));
        // Apply search filter
        if (options.search) {
            query = query.where((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.communities.name, `%${options.search}%`), (0, drizzle_orm_1.like)(schema_1.communities.description, `%${options.search}%`)));
        }
        // Apply sorting
        switch (options.sort) {
            case 'members':
                query = query.orderBy((0, drizzle_orm_1.desc)(schema_1.communities.memberCount));
                break;
            case 'recent':
                query = query.orderBy((0, drizzle_orm_1.desc)(schema_1.communities.lastActivityAt));
                break;
            case 'activity':
            default:
                query = query.orderBy((0, drizzle_orm_1.desc)(schema_1.communities.activityScore));
                break;
        }
        // Apply pagination
        query = query.limit(options.limit).offset(options.offset);
        const results = await query;
        // Get membership info if user is logged in
        let memberCommunityIds = new Set();
        if (options.userId) {
            const membershipResults = await db_1.db
                .select({ communityId: schema_1.communityMembers.communityId })
                .from(schema_1.communityMembers)
                .where((0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, options.userId));
            memberCommunityIds = new Set(membershipResults.map(r => r.communityId));
        }
        // Get top sentences for each community if requested
        const communitiesWithStats = [];
        for (const result of results) {
            let topSentences = [];
            if (options.includeTopSentences) {
                const sentenceResults = await db_1.db
                    .select({
                    id: schema_1.sentences.id,
                    userId: schema_1.sentences.userId,
                    content: schema_1.sentences.content,
                    bookTitle: schema_1.sentences.bookTitle,
                    author: schema_1.sentences.author,
                    pageNumber: schema_1.sentences.pageNumber,
                    likes: schema_1.sentences.likes,
                    isPublic: schema_1.sentences.isPublic,
                    createdAt: schema_1.sentences.createdAt,
                    updatedAt: schema_1.sentences.updatedAt,
                    userNickname: schema_1.users.nickname,
                    userProfileImage: schema_1.users.profileImage,
                })
                    .from(schema_1.communitySentences)
                    .innerJoin(schema_1.sentences, (0, drizzle_orm_1.eq)(schema_1.communitySentences.sentenceId, schema_1.sentences.id))
                    .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
                    .where((0, drizzle_orm_1.eq)(schema_1.communitySentences.communityId, result.id))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.likes))
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
    async getUserCommunities(userId) {
        // Placeholder implementation
        return [];
    }
    async getCommunity(id, userId) {
        // Placeholder implementation
        return null;
    }
    async createCommunity(data) {
        const [newCommunity] = await db_1.db
            .insert(schema_1.communities)
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
        await db_1.db.insert(schema_1.communityMembers).values({
            communityId: newCommunity.id,
            userId: data.creatorId,
            role: 'owner',
        });
        return newCommunity;
    }
    async updateCommunity(id, data) {
        // Placeholder implementation
        return {};
    }
    async deleteCommunity(id) {
        // Placeholder implementation
        return false;
    }
    async joinCommunity(communityId, userId) {
        // Check if already member
        const existing = await db_1.db
            .select()
            .from(schema_1.communityMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communityMembers.communityId, communityId), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId)))
            .limit(1);
        if (existing.length > 0) {
            return false;
        }
        // Add member
        await db_1.db.insert(schema_1.communityMembers).values({
            communityId,
            userId,
            role: 'member',
        });
        // Update member count
        await db_1.db
            .update(schema_1.communities)
            .set({
            memberCount: (0, drizzle_orm_1.sql) `${schema_1.communities.memberCount} + 1`,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.communities.id, communityId));
        return true;
    }
    async leaveCommunity(communityId, userId) {
        // Placeholder implementation
        return false;
    }
    async isCommunitymember(communityId, userId) {
        // Placeholder implementation
        return false;
    }
    async addSentenceToCommunity(communityId, sentenceId) {
        // Placeholder implementation
    }
    async getCommunitySentencesById(communityId, options) {
        const result = await db_1.db
            .select({
            id: schema_1.sentences.id,
            userId: schema_1.sentences.userId,
            content: schema_1.sentences.content,
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            publisher: schema_1.sentences.publisher,
            pageNumber: schema_1.sentences.pageNumber,
            likes: schema_1.sentences.likes,
            isPublic: schema_1.sentences.isPublic,
            privateNote: schema_1.sentences.privateNote,
            isBookmarked: schema_1.sentences.isBookmarked,
            createdAt: schema_1.sentences.createdAt,
            updatedAt: schema_1.sentences.updatedAt,
            legacyNickname: schema_1.sentences.legacyNickname,
            nickname: schema_1.users.nickname,
            profileImage: schema_1.users.profileImage,
        })
            .from(schema_1.communitySentences)
            .innerJoin(schema_1.sentences, (0, drizzle_orm_1.eq)(schema_1.communitySentences.sentenceId, schema_1.sentences.id))
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.communitySentences.communityId, communityId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.communitySentences.addedAt));
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
    async searchCachedBooks(query) {
        const searchLower = `%${query.toLowerCase()}%`;
        const result = await db_1.db
            .select()
            .from(schema_1.books)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.books.title, searchLower), (0, drizzle_orm_1.like)(schema_1.books.author, searchLower), (0, drizzle_orm_1.like)(schema_1.books.publisher, searchLower)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.books.searchCount))
            .limit(10);
        return result;
    }
    async getOrCreateBook(bookData) {
        // Check if book exists
        if (bookData.isbn) {
            const [existing] = await db_1.db
                .select()
                .from(schema_1.books)
                .where((0, drizzle_orm_1.eq)(schema_1.books.isbn, bookData.isbn));
            if (existing) {
                // Update search count
                await db_1.db
                    .update(schema_1.books)
                    .set({
                    searchCount: (0, drizzle_orm_1.sql) `${schema_1.books.searchCount} + 1`,
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.books.id, existing.id));
                return existing;
            }
        }
        // Create new book
        const [newBook] = await db_1.db
            .insert(schema_1.books)
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
    async getPopularBooks(limit = 10) {
        // Get books with sentence counts
        const result = await db_1.db
            .select({
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            publisher: schema_1.sentences.publisher,
            sentenceCount: (0, drizzle_orm_1.sql) `count(*)`,
            totalLikes: (0, drizzle_orm_1.sql) `sum(${schema_1.sentences.likes})`,
        })
            .from(schema_1.sentences)
            .where(schema_1.sentences.bookTitle !== null)
            .groupBy(schema_1.sentences.bookTitle, schema_1.sentences.author, schema_1.sentences.publisher)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(*)`))
            .limit(limit);
        return result.map(book => ({
            id: 0,
            isbn: null,
            title: book.bookTitle,
            author: book.author,
            publisher: book.publisher,
            cover: null,
            searchCount: 0,
            sentenceCount: book.sentenceCount,
            createdAt: new Date(),
            updatedAt: new Date(),
            totalSentences: book.sentenceCount,
            totalLikes: book.totalLikes || 0,
        }));
    }
    async getBookSentences(bookTitle) {
        const result = await db_1.db
            .select({
            sentence: schema_1.sentences,
            user: schema_1.users,
        })
            .from(schema_1.sentences)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.sentences.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sentences.bookTitle, bookTitle))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sentences.createdAt));
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
    async getAuthorStats() {
        const result = await db_1.db
            .select({
            author: schema_1.sentences.author,
            sentenceCount: (0, drizzle_orm_1.sql) `count(*)`,
            totalLikes: (0, drizzle_orm_1.sql) `sum(${schema_1.sentences.likes})`,
            books: (0, drizzle_orm_1.sql) `array_agg(distinct ${schema_1.sentences.bookTitle})`,
        })
            .from(schema_1.sentences)
            .where(schema_1.sentences.author !== null)
            .groupBy(schema_1.sentences.author)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(*)`));
        return result.map(row => ({
            author: row.author,
            sentenceCount: row.sentenceCount,
            totalLikes: row.totalLikes || 0,
            books: row.books || [],
        }));
    }
    async getRecentBooks(limit = 10) {
        const result = await db_1.db
            .select({
            bookTitle: schema_1.sentences.bookTitle,
            author: schema_1.sentences.author,
            publisher: schema_1.sentences.publisher,
            maxDate: (0, drizzle_orm_1.sql) `max(${schema_1.sentences.createdAt})`,
            sentenceCount: (0, drizzle_orm_1.sql) `count(*)`,
            totalLikes: (0, drizzle_orm_1.sql) `sum(${schema_1.sentences.likes})`,
        })
            .from(schema_1.sentences)
            .where(schema_1.sentences.bookTitle !== null)
            .groupBy(schema_1.sentences.bookTitle, schema_1.sentences.author, schema_1.sentences.publisher)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `max(${schema_1.sentences.createdAt})`))
            .limit(limit);
        return result.map(book => ({
            id: 0,
            isbn: null,
            title: book.bookTitle,
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
exports.DatabaseStorage = DatabaseStorage;
// Use MockStorage only when explicitly requested or when no database URL is available
const useMockStorage = process.env.USE_MOCK_STORAGE === 'true' || (!process.env.SUPABASE_DATABASE_URL && !process.env.DATABASE_URL);
// Create singleton instance
let storageInstance = null;
function getStorage() {
    if (!storageInstance) {
        console.log("Creating storage instance...");
        storageInstance = useMockStorage ? new mock_storage_1.MockStorage() : new DatabaseStorage();
        if (useMockStorage) {
            console.log("📦 Using Mock Storage (in-memory database)");
            console.log("📝 Demo account: demo@example.com / demo123");
        }
    }
    return storageInstance;
}
exports.storage = getStorage();
