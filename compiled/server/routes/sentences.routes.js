"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schema_1 = require("@shared/schema");
const auth_1 = require("../auth");
const storage_1 = require("../storage");
const router = (0, express_1.Router)();
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60)
        return '방금 전';
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)}일 전`;
    if (diffInSeconds < 31536000)
        return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
    return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}
// Get daily sentence
router.get("/api/sentences/daily", async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            // 로그인하지 않은 경우 공개 문장 중에서 선택
            const publicSentences = await storage_1.storage.getPublicSentences();
            if (publicSentences.length === 0) {
                return res.status(404).json({ error: "No sentences available" });
            }
            // 날짜 기반 시드로 일관된 랜덤 선택
            const today = new Date().toISOString().split('T')[0];
            const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
            const index = seed % publicSentences.length;
            const sentence = publicSentences[index];
            return res.json({
                id: sentence.id,
                text: sentence.content,
                author: sentence.author,
                bookTitle: sentence.bookTitle,
                createdAt: sentence.createdAt,
                nickname: sentence.nickname
            });
        }
        // 로그인한 경우 자신의 문장 중에서 선택
        const userSentences = await storage_1.storage.getUserSentences(userId);
        if (userSentences.length === 0) {
            // 자신의 문장이 없으면 공개 문장에서 선택
            const publicSentences = await storage_1.storage.getPublicSentences();
            if (publicSentences.length === 0) {
                return res.status(404).json({ error: "No sentences available" });
            }
            const today = new Date().toISOString().split('T')[0];
            const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), userId);
            const index = seed % publicSentences.length;
            const sentence = publicSentences[index];
            return res.json({
                id: sentence.id,
                text: sentence.content,
                author: sentence.author,
                bookTitle: sentence.bookTitle,
                createdAt: sentence.createdAt,
                nickname: sentence.nickname
            });
        }
        // 날짜와 userId 기반 시드로 일관된 랜덤 선택
        const today = new Date().toISOString().split('T')[0];
        const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), userId);
        const index = seed % userSentences.length;
        const sentence = userSentences[index];
        return res.json({
            id: sentence.id,
            text: sentence.content,
            author: sentence.author,
            bookTitle: sentence.bookTitle,
            createdAt: sentence.createdAt
        });
    }
    catch (error) {
        console.error("Get daily sentence error:", error);
        res.status(500).json({ error: "Failed to get daily sentence" });
    }
});
// Get all sentences
router.get("/api/sentences", async (req, res) => {
    try {
        const { search, sort = 'latest', filter = 'all' } = req.query;
        let allSentences = await storage_1.storage.getSentences();
        if (search) {
            const searchLower = search.toString().toLowerCase();
            allSentences = allSentences.filter(s => s.content.toLowerCase().includes(searchLower) ||
                s.bookTitle?.toLowerCase().includes(searchLower) ||
                s.author?.toLowerCase().includes(searchLower) ||
                s.nickname?.toLowerCase().includes(searchLower));
        }
        if (filter === 'liked' && req.session?.userId) {
            const likedIds = await storage_1.storage.getUserLikedSentences(req.session.userId);
            allSentences = allSentences.filter(s => likedIds.includes(s.id));
        }
        switch (sort) {
            case 'popular':
                allSentences.sort((a, b) => b.likes - a.likes);
                break;
            case 'oldest':
                allSentences.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'latest':
            default:
                allSentences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        const formattedSentences = allSentences.map(s => ({
            ...s,
            timeAgo: formatTimeAgo(new Date(s.createdAt)),
            isLiked: req.session?.userId ? false : false
        }));
        if (req.session?.userId) {
            const likedIds = await storage_1.storage.getUserLikedSentences(req.session.userId);
            formattedSentences.forEach(s => {
                s.isLiked = likedIds.includes(s.id);
            });
        }
        res.json(formattedSentences);
    }
    catch (error) {
        console.error("Error fetching sentences:", error);
        res.status(500).json({ error: "문장을 불러오는 중 오류가 발생했습니다" });
    }
});
// Community endpoints (must be before :id route)
// Get community sentences (public only)
router.get("/api/sentences/community", async (req, res) => {
    try {
        console.log("GET /api/sentences/community - Starting");
        console.log("Storage instance:", storage_1.storage.constructor.name);
        const { q, sort = 'latest', author, book } = req.query;
        // Temporary fix: use getSentences and filter manually
        const allSentencesFromGet = await storage_1.storage.getSentences();
        console.log("All sentences from getSentences():", allSentencesFromGet.length);
        let allSentences = allSentencesFromGet.filter(s => s.isPublic === 1);
        console.log("Filtered public sentences:", allSentences.length);
        // Debug: try calling getCommunitySentences
        // const communityResult = await storage.getCommunitySentences();
        // console.log("Community sentences fetched:", communityResult.length);
        // Filter by search query
        if (q) {
            const searchLower = q.toString().toLowerCase();
            allSentences = allSentences.filter(s => s.content.toLowerCase().includes(searchLower));
        }
        // Filter by author
        if (author) {
            allSentences = allSentences.filter(s => s.author === author);
        }
        // Filter by book
        if (book) {
            allSentences = allSentences.filter(s => s.bookTitle === book);
        }
        // Sort
        switch (sort) {
            case 'likes':
                allSentences.sort((a, b) => b.likes - a.likes);
                break;
            case 'oldest':
                allSentences.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'latest':
            default:
                allSentences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        // Add user like status
        const formattedSentences = allSentences.map(s => ({
            ...s,
            timeAgo: formatTimeAgo(new Date(s.createdAt)),
            isLiked: false
        }));
        if (req.session?.userId) {
            const likedIds = await storage_1.storage.getUserLikedSentences(req.session.userId);
            formattedSentences.forEach(s => {
                s.isLiked = likedIds.includes(s.id);
            });
        }
        res.json(formattedSentences);
    }
    catch (error) {
        console.error("Error fetching community sentences:", error);
        res.status(500).json({ error: "커뮤니티 문장을 불러오는 중 오류가 발생했습니다" });
    }
});
// Get community statistics
router.get("/api/sentences/community/stats", async (req, res) => {
    try {
        const stats = await storage_1.storage.getCommunityStats();
        res.json(stats);
    }
    catch (error) {
        console.error("Error fetching community stats:", error);
        res.status(500).json({ error: "통계를 불러오는 중 오류가 발생했습니다" });
    }
});
// Get single sentence
router.get("/api/sentences/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const sentence = await storage_1.storage.getSentence(id);
        if (!sentence) {
            return res.status(404).json({ error: "문장을 찾을 수 없습니다" });
        }
        const formattedSentence = {
            ...sentence,
            timeAgo: formatTimeAgo(new Date(sentence.createdAt)),
            isLiked: false
        };
        if (req.session?.userId) {
            const likedIds = await storage_1.storage.getUserLikedSentences(req.session.userId);
            formattedSentence.isLiked = likedIds.includes(sentence.id);
        }
        res.json(formattedSentence);
    }
    catch (error) {
        console.error("Error fetching sentence:", error);
        res.status(500).json({ error: "문장을 불러오는 중 오류가 발생했습니다" });
    }
});
// Create sentence
router.post("/api/sentences", auth_1.requireAuth, async (req, res) => {
    try {
        console.log("POST /api/sentences - Request body:", req.body);
        const validatedData = schema_1.insertSentenceSchema.parse(req.body);
        const userId = req.session.userId;
        // Extract communityId if provided
        const { communityId, ...sentenceData } = validatedData;
        console.log("Creating sentence with validated data:", sentenceData);
        const newSentence = await storage_1.storage.createSentence({
            ...sentenceData,
            userId
        });
        // If communityId is provided, add the sentence to the community
        if (communityId && newSentence.id) {
            try {
                // Check if user is member of the community
                const isMember = await storage_1.storage.isCommunitymember(communityId, userId);
                if (isMember) {
                    await storage_1.storage.addSentenceToCommunity(communityId, newSentence.id);
                    console.log(`Added sentence ${newSentence.id} to community ${communityId}`);
                }
                else {
                    console.log(`User ${userId} is not a member of community ${communityId}, skipping community association`);
                }
            }
            catch (err) {
                console.error(`Failed to add sentence to community ${communityId}:`, err);
                // Continue anyway - sentence is created
            }
        }
        console.log("Created sentence:", { id: newSentence.id, isPublic: newSentence.isPublic });
        res.status(201).json(newSentence);
    }
    catch (error) {
        console.error("Error creating sentence:", error);
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: "문장 생성 중 오류가 발생했습니다" });
    }
});
// Update reading note
router.put("/api/sentences/:id/note", auth_1.requireAuth, async (req, res) => {
    try {
        const sentenceId = parseInt(req.params.id);
        const { privateNote, isBookmarked } = req.body;
        const userId = req.session.userId;
        // Check if the sentence belongs to the user
        const sentence = await storage_1.storage.getSentenceById(sentenceId);
        if (!sentence || sentence.userId !== userId) {
            return res.status(403).json({ error: "권한이 없습니다" });
        }
        // Update the note and bookmark status
        const updated = await storage_1.storage.updateSentence(sentenceId, {
            privateNote,
            isBookmarked
        });
        res.json({
            message: "독서 노트가 저장되었습니다",
            sentence: updated
        });
    }
    catch (error) {
        console.error("Update reading note error:", error);
        res.status(500).json({ error: "독서 노트 저장 중 오류가 발생했습니다" });
    }
});
// Update sentence
router.put("/api/sentences/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const validatedData = schema_1.updateSentenceSchema.parse(req.body);
        const userId = req.session.userId;
        const sentence = await storage_1.storage.getSentence(id);
        if (!sentence) {
            return res.status(404).json({ error: "문장을 찾을 수 없습니다" });
        }
        if (sentence.userId !== userId) {
            return res.status(403).json({ error: "이 문장을 수정할 권한이 없습니다" });
        }
        const updatedSentence = await storage_1.storage.updateSentence(id, validatedData);
        res.json(updatedSentence);
    }
    catch (error) {
        console.error("Error updating sentence:", error);
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: "문장 수정 중 오류가 발생했습니다" });
    }
});
// Delete sentence
router.delete("/api/sentences/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.session.userId;
        const sentence = await storage_1.storage.getSentence(id);
        if (!sentence) {
            return res.status(404).json({ error: "문장을 찾을 수 없습니다" });
        }
        if (sentence.userId !== userId) {
            return res.status(403).json({ error: "이 문장을 삭제할 권한이 없습니다" });
        }
        await storage_1.storage.deleteSentence(id);
        res.json({ message: "문장이 삭제되었습니다" });
    }
    catch (error) {
        console.error("Error deleting sentence:", error);
        res.status(500).json({ error: "문장 삭제 중 오류가 발생했습니다" });
    }
});
// Like/Unlike sentence
router.post("/api/sentences/:id/like", auth_1.requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.session.userId;
        const sentence = await storage_1.storage.getSentence(id);
        if (!sentence) {
            return res.status(404).json({ error: "문장을 찾을 수 없습니다" });
        }
        const isLiked = await storage_1.storage.toggleLike(id, userId);
        const updatedSentence = await storage_1.storage.getSentence(id);
        res.json({
            isLiked,
            likes: updatedSentence?.likes || 0
        });
    }
    catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ error: "좋아요 처리 중 오류가 발생했습니다" });
    }
});
// Search sentences
router.get("/api/search", async (req, res) => {
    try {
        const { q } = schema_1.searchSchema.parse(req.query);
        const results = await storage_1.storage.searchSentences(q);
        const formattedResults = results.map(s => ({
            ...s,
            timeAgo: formatTimeAgo(new Date(s.createdAt)),
            isLiked: false
        }));
        if (req.session?.userId) {
            const likedIds = await storage_1.storage.getUserLikedSentences(req.session.userId);
            formattedResults.forEach(s => {
                s.isLiked = likedIds.includes(s.id);
            });
        }
        res.json(formattedResults);
    }
    catch (error) {
        console.error("Search error:", error);
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: "검색 중 오류가 발생했습니다" });
    }
});
// Legacy delete with password
router.delete("/api/sentences/:id/delete", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const validatedData = schema_1.deleteSentenceSchema.parse(req.body);
        const success = await storage_1.storage.deleteSentenceWithPassword(id, validatedData.password);
        if (!success) {
            return res.status(403).json({ error: "비밀번호가 올바르지 않습니다" });
        }
        res.json({ message: "문장이 삭제되었습니다" });
    }
    catch (error) {
        console.error("Delete error:", error);
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: "문장 삭제 중 오류가 발생했습니다" });
    }
});
// Admin delete
router.delete("/api/sentences/:id/admin-delete", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { adminPassword } = schema_1.adminDeleteSchema.parse(req.body);
        const success = await storage_1.storage.adminDeleteSentence(id, adminPassword);
        if (!success) {
            return res.status(403).json({ error: "관리자 비밀번호가 올바르지 않습니다" });
        }
        res.json({ message: "문장이 관리자 권한으로 삭제되었습니다" });
    }
    catch (error) {
        console.error("Admin delete error:", error);
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: "문장 삭제 중 오류가 발생했습니다" });
    }
});
// Unlike sentence (separate endpoint)
router.delete("/api/sentences/:id/like", auth_1.requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.session.userId;
        const sentence = await storage_1.storage.getSentence(id);
        if (!sentence) {
            return res.status(404).json({ error: "문장을 찾을 수 없습니다" });
        }
        await storage_1.storage.removeLike(id, userId);
        const updatedSentence = await storage_1.storage.getSentence(id);
        res.json({
            isLiked: false,
            likes: updatedSentence?.likes || 0
        });
    }
    catch (error) {
        console.error("Error removing like:", error);
        res.status(500).json({ error: "좋아요 취소 중 오류가 발생했습니다" });
    }
});
exports.default = router;
