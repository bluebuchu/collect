import { Router } from "express";
import { requireAuth, type AuthRequest } from "../auth";
import { storage } from "../storage";
import { db } from "../db";
import { 
  bookClubs, 
  bookClubMembers, 
  bookClubSentences,
  bookClubMilestones,
  users,
  communities,
  sentences,
  createBookClubSchema,
  updateBookClubSchema,
  updateProgressSchema,
  type BookClubWithDetails 
} from "@shared/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

const router = Router();

// Get all book clubs for a community
router.get("/api/communities/:communityId/book-clubs", async (req: AuthRequest, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Get book clubs with member count and creator info
    const clubs = await db
      .select({
        bookClub: bookClubs,
        creator: {
          id: users.id,
          nickname: users.nickname,
          profileImage: users.profileImage,
        },
        community: {
          id: communities.id,
          name: communities.name,
        },
        memberCount: sql<number>`COUNT(DISTINCT ${bookClubMembers.userId})`,
      })
      .from(bookClubs)
      .leftJoin(users, eq(bookClubs.createdBy, users.id))
      .leftJoin(communities, eq(bookClubs.communityId, communities.id))
      .leftJoin(bookClubMembers, eq(bookClubs.id, bookClubMembers.bookClubId))
      .where(eq(bookClubs.communityId, communityId))
      .groupBy(bookClubs.id, users.id, communities.id)
      .orderBy(desc(bookClubs.createdAt));
    
    // Check if current user is a member of each club
    const userId = req.session?.userId;
    let enrichedClubs = clubs;
    
    if (userId) {
      const userMemberships = await db
        .select({ bookClubId: bookClubMembers.bookClubId })
        .from(bookClubMembers)
        .where(eq(bookClubMembers.userId, userId));
      
      const membershipMap = new Set(userMemberships.map(m => m.bookClubId));
      
      enrichedClubs = clubs.map(club => ({
        ...club.bookClub,
        creator: club.creator,
        community: club.community,
        memberCount: Number(club.memberCount),
        isJoined: membershipMap.has(club.bookClub.id),
      }));
    }
    
    res.json(enrichedClubs);
  } catch (error) {
    console.error("Get book clubs error:", error);
    res.status(500).json({ error: "Failed to fetch book clubs" });
  }
});

// Get single book club details
router.get("/api/book-clubs/:id", async (req: AuthRequest, res) => {
  try {
    const bookClubId = parseInt(req.params.id);
    const userId = req.session?.userId;
    
    // Get book club with details
    const [club] = await db
      .select({
        bookClub: bookClubs,
        creator: {
          id: users.id,
          nickname: users.nickname,
          profileImage: users.profileImage,
        },
        community: {
          id: communities.id,
          name: communities.name,
        },
        memberCount: sql<number>`COUNT(DISTINCT ${bookClubMembers.userId})`,
        averageProgress: sql<number>`AVG(${bookClubMembers.currentPage})`,
      })
      .from(bookClubs)
      .leftJoin(users, eq(bookClubs.createdBy, users.id))
      .leftJoin(communities, eq(bookClubs.communityId, communities.id))
      .leftJoin(bookClubMembers, eq(bookClubs.id, bookClubMembers.bookClubId))
      .where(eq(bookClubs.id, bookClubId))
      .groupBy(bookClubs.id, users.id, communities.id);
    
    if (!club) {
      return res.status(404).json({ error: "Book club not found" });
    }
    
    // Get members list
    const members = await db
      .select({
        user: {
          id: users.id,
          nickname: users.nickname,
          profileImage: users.profileImage,
        },
        member: bookClubMembers,
      })
      .from(bookClubMembers)
      .innerJoin(users, eq(bookClubMembers.userId, users.id))
      .where(eq(bookClubMembers.bookClubId, bookClubId))
      .orderBy(desc(bookClubMembers.currentPage));
    
    // Check if current user is a member
    let currentUserProgress = null;
    let isJoined = false;
    
    if (userId) {
      const [userMembership] = await db
        .select()
        .from(bookClubMembers)
        .where(
          and(
            eq(bookClubMembers.bookClubId, bookClubId),
            eq(bookClubMembers.userId, userId)
          )
        );
      
      if (userMembership) {
        isJoined = true;
        currentUserProgress = userMembership.currentPage;
      }
    }
    
    // Get milestones
    const milestones = await db
      .select()
      .from(bookClubMilestones)
      .where(eq(bookClubMilestones.bookClubId, bookClubId))
      .orderBy(asc(bookClubMilestones.weekNumber));
    
    const response: BookClubWithDetails & { 
      members: any[]; 
      milestones: any[];
    } = {
      ...club.bookClub,
      creator: club.creator!,
      community: club.community!,
      memberCount: Number(club.memberCount),
      averageProgress: Number(club.averageProgress) || 0,
      currentUserProgress,
      isJoined,
      members: members.map(m => ({
        ...m.user,
        ...m.member,
      })),
      milestones,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get book club details error:", error);
    res.status(500).json({ error: "Failed to fetch book club details" });
  }
});

// Create new book club
router.post("/api/book-clubs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.session!.userId!;
    const validatedData = createBookClubSchema.parse(req.body);
    
    // Check if user is a member of the community
    const [membership] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, validatedData.communityId));
    
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this community" });
    }
    
    // Create book club
    const [newClub] = await db
      .insert(bookClubs)
      .values({
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        createdBy: userId,
        status: "upcoming",
      })
      .returning();
    
    // Auto-join creator as leader
    await db.insert(bookClubMembers).values({
      bookClubId: newClub.id,
      userId: userId,
      role: "leader",
    });
    
    // Create milestones if total chapters provided
    if (validatedData.totalChapters) {
      const startDate = new Date(validatedData.startDate);
      const endDate = new Date(validatedData.endDate);
      const totalWeeks = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      const chaptersPerWeek = Math.ceil(validatedData.totalChapters / totalWeeks);
      
      const milestones = [];
      let currentChapter = 1;
      
      for (let week = 1; week <= totalWeeks; week++) {
        const chapterEnd = Math.min(
          currentChapter + chaptersPerWeek - 1,
          validatedData.totalChapters
        );
        
        milestones.push({
          bookClubId: newClub.id,
          weekNumber: week,
          chapterStart: currentChapter,
          chapterEnd: chapterEnd,
          targetDate: new Date(
            startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000
          ),
          status: week === 1 ? "active" : "pending",
        });
        
        currentChapter = chapterEnd + 1;
        if (currentChapter > validatedData.totalChapters) break;
      }
      
      if (milestones.length > 0) {
        await db.insert(bookClubMilestones).values(milestones);
      }
    }
    
    res.status(201).json(newClub);
  } catch (error: any) {
    console.error("Create book club error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to create book club" });
  }
});

// Join book club
router.post("/api/book-clubs/:id/join", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.session!.userId!;
    const bookClubId = parseInt(req.params.id);
    
    // Check if already a member
    const [existing] = await db
      .select()
      .from(bookClubMembers)
      .where(
        and(
          eq(bookClubMembers.bookClubId, bookClubId),
          eq(bookClubMembers.userId, userId)
        )
      );
    
    if (existing) {
      return res.status(400).json({ error: "Already a member of this book club" });
    }
    
    // Check if book club exists and has space
    const [club] = await db
      .select({
        bookClub: bookClubs,
        memberCount: sql<number>`COUNT(${bookClubMembers.userId})`,
      })
      .from(bookClubs)
      .leftJoin(bookClubMembers, eq(bookClubs.id, bookClubMembers.bookClubId))
      .where(eq(bookClubs.id, bookClubId))
      .groupBy(bookClubs.id);
    
    if (!club) {
      return res.status(404).json({ error: "Book club not found" });
    }
    
    if (Number(club.memberCount) >= (club.bookClub.maxMembers || 50)) {
      return res.status(400).json({ error: "Book club is full" });
    }
    
    // Join the club
    const [newMember] = await db
      .insert(bookClubMembers)
      .values({
        bookClubId,
        userId,
        role: "member",
      })
      .returning();
    
    res.json({ message: "Successfully joined book club", member: newMember });
  } catch (error) {
    console.error("Join book club error:", error);
    res.status(500).json({ error: "Failed to join book club" });
  }
});

// Update reading progress
router.put("/api/book-clubs/:id/progress", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.session!.userId!;
    const bookClubId = parseInt(req.params.id);
    const { currentPage } = updateProgressSchema.parse(req.body);
    
    // Update progress
    const [updated] = await db
      .update(bookClubMembers)
      .set({
        currentPage,
        lastReadAt: new Date(),
      })
      .where(
        and(
          eq(bookClubMembers.bookClubId, bookClubId),
          eq(bookClubMembers.userId, userId)
        )
      )
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: "Not a member of this book club" });
    }
    
    res.json({ message: "Progress updated", progress: updated });
  } catch (error: any) {
    console.error("Update progress error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// Get book club sentences
router.get("/api/book-clubs/:id/sentences", async (req: AuthRequest, res) => {
  try {
    const bookClubId = parseInt(req.params.id);
    const chapterNum = req.query.chapter ? parseInt(req.query.chapter as string) : undefined;
    
    let query = db
      .select({
        sentence: sentences,
        user: {
          id: users.id,
          nickname: users.nickname,
          profileImage: users.profileImage,
        },
        bookClubSentence: bookClubSentences,
      })
      .from(bookClubSentences)
      .innerJoin(sentences, eq(bookClubSentences.sentenceId, sentences.id))
      .leftJoin(users, eq(sentences.userId, users.id))
      .where(eq(bookClubSentences.bookClubId, bookClubId))
      .$dynamic();
    
    if (chapterNum !== undefined) {
      query = query.where(eq(bookClubSentences.chapterNum, chapterNum));
    }
    
    const results = await query.orderBy(desc(bookClubSentences.addedAt));
    
    const formattedSentences = results.map(r => ({
      ...r.sentence,
      user: r.user,
      chapterNum: r.bookClubSentence.chapterNum,
      pageNum: r.bookClubSentence.pageNum,
    }));
    
    res.json(formattedSentences);
  } catch (error) {
    console.error("Get book club sentences error:", error);
    res.status(500).json({ error: "Failed to fetch sentences" });
  }
});

// Leave book club
router.delete("/api/book-clubs/:id/leave", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.session!.userId!;
    const bookClubId = parseInt(req.params.id);
    
    const [deleted] = await db
      .delete(bookClubMembers)
      .where(
        and(
          eq(bookClubMembers.bookClubId, bookClubId),
          eq(bookClubMembers.userId, userId)
        )
      )
      .returning();
    
    if (!deleted) {
      return res.status(404).json({ error: "Not a member of this book club" });
    }
    
    res.json({ message: "Successfully left book club" });
  } catch (error) {
    console.error("Leave book club error:", error);
    res.status(500).json({ error: "Failed to leave book club" });
  }
});

export default router;