"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schema_1 = require("@shared/schema");
const auth_1 = require("../auth");
const storage_1 = require("../storage");
const router = (0, express_1.Router)();
// Get all public communities
router.get("/api/communities", async (req, res) => {
    try {
        const userId = req.session?.userId;
        const communities = await storage_1.storage.getAllCommunities(userId);
        res.json(communities);
    }
    catch (error) {
        console.error("Error fetching communities:", error);
        res.status(500).json({ error: "커뮤니티를 불러오는 중 오류가 발생했습니다" });
    }
});
// Get all communities with enhanced features for the communities tab
router.get("/api/communities/all", async (req, res) => {
    try {
        // Disable caching for debugging
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        const { sort = 'activity', q = '', includeTopSentences = 'false', offset = '0', limit = '9' } = req.query;
        const userId = req.session?.userId;
        console.log(`GET /api/communities/all - userId: ${userId}, sort: ${sort}, search: ${q}, offset: ${offset}, limit: ${limit}`);
        const communities = await storage_1.storage.getAllCommunitiesEnhanced({
            sort: sort,
            search: q,
            includeTopSentences: includeTopSentences === 'true',
            offset: parseInt(offset),
            limit: parseInt(limit),
            userId
        });
        console.log(`Returning ${communities.length} communities to client`);
        res.json(communities);
    }
    catch (error) {
        console.error("Error fetching communities:", error);
        res.status(500).json({ error: "커뮤니티를 불러오는 중 오류가 발생했습니다" });
    }
});
// Get user's communities
router.get("/api/communities/my", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const communities = await storage_1.storage.getUserCommunities(userId);
        res.json(communities);
    }
    catch (error) {
        console.error("Error fetching user communities:", error);
        res.status(500).json({ error: "커뮤니티를 불러오는 중 오류가 발생했습니다" });
    }
});
// Get single community details
router.get("/api/communities/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.session?.userId;
        const community = await storage_1.storage.getCommunity(id, userId);
        if (!community) {
            return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다" });
        }
        // Check access for private communities
        if (community.isPublic === 0 && !community.isMember) {
            return res.status(403).json({ error: "비공개 커뮤니티입니다. 가입 후 이용해주세요." });
        }
        res.json(community);
    }
    catch (error) {
        console.error("Error fetching community:", error);
        res.status(500).json({ error: "커뮤니티를 불러오는 중 오류가 발생했습니다" });
    }
});
// Get community sentences
router.get("/api/communities/:id/sentences", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { sort = 'latest' } = req.query;
        const userId = req.session?.userId;
        // Check if community exists and user has access
        const community = await storage_1.storage.getCommunity(id, userId);
        if (!community) {
            return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다" });
        }
        // Check access for private communities
        if (community.isPublic === 0 && !community.isMember) {
            return res.status(403).json({ error: "비공개 커뮤니티입니다. 가입 후 이용해주세요." });
        }
        const sentences = await storage_1.storage.getCommunitySentences(id, {
            sort: sort,
            userId
        });
        res.json(sentences);
    }
    catch (error) {
        console.error("Error fetching community sentences:", error);
        res.status(500).json({ error: "문장을 불러오는 중 오류가 발생했습니다" });
    }
});
// Create community
router.post("/api/communities", auth_1.requireAuth, async (req, res) => {
    try {
        const validatedData = schema_1.createCommunitySchema.parse(req.body);
        const userId = req.session.userId;
        console.log(`Creating community for user ${userId}:`, validatedData);
        const newCommunity = await storage_1.storage.createCommunity({
            ...validatedData,
            creatorId: userId
        });
        console.log(`Community created successfully:`, newCommunity);
        res.status(201).json(newCommunity);
    }
    catch (error) {
        console.error("Error creating community:", error);
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: "커뮤니티 생성 중 오류가 발생했습니다" });
    }
});
// Update community
router.put("/api/communities/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const validatedData = schema_1.updateCommunitySchema.parse(req.body);
        const userId = req.session.userId;
        // Check if user is owner or admin
        const community = await storage_1.storage.getCommunity(id, userId);
        if (!community) {
            return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다" });
        }
        if (community.creatorId !== userId && community.memberRole !== "admin") {
            return res.status(403).json({ error: "이 커뮤니티를 수정할 권한이 없습니다" });
        }
        const updatedCommunity = await storage_1.storage.updateCommunity(id, validatedData);
        res.json(updatedCommunity);
    }
    catch (error) {
        console.error("Error updating community:", error);
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: "커뮤니티 수정 중 오류가 발생했습니다" });
    }
});
// Delete community
router.delete("/api/communities/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.session.userId;
        const community = await storage_1.storage.getCommunity(id, userId);
        if (!community) {
            return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다" });
        }
        if (community.creatorId !== userId) {
            return res.status(403).json({ error: "이 커뮤니티를 삭제할 권한이 없습니다" });
        }
        await storage_1.storage.deleteCommunity(id);
        res.json({ message: "커뮤니티가 삭제되었습니다" });
    }
    catch (error) {
        console.error("Error deleting community:", error);
        res.status(500).json({ error: "커뮤니티 삭제 중 오류가 발생했습니다" });
    }
});
// Join community
router.post("/api/communities/:id/join", auth_1.requireAuth, async (req, res) => {
    try {
        const communityId = parseInt(req.params.id);
        const userId = req.session.userId;
        const success = await storage_1.storage.joinCommunity(communityId, userId);
        if (!success) {
            return res.status(400).json({ error: "이미 가입한 커뮤니티입니다" });
        }
        res.json({ message: "커뮤니티에 가입했습니다" });
    }
    catch (error) {
        console.error("Error joining community:", error);
        res.status(500).json({ error: "커뮤니티 가입 중 오류가 발생했습니다" });
    }
});
// Leave community
router.delete("/api/communities/:id/leave", auth_1.requireAuth, async (req, res) => {
    try {
        const communityId = parseInt(req.params.id);
        const userId = req.session.userId;
        const success = await storage_1.storage.leaveCommunity(communityId, userId);
        if (!success) {
            return res.status(400).json({ error: "가입하지 않은 커뮤니티입니다" });
        }
        res.json({ message: "커뮤니티에서 탈퇴했습니다" });
    }
    catch (error) {
        console.error("Error leaving community:", error);
        res.status(500).json({ error: "커뮤니티 탈퇴 중 오류가 발생했습니다" });
    }
});
// Add sentence to community
router.post("/api/communities/:id/sentences", auth_1.requireAuth, async (req, res) => {
    try {
        const communityId = parseInt(req.params.id);
        const { sentenceId } = req.body;
        const userId = req.session.userId;
        // Check if user is member
        const isMember = await storage_1.storage.isCommunitymember(communityId, userId);
        if (!isMember) {
            return res.status(403).json({ error: "커뮤니티 멤버만 문장을 추가할 수 있습니다" });
        }
        await storage_1.storage.addSentenceToCommunity(communityId, sentenceId);
        res.json({ message: "문장이 커뮤니티에 추가되었습니다" });
    }
    catch (error) {
        console.error("Error adding sentence to community:", error);
        res.status(500).json({ error: "문장 추가 중 오류가 발생했습니다" });
    }
});
exports.default = router;
