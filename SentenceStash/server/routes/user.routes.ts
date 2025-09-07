import { Router } from "express";
import { requireAuth, type AuthRequest } from "../auth";
import { storage } from "../storage";

const router = Router();

// Get user's sentences
router.get("/api/user/sentences", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.session!.userId!;
    const { search, sort = 'latest' } = req.query;
    
    let userSentences = await storage.getUserSentences(userId);
    
    if (search) {
      const searchLower = search.toString().toLowerCase();
      userSentences = userSentences.filter(s => 
        s.content.toLowerCase().includes(searchLower) ||
        s.bookTitle?.toLowerCase().includes(searchLower) ||
        s.author?.toLowerCase().includes(searchLower)
      );
    }
    
    switch(sort) {
      case 'popular':
        userSentences.sort((a, b) => b.likes - a.likes);
        break;
      case 'oldest':
        userSentences.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'latest':
      default:
        userSentences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    res.json(userSentences);
  } catch (error) {
    console.error("Error fetching user sentences:", error);
    res.status(500).json({ error: "문장을 불러오는 중 오류가 발생했습니다" });
  }
});

// Get user stats
router.get("/api/user/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.session!.userId!;
    const stats = await storage.getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "통계를 불러오는 중 오류가 발생했습니다" });
  }
});

// Get overall stats
router.get("/api/stats", async (req, res) => {
  try {
    const stats = await storage.getOverallStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "통계를 불러오는 중 오류가 발생했습니다" });
  }
});

// Get recent activity
router.get("/api/recent-activity", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await storage.getRecentActivity(limit);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "최근 활동을 불러오는 중 오류가 발생했습니다" });
  }
});

// Get contributor rankings
router.get("/api/contributors", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const contributors = await storage.getTopContributors(limit);
    res.json(contributors);
  } catch (error) {
    console.error("Error fetching contributors:", error);
    res.status(500).json({ error: "기여자 순위를 불러오는 중 오류가 발생했습니다" });
  }
});

export default router;