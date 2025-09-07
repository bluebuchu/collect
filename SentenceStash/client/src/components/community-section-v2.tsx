import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import CommunityCard from "./community-card";
import type { SentenceWithUser } from "@shared/schema";

export default function CommunitySectionV2() {
  const { data: sentences = [], isLoading } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
  });

  // Group sentences by user and calculate stats
  const userStats = sentences.reduce((acc, sentence) => {
    if (!sentence.userId) return acc;
    
    const userId = sentence.userId;
    if (!acc[userId]) {
      acc[userId] = {
        id: userId,
        nickname: sentence.user?.nickname || sentence.legacyNickname || "익명",
        profileImage: sentence.user?.profileImage || null,
        sentenceCount: 0,
        totalLikes: 0,
        sentences: [],
      };
    }
    
    acc[userId].sentenceCount++;
    acc[userId].totalLikes += sentence.likes;
    acc[userId].sentences.push(sentence);
    
    return acc;
  }, {} as Record<number, any>);

  // Convert to array and sort by activity (combination of sentences and likes)
  const topUsers = Object.values(userStats)
    .sort((a, b) => {
      const scoreA = a.sentenceCount * 10 + a.totalLikes;
      const scoreB = b.sentenceCount * 10 + b.totalLikes;
      return scoreB - scoreA;
    })
    .slice(0, 6); // Show top 6 users

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (topUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">
          아직 커뮤니티 활동이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topUsers.map((user) => (
        <CommunityCard
          key={user.id}
          user={user}
          sentences={user.sentences}
        />
      ))}
    </div>
  );
}