import { Router } from "express";
import { db } from "../db";
import { users, sentences, sentenceLikes } from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

// Admin password check middleware
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const adminTokens = new Map<string, number>(); // token -> timestamp

// Verify admin auth
function verifyAdminAuth(req: any, res: any, next: any) {
  const authHeader = req.headers["x-admin-auth"];
  
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const authData = JSON.parse(authHeader);
    const token = authData.token;
    const tokenTime = adminTokens.get(token);
    
    if (!tokenTime || Date.now() - tokenTime > 30 * 60 * 1000) {
      adminTokens.delete(token);
      return res.status(401).json({ error: "Session expired" });
    }
    
    // Refresh token time
    adminTokens.set(token, Date.now());
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid auth" });
  }
}

// Admin login
router.post("/api/admin/auth", async (req, res) => {
  try {
    const { password } = req.body;
    
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid password" });
    }
    
    // Generate simple token
    const token = Math.random().toString(36).substring(7) + Date.now().toString(36);
    adminTokens.set(token, Date.now());
    
    // Clean old tokens
    for (const [t, time] of adminTokens.entries()) {
      if (Date.now() - time > 30 * 60 * 1000) {
        adminTokens.delete(t);
      }
    }
    
    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Get admin data
router.get("/api/admin/data", verifyAdminAuth, async (req, res) => {
  try {
    // Get all users with sentence counts
    const usersData = await db
      .select({
        id: users.id,
        email: users.email,
        nickname: users.nickname,
        createdAt: users.createdAt,
        sentenceCount: sql<number>`(
          SELECT COUNT(*) FROM ${sentences} 
          WHERE ${sentences.userId} = ${users.id}
        )`.as('sentenceCount')
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    
    // Get all sentences with user info
    const sentencesData = await db
      .select({
        id: sentences.id,
        content: sentences.content,
        userId: sentences.userId,
        bookTitle: sentences.bookTitle,
        likes: sentences.likes,
        createdAt: sentences.createdAt,
        userNickname: users.nickname,
      })
      .from(sentences)
      .leftJoin(users, eq(sentences.userId, users.id))
      .orderBy(desc(sentences.createdAt))
      .limit(100); // Limit for performance
    
    // Get stats
    const totalUsers = usersData.length;
    const totalSentences = await db
      .select({ count: sql<number>`COUNT(*)`.as('count') })
      .from(sentences);
    const totalLikesResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(${sentences.likes}), 0)`.as('sum') })
      .from(sentences);
    
    res.json({
      users: usersData,
      sentences: sentencesData,
      stats: {
        totalUsers,
        totalSentences: totalSentences[0]?.count || 0,
        totalLikes: totalLikesResult[0]?.sum || 0,
      },
    });
  } catch (error) {
    console.error("Admin data fetch error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Delete user or sentence
router.delete("/api/admin/delete", verifyAdminAuth, async (req, res) => {
  try {
    const { type, id } = req.body;
    
    if (!type || !id) {
      return res.status(400).json({ error: "Missing type or id" });
    }
    
    if (type === "user") {
      // Delete user's likes first
      await db.delete(sentenceLikes).where(eq(sentenceLikes.userId, id));
      
      // Delete user's sentences' likes
      await db
        .delete(sentenceLikes)
        .where(sql`${sentenceLikes.sentenceId} IN (
          SELECT id FROM ${sentences} WHERE ${sentences.userId} = ${id}
        )`);
      
      // Delete user's sentences
      await db.delete(sentences).where(eq(sentences.userId, id));
      
      // Delete user
      const result = await db.delete(users).where(eq(users.id, id));
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } else if (type === "sentence") {
      // Delete sentence likes first
      await db.delete(sentenceLikes).where(eq(sentenceLikes.sentenceId, id));
      
      // Delete sentence
      const result = await db.delete(sentences).where(eq(sentences.id, id));
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Sentence not found" });
      }
      
      res.json({ message: "Sentence deleted successfully" });
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }
  } catch (error) {
    console.error("Admin delete error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;