import {
  type Sentence,
  type SentenceWithUser,
  type InsertSentence,
  type UpdateSentence,
  type User,
  type InsertUser,
  type UpdateUser,
  type Book,
  type BookWithStats,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class MockStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private sentences: Map<number, SentenceWithUser> = new Map();
  private sentenceLikes: Map<string, boolean> = new Map(); // "sentenceId-userId" => true
  private communities: Map<number, any> = new Map();
  private communityMembers: Map<string, any> = new Map(); // "communityId-userId" => member
  private communitySentences: Map<string, boolean> = new Map(); // "communityId-sentenceId" => true
  private books: Map<number, Book> = new Map();
  private booksByIsbn: Map<string, Book> = new Map();
  private nextUserId = 1;
  private nextSentenceId = 1;
  private nextCommunityId = 1;
  private nextBookId = 1;

  constructor() {
    // Create a demo user for testing
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo users with pre-hashed passwords
    // These are bcrypt hashes for demo123 and hiki7979!
    const demoUser: User = {
      id: 1,
      email: "demo@example.com",
      password: "$2b$10$YourHashedPasswordHere", // This will be replaced by auth check
      nickname: "데모 사용자",
      profileImage: null,
      bio: "안녕하세요! 테스트 계정입니다.",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(1, demoUser);
    
    // Create julywinds account
    const julyUser: User = {
      id: 2,
      email: "julywinds@gmail.com",
      password: "$2b$10$YourHashedPasswordHere", // This will be replaced by auth check
      nickname: "July",
      profileImage: null,
      bio: "문장 수집가",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(2, julyUser);
    this.nextUserId = 3;
    
    // Hash passwords asynchronously after initialization
    this.hashPasswords();

    // Create some demo communities
    this.createDemoCommunities();
  }
  
  private createDemoCommunities() {
    // Create a few sample communities
    const community1 = {
      id: 1,
      name: "무라카미 하루키 팬클럽",
      description: "무라카미 하루키의 작품을 사랑하는 사람들의 모임",
      coverImage: null,
      category: "author",
      relatedBook: null,
      creatorId: 1,
      memberCount: 1,
      isPublic: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.communities.set(1, community1);
    this.communityMembers.set("1-1", {
      communityId: 1,
      userId: 1,
      role: "owner",
      joinedAt: new Date(),
    });
    
    const community2 = {
      id: 2,
      name: "SF 소설 독서 모임",
      description: "SF 장르를 좋아하는 독서가들의 커뮤니티",
      coverImage: null,
      category: "genre",
      relatedBook: null,
      creatorId: 1,
      memberCount: 1,
      isPublic: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.communities.set(2, community2);
    this.communityMembers.set("2-1", {
      communityId: 2,
      userId: 1,
      role: "owner",
      joinedAt: new Date(),
    });
    
    this.nextCommunityId = 3;
    
    // Create some sample public sentences
    this.createDemoSentences();
  }
  
  private async hashPasswords() {
    // Dynamically import AuthService to avoid circular dependency
    const { AuthService } = await import("./auth");
    
    // Update demo user password
    const demoUser = this.users.get(1);
    if (demoUser) {
      demoUser.password = await AuthService.hashPassword("demo123");
      this.users.set(1, demoUser);
    }
    
    // Update july user password
    const julyUser = this.users.get(2);
    if (julyUser) {
      julyUser.password = await AuthService.hashPassword("hiki7979!");
      this.users.set(2, julyUser);
    }
  }
  
  private createDemoSentences() {
    console.log("Starting createDemoSentences...");
    // Create sample public sentences for testing
    const demoSentences = [
      {
        id: 1,
        userId: 1,
        content: "완벽한 문장이란 없다. 완벽한 절망이 없는 것처럼.",
        bookTitle: "노르웨이의 숲",
        author: "무라카미 하루키",
        pageNumber: 45,
        likes: 12,
        isPublic: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        legacyNickname: null,
        user: {
          nickname: "데모 사용자",
          profileImage: null,
        }
      },
      {
        id: 2,
        userId: 1,
        content: "우리는 모두 별에서 온 먼지다. 우주의 시각에서 보면 인간의 삶은 찰나에 불과하지만, 그 찰나가 우리에게는 전부다.",
        bookTitle: "코스모스",
        author: "칼 세이건",
        pageNumber: 189,
        likes: 8,
        isPublic: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        legacyNickname: null,
        user: {
          nickname: "데모 사용자",
          profileImage: null,
        }
      },
      {
        id: 3,
        userId: 2,
        content: "행복은 언제나 곁에 있다. 다만 우리가 그것을 알아차리지 못할 뿐이다.",
        bookTitle: "어린 왕자",
        author: "생텍쥐페리",
        pageNumber: 72,
        likes: 15,
        isPublic: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        legacyNickname: null,
        user: {
          nickname: "July",
          profileImage: null,
        }
      }
    ];
    
    demoSentences.forEach(sentence => {
      this.sentences.set(sentence.id, sentence as SentenceWithUser);
      console.log(`Added sentence ${sentence.id} to Map, isPublic: ${sentence.isPublic}`);
    });
    
    this.nextSentenceId = 4;
    
    console.log("Demo sentences created. Public sentences:", demoSentences.length);
    console.log("Total sentences in Map:", this.sentences.size);
    console.log("Sentences Map entries:", Array.from(this.sentences.entries()).map(([id, s]) => ({ id, isPublic: s.isPublic })));
  }

  // User operations
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUserByNickname(nickname: string): Promise<User | null> {
    return Array.from(this.users.values()).find(u => u.nickname === nickname) || null;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      email: userData.email,
      password: userData.password,
      nickname: userData.nickname,
      profileImage: userData.profileImage || null,
      bio: userData.bio || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    console.log("Mock: User created:", user.id, user.email);
    return user;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Sentence operations
  async getSentences(): Promise<SentenceWithUser[]> {
    return Array.from(this.sentences.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSentenceById(id: number): Promise<SentenceWithUser | undefined> {
    return this.sentences.get(id);
  }

  async getUserSentences(userId: number): Promise<SentenceWithUser[]> {
    return Array.from(this.sentences.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserSentencesWithSearch(userId: number, query: string): Promise<SentenceWithUser[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.sentences.values())
      .filter(s => 
        s.userId === userId &&
        (s.content.toLowerCase().includes(lowerQuery) ||
         s.bookTitle?.toLowerCase().includes(lowerQuery) ||
         s.author?.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createSentence(sentence: InsertSentence & { isPublic?: number }, userId: number): Promise<SentenceWithUser> {
    // userId가 InsertSentence에 포함되어 있으면 그것을 사용
    const actualUserId = sentence.userId || userId;
    const user = this.users.get(actualUserId);
    if (!user) throw new Error(`User not found with id: ${actualUserId}`);

    const id = this.nextSentenceId++;
    // Ensure isPublic is a number (convert string to number if needed)
    const isPublicValue = sentence.isPublic !== undefined ? Number(sentence.isPublic) : 0;
    
    console.log("Creating sentence with:", {
      id,
      userId: actualUserId,
      isPublic: isPublicValue,
      isPublicType: typeof isPublicValue,
      content: sentence.content.substring(0, 50)
    });
    
    const newSentence: SentenceWithUser = {
      id,
      userId: actualUserId,
      content: sentence.content,
      bookTitle: sentence.bookTitle || null,
      author: sentence.author || null,
      publisher: sentence.publisher || null,
      pageNumber: sentence.pageNumber || null,
      likes: 0,
      isPublic: isPublicValue,
      privateNote: null,
      isBookmarked: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      legacyNickname: sentence.legacyNickname || null,
      user: {
        nickname: user.nickname,
        profileImage: user.profileImage,
      }
    };
    this.sentences.set(id, newSentence);
    
    console.log("Sentence created successfully. Total sentences:", this.sentences.size);
    console.log("Public sentences count:", Array.from(this.sentences.values()).filter(s => s.isPublic === 1).length);
    
    return newSentence;
  }

  async updateSentence(id: number, sentence: UpdateSentence | any, userId?: number): Promise<SentenceWithUser | undefined> {
    const existing = this.sentences.get(id);
    if (!existing) return undefined;
    
    // If userId is provided, check ownership
    if (userId !== undefined && existing.userId !== userId) return undefined;

    const updated = {
      ...existing,
      ...sentence,
      updatedAt: new Date(),
    };
    this.sentences.set(id, updated);
    return updated;
  }

  async deleteSentence(id: number): Promise<boolean> {
    return this.sentences.delete(id);
  }

  async deleteSentenceWithPassword(id: number, password: string): Promise<boolean> {
    // Mock implementation - in production this would verify password
    if (!password) return false;
    return this.sentences.delete(id);
  }

  async adminDeleteSentence(id: number, adminPassword: string): Promise<boolean> {
    if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== "admin123") {
      return false;
    }
    return this.sentences.delete(id);
  }

  async incrementLikes(id: number): Promise<SentenceWithUser | undefined> {
    const sentence = this.sentences.get(id);
    if (!sentence) return undefined;

    sentence.likes++;
    sentence.updatedAt = new Date();
    return sentence;
  }

  async searchSentences(query: string): Promise<SentenceWithUser[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.sentences.values())
      .filter(s =>
        s.content.toLowerCase().includes(lowerQuery) ||
        s.bookTitle?.toLowerCase().includes(lowerQuery) ||
        s.author?.toLowerCase().includes(lowerQuery) ||
        s.user?.nickname?.toLowerCase().includes(lowerQuery) ||
        s.legacyNickname?.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Additional methods for compatibility
  async getSentence(id: number): Promise<SentenceWithUser | null> {
    return this.sentences.get(id) || null;
  }


  async getUserLikedSentences(userId: number): Promise<number[]> {
    const likedSentenceIds: number[] = [];
    for (const [key] of this.sentenceLikes) {
      const [sentenceId, likeUserId] = key.split('-').map(Number);
      if (likeUserId === userId) {
        likedSentenceIds.push(sentenceId);
      }
    }
    return likedSentenceIds;
  }

  async toggleLike(sentenceId: number, userId: number): Promise<boolean> {
    const sentence = this.sentences.get(sentenceId);
    if (!sentence) return false;
    
    const key = `${sentenceId}-${userId}`;
    if (this.sentenceLikes.has(key)) {
      // Unlike
      this.sentenceLikes.delete(key);
      if (sentence.likes > 0) sentence.likes--;
      sentence.updatedAt = new Date();
      return false;
    } else {
      // Like
      this.sentenceLikes.set(key, true);
      sentence.likes++;
      sentence.updatedAt = new Date();
      return true;
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
    const allSentences = Array.from(this.sentences.values());
    const totalUsers = this.users.size;
    
    return {
      totalSentences: allSentences.length,
      totalUsers,
      totalLikes: allSentences.reduce((sum, s) => sum + s.likes, 0),
      popularSentences: allSentences.sort((a, b) => b.likes - a.likes).slice(0, 5)
    };
  }

  async getRecentActivity(limit: number): Promise<any[]> {
    const activities = Array.from(this.sentences.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(s => ({
        type: 'sentence_added',
        content: s.content,
        bookTitle: s.bookTitle,
        userNickname: s.userNickname,
        createdAt: s.createdAt
      }));
    
    return activities;
  }

  async getTopContributors(limit: number): Promise<any[]> {
    const userContributions = new Map<number, {
      userId: number;
      nickname: string;
      profileImage: string | null;
      sentenceCount: number;
      totalLikes: number;
    }>();
    
    for (const sentence of this.sentences.values()) {
      if (!sentence.userId) continue;
      
      const user = this.users.get(sentence.userId);
      if (!user) continue;
      
      if (!userContributions.has(sentence.userId)) {
        userContributions.set(sentence.userId, {
          userId: user.id,
          nickname: user.nickname,
          profileImage: user.profileImage || null,
          sentenceCount: 0,
          totalLikes: 0
        });
      }
      
      const contrib = userContributions.get(sentence.userId)!;
      contrib.sentenceCount++;
      contrib.totalLikes += sentence.likes;
    }
    
    return Array.from(userContributions.values())
      .sort((a, b) => b.sentenceCount - a.sentenceCount)
      .slice(0, limit);
  }


  async createPasswordResetToken(userId: number): Promise<string> {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    // In mock storage, we just return the token without storing
    return token;
  }

  async validatePasswordResetToken(token: string): Promise<boolean> {
    // In mock storage, always return false for security
    return false;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // In mock storage, this is a no-op
    throw new Error("Password reset not supported in mock storage");
  }

  // Community operations  
  async getCommunitySentences(): Promise<SentenceWithUser[]> {
    console.log("getCommunitySentences called");
    console.log("Current sentences Map size:", this.sentences.size);
    console.log("Sentences in Map:", Array.from(this.sentences.entries()).map(([id, s]) => ({ id, isPublic: s.isPublic })));
    
    const publicSentences = Array.from(this.sentences.values())
      .filter(s => {
        console.log(`Checking sentence ${s.id}: isPublic=${s.isPublic}, type=${typeof s.isPublic}`);
        return s.isPublic === 1;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log("Getting community sentences:", publicSentences.length, "public sentences found");
    console.log("All sentences:", Array.from(this.sentences.values()).map(s => ({ id: s.id, isPublic: s.isPublic, content: s.content.substring(0, 30) })));
    
    return publicSentences;
  }

  async getCommunityStats(): Promise<any> {
    const communitySentences = await this.getCommunitySentences();
    
    // Get top sentences by likes
    const topSentences = communitySentences
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3)
      .map(s => ({
        ...s,
        likesCount: s.likes
      }));
    
    // Get top contributors
    const userContributions = new Map<number, {
      userId: number;
      nickname: string;
      profileImage: string | null;
      sentenceCount: number;
      totalLikes: number;
    }>();
    
    for (const sentence of communitySentences) {
      if (!sentence.userId) continue;
      
      const user = this.users.get(sentence.userId);
      if (!user) continue;
      
      if (!userContributions.has(sentence.userId)) {
        userContributions.set(sentence.userId, {
          userId: user.id,
          nickname: user.nickname,
          profileImage: user.profileImage || null,
          sentenceCount: 0,
          totalLikes: 0
        });
      }
      
      const contrib = userContributions.get(sentence.userId)!;
      contrib.sentenceCount++;
      contrib.totalLikes += sentence.likes;
    }
    
    const topContributors = Array.from(userContributions.values())
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 3);
    
    // Get unique users who contributed
    const uniqueUserIds = new Set(communitySentences.map(s => s.userId).filter(Boolean));
    
    return {
      topSentences,
      topContributors,
      totalSentences: communitySentences.length,
      totalUsers: uniqueUserIds.size,
    };
  }

  async removeLike(sentenceId: number, userId: number): Promise<void> {
    const key = `${sentenceId}-${userId}`;
    if (this.sentenceLikes.has(key)) {
      this.sentenceLikes.delete(key);
      const sentence = this.sentences.get(sentenceId);
      if (sentence && sentence.likes > 0) {
        sentence.likes--;
        sentence.updatedAt = new Date();
      }
    }
  }

  // Export operations
  async getSentencesByBook(userId: number, bookTitle: string): Promise<SentenceWithUser[]> {
    const userSentences = await this.getUserSentences(userId);
    return userSentences.filter(s => s.bookTitle === bookTitle);
  }

  // New community management methods
  async getAllCommunities(userId?: number): Promise<any[]> {
    const communities = Array.from(this.communities.values())
      .filter(c => c.isPublic === 1)
      .map(c => {
        const topSentences = this.getTopCommunitySentences(c.id, 2);
        const isMember = userId ? this.communityMembers.has(`${c.id}-${userId}`) : false;
        const memberData = userId ? this.communityMembers.get(`${c.id}-${userId}`) : null;
        return {
          ...c,
          topSentences,
          isMember,
          memberRole: memberData?.role,
        };
      });
    
    // Sort by member count and activity
    return communities.sort((a, b) => b.memberCount - a.memberCount);
  }

  async getAllCommunitiesEnhanced(options: { 
    sort: string; 
    search: string; 
    includeTopSentences: boolean;
    offset: number;
    limit: number;
    userId?: number 
  }): Promise<any[]> {
    console.log(`getAllCommunitiesEnhanced called with:`, options);
    console.log(`Total communities in storage:`, this.communities.size);
    
    let communities = Array.from(this.communities.values());
    console.log(`Communities before filtering:`, communities.map(c => ({ id: c.id, name: c.name, isPublic: c.isPublic })));

    // Filter to show only public communities or communities the user is a member of
    communities = communities.filter(c => {
      const isPublic = c.isPublic === 1;
      const isMember = options.userId ? this.communityMembers.has(`${c.id}-${options.userId}`) : false;
      const shouldShow = isPublic || isMember;
      console.log(`Community ${c.id} (${c.name}): isPublic=${isPublic}, isMember=${isMember}, shouldShow=${shouldShow}`);
      return shouldShow;
    });

    // Filter by search
    if (options.search) {
      communities = communities.filter(c => 
        c.name.toLowerCase().includes(options.search.toLowerCase()) ||
        c.description?.toLowerCase().includes(options.search.toLowerCase())
      );
    }

    // Map with additional info
    const enhancedCommunities = communities.map(c => {
      const isMember = options.userId ? this.communityMembers.has(`${c.id}-${options.userId}`) : false;
      const memberData = options.userId ? this.communityMembers.get(`${c.id}-${options.userId}`) : null;
      const topSentences = options.includeTopSentences ? this.getTopCommunitySentences(c.id, 3) : [];
      
      // Calculate activity score (simple calculation)
      const sentenceCount = c.sentenceCount || 0;
      const totalLikes = c.totalLikes || 0;
      const totalComments = c.totalComments || 0;
      // Add member count and recency to activity score
      const daysSinceCreation = Math.max(1, Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      const recencyBonus = Math.max(0, 30 - daysSinceCreation); // Bonus for newer communities
      const activityScore = totalLikes + totalComments * 2 + sentenceCount * 3 + c.memberCount * 5 + recencyBonus;
      
      const creator = this.users.get(c.creatorId);
      
      return {
        ...c,
        sentenceCount,
        totalLikes,
        activityScore: c.activityScore || activityScore,
        topSentences,
        isMember,
        memberRole: memberData?.role,
        creator: creator ? {
          nickname: creator.nickname,
          profileImage: creator.profileImage
        } : {
          nickname: "Unknown Creator",
          profileImage: null
        }
      };
    });

    // Sort based on option
    let sortedCommunities;
    switch (options.sort) {
      case 'members':
        sortedCommunities = enhancedCommunities.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case 'recent':
        sortedCommunities = enhancedCommunities.sort((a, b) => 
          new Date(b.lastActivityAt || b.createdAt).getTime() - 
          new Date(a.lastActivityAt || a.createdAt).getTime()
        );
        break;
      case 'activity':
      default:
        sortedCommunities = enhancedCommunities.sort((a, b) => b.activityScore - a.activityScore);
        break;
    }
    
    console.log(`Sorted communities count: ${sortedCommunities.length}`);
    console.log(`Applying pagination: offset=${options.offset}, limit=${options.limit}`);
    
    // Apply pagination
    const result = sortedCommunities.slice(options.offset, options.offset + options.limit);
    console.log(`Returning ${result.length} communities`);
    
    return result;
  }

  async getUserCommunities(userId: number): Promise<any[]> {
    const userCommunities: any[] = [];
    for (const [key, member] of this.communityMembers) {
      const [communityId, memberId] = key.split('-').map(Number);
      if (memberId === userId) {
        const community = this.communities.get(communityId);
        if (community) {
          const topSentences = this.getTopCommunitySentences(communityId, 2);
          userCommunities.push({
            ...community,
            topSentences,
            isMember: true,
            memberRole: member.role,
          });
        }
      }
    }
    return userCommunities;
  }

  async getCommunity(id: number, userId?: number): Promise<any> {
    const community = this.communities.get(id);
    if (!community) return null;
    
    const creator = this.users.get(community.creatorId);
    const topSentences = this.getTopCommunitySentences(id, 3);
    const isMember = userId ? this.communityMembers.has(`${id}-${userId}`) : false;
    const memberData = userId ? this.communityMembers.get(`${id}-${userId}`) : null;
    
    return {
      ...community,
      creator: creator ? {
        nickname: creator.nickname,
        profileImage: creator.profileImage,
      } : null,
      topSentences,
      isMember,
      memberRole: memberData?.role,
    };
  }

  async createCommunity(data: any): Promise<any> {
    const id = this.nextCommunityId++;
    const newCommunity = {
      id,
      name: data.name,
      description: data.description || null,
      coverImage: data.coverImage || null,
      category: data.category || null,
      relatedBook: data.relatedBook || null,
      creatorId: data.creatorId,
      memberCount: 1,
      isPublic: data.isPublic || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.communities.set(id, newCommunity);
    
    // Creator automatically becomes a member with owner role
    this.communityMembers.set(`${id}-${data.creatorId}`, {
      communityId: id,
      userId: data.creatorId,
      role: 'owner',
      joinedAt: new Date(),
    });
    
    return newCommunity;
  }

  async updateCommunity(id: number, data: any): Promise<any> {
    const community = this.communities.get(id);
    if (!community) return null;
    
    const updated = {
      ...community,
      ...data,
      updatedAt: new Date(),
    };
    this.communities.set(id, updated);
    return updated;
  }

  async deleteCommunity(id: number): Promise<boolean> {
    // Remove all members
    for (const key of Array.from(this.communityMembers.keys())) {
      if (key.startsWith(`${id}-`)) {
        this.communityMembers.delete(key);
      }
    }
    
    // Remove all community sentences
    for (const key of Array.from(this.communitySentences.keys())) {
      if (key.startsWith(`${id}-`)) {
        this.communitySentences.delete(key);
      }
    }
    
    return this.communities.delete(id);
  }

  async joinCommunity(communityId: number, userId: number): Promise<boolean> {
    const key = `${communityId}-${userId}`;
    if (this.communityMembers.has(key)) {
      return false; // Already a member
    }
    
    this.communityMembers.set(key, {
      communityId,
      userId,
      role: 'member',
      joinedAt: new Date(),
    });
    
    // Update member count
    const community = this.communities.get(communityId);
    if (community) {
      community.memberCount++;
      community.updatedAt = new Date();
    }
    
    return true;
  }

  async leaveCommunity(communityId: number, userId: number): Promise<boolean> {
    const key = `${communityId}-${userId}`;
    const member = this.communityMembers.get(key);
    
    if (!member || member.role === 'owner') {
      return false; // Not a member or owner can't leave
    }
    
    this.communityMembers.delete(key);
    
    // Update member count
    const community = this.communities.get(communityId);
    if (community && community.memberCount > 0) {
      community.memberCount--;
      community.updatedAt = new Date();
    }
    
    return true;
  }

  async isCommunitymember(communityId: number, userId: number): Promise<boolean> {
    return this.communityMembers.has(`${communityId}-${userId}`);
  }

  async addSentenceToCommunity(communityId: number, sentenceId: number): Promise<void> {
    this.communitySentences.set(`${communityId}-${sentenceId}`, true);
  }

  async getCommunitySentencesById(communityId: number, options: any = {}): Promise<SentenceWithUser[]> {
    const sentenceIds: number[] = [];
    for (const [key] of this.communitySentences) {
      const [cId, sId] = key.split('-').map(Number);
      if (cId === communityId) {
        sentenceIds.push(sId);
      }
    }
    
    const sentences = sentenceIds
      .map(id => this.sentences.get(id))
      .filter(Boolean) as SentenceWithUser[];
    
    // Sort based on options
    if (options.sort === 'likes') {
      sentences.sort((a, b) => b.likes - a.likes);
    } else if (options.sort === 'oldest') {
      sentences.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } else {
      sentences.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    // Add isLiked status if userId provided
    if (options.userId) {
      sentences.forEach(s => {
        s.isLiked = this.sentenceLikes.has(`${s.id}-${options.userId}`);
      });
    }
    
    return sentences;
  }

  // Helper method to get top sentences for a community
  private getTopCommunitySentences(communityId: number, limit: number): SentenceWithUser[] {
    const sentenceIds: number[] = [];
    for (const [key] of this.communitySentences) {
      const [cId, sId] = key.split('-').map(Number);
      if (cId === communityId) {
        sentenceIds.push(sId);
      }
    }
    
    const sentences = sentenceIds
      .map(id => this.sentences.get(id))
      .filter(Boolean) as SentenceWithUser[];
    
    return sentences
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);
  }

  // Book-related methods
  async searchCachedBooks(query: string): Promise<Book[]> {
    const books = Array.from(this.books.values());
    const searchLower = query.toLowerCase();
    
    return books
      .filter(book =>
        book.title.toLowerCase().includes(searchLower) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.publisher && book.publisher.toLowerCase().includes(searchLower))
      )
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, 10);
  }

  async getOrCreateBook(bookData: {
    isbn?: string;
    title: string;
    author?: string;
    publisher?: string;
    cover?: string;
  }): Promise<Book> {
    // Check if book already exists by ISBN
    if (bookData.isbn && this.booksByIsbn.has(bookData.isbn)) {
      const book = this.booksByIsbn.get(bookData.isbn)!;
      book.searchCount++;
      book.updatedAt = new Date();
      return book;
    }

    // Check if book exists by title and author
    const existingBook = Array.from(this.books.values()).find(
      b => b.title === bookData.title && b.author === bookData.author
    );
    
    if (existingBook) {
      existingBook.searchCount++;
      existingBook.updatedAt = new Date();
      return existingBook;
    }

    // Create new book
    const id = this.nextBookId++;
    const newBook: Book = {
      id,
      isbn: bookData.isbn || null,
      title: bookData.title,
      author: bookData.author || null,
      publisher: bookData.publisher || null,
      cover: bookData.cover || null,
      searchCount: 1,
      sentenceCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.books.set(id, newBook);
    if (bookData.isbn) {
      this.booksByIsbn.set(bookData.isbn, newBook);
    }

    return newBook;
  }

  async getPopularBooks(limit: number = 10): Promise<BookWithStats[]> {
    const bookStats = new Map<string, {
      book: Partial<Book>;
      sentenceCount: number;
      totalLikes: number;
    }>();

    // 인기 책들의 표지 이미지 URL (알라딘 API에서 가져온 선명한 cover200 URL)
    const bookCovers: Record<string, string> = {
      "노르웨이의 숲": "https://image.aladin.co.kr/product/11561/49/cover200/8937434482_1.jpg",
      "코스모스": "https://image.aladin.co.kr/product/2740/8/cover200/8983711892_2.jpg",
      "어린 왕자": "https://image.aladin.co.kr/product/8630/61/cover200/8937437384_1.jpg",
      "데미안": "https://image.aladin.co.kr/product/194/7/cover200/8937460440_2.jpg",
      "1984": "https://image.aladin.co.kr/product/194/14/cover200/8937460777_2.jpg",
    };

    // Aggregate stats from sentences
    for (const sentence of this.sentences.values()) {
      if (sentence.bookTitle) {
        const key = sentence.bookTitle;
        if (!bookStats.has(key)) {
          bookStats.set(key, {
            book: {
              title: sentence.bookTitle,
              author: sentence.author || null,
              publisher: sentence.publisher || null,
            },
            sentenceCount: 0,
            totalLikes: 0,
          });
        }
        
        const stats = bookStats.get(key)!;
        stats.sentenceCount++;
        stats.totalLikes += sentence.likes;
      }
    }

    // Convert to array and sort by sentence count
    const books = Array.from(bookStats.values())
      .sort((a, b) => b.sentenceCount - a.sentenceCount)
      .slice(0, limit)
      .map(async (stats) => {
        let cover = bookCovers[stats.book.title as string] || null;
        
        // 표지가 없으면 알라딘 API로 검색 시도
        if (!cover && stats.book.title) {
          try {
            const TTBKey = "ttbkiyu001041002";
            const searchUrl = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${TTBKey}&Query=${encodeURIComponent(
              stats.book.title
            )}&QueryType=Title&MaxResults=1&start=1&SearchTarget=Book&output=js&Version=20131101`;
            
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            if (data.item && data.item[0] && data.item[0].cover) {
              cover = data.item[0].cover;
              // 캐시에 저장
              bookCovers[stats.book.title] = cover;
            }
          } catch (error) {
            console.log(`Failed to fetch cover for ${stats.book.title}`);
          }
        }

        return {
          ...stats.book,
          id: 0,
          isbn: null,
          cover,
          searchCount: 0,
          sentenceCount: stats.sentenceCount,
          createdAt: new Date(),
          updatedAt: new Date(),
          totalSentences: stats.sentenceCount,
          totalLikes: stats.totalLikes,
        } as BookWithStats;
      });

    return Promise.all(books);
  }

  async getBookSentences(bookTitle: string): Promise<SentenceWithUser[]> {
    const sentences = Array.from(this.sentences.values())
      .filter(s => s.bookTitle === bookTitle)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return sentences;
  }

  async getAuthorStats(): Promise<Array<{
    author: string;
    sentenceCount: number;
    totalLikes: number;
    books: string[];
  }>> {
    const authorStats = new Map<string, {
      sentenceCount: number;
      totalLikes: number;
      books: Set<string>;
    }>();

    for (const sentence of this.sentences.values()) {
      if (sentence.author) {
        if (!authorStats.has(sentence.author)) {
          authorStats.set(sentence.author, {
            sentenceCount: 0,
            totalLikes: 0,
            books: new Set(),
          });
        }
        
        const stats = authorStats.get(sentence.author)!;
        stats.sentenceCount++;
        stats.totalLikes += sentence.likes;
        if (sentence.bookTitle) {
          stats.books.add(sentence.bookTitle);
        }
      }
    }

    return Array.from(authorStats.entries())
      .map(([author, stats]) => ({
        author,
        sentenceCount: stats.sentenceCount,
        totalLikes: stats.totalLikes,
        books: Array.from(stats.books),
      }))
      .sort((a, b) => b.sentenceCount - a.sentenceCount);
  }

  async getRecentBooks(limit: number = 10): Promise<BookWithStats[]> {
    const recentBooks = new Map<string, Date>();
    
    // Find most recent sentence for each book
    for (const sentence of this.sentences.values()) {
      if (sentence.bookTitle) {
        const existing = recentBooks.get(sentence.bookTitle);
        if (!existing || sentence.createdAt > existing) {
          recentBooks.set(sentence.bookTitle, sentence.createdAt);
        }
      }
    }

    // Sort by recency and get stats
    const sortedBooks = Array.from(recentBooks.entries())
      .sort((a, b) => b[1].getTime() - a[1].getTime())
      .slice(0, limit);

    const result: BookWithStats[] = [];
    for (const [bookTitle] of sortedBooks) {
      const sentences = Array.from(this.sentences.values())
        .filter(s => s.bookTitle === bookTitle);
      
      const totalLikes = sentences.reduce((sum, s) => sum + s.likes, 0);
      const firstSentence = sentences[0];
      
      result.push({
        id: 0,
        isbn: null,
        title: bookTitle,
        author: firstSentence?.author || null,
        publisher: firstSentence?.publisher || null,
        cover: null,
        searchCount: 0,
        sentenceCount: sentences.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalSentences: sentences.length,
        totalLikes,
        recentSentences: sentences.slice(0, 3),
      });
    }

    return result;
  }
}