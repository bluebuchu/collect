import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import type { SentenceWithUser } from "@shared/schema";

export default function ContributorRankingsImproved() {
  const { data: sentences } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
    queryFn: async () => {
      const response = await fetch("/api/sentences", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch sentences");
      return response.json();
    },
  });

  if (!sentences || sentences.length === 0) return null;

  const contributorStats = sentences.reduce((acc, sentence) => {
    const nickname = sentence.user?.nickname ?? 'Unknown';
    if (!acc[nickname]) {
      acc[nickname] = {
        nickname,
        sentenceCount: 0,
        totalLikes: 0,
      };
    }
    
    acc[nickname].sentenceCount++;
    acc[nickname].totalLikes += sentence.likes;
    
    return acc;
  }, {} as Record<string, {
    nickname: string;
    sentenceCount: number;
    totalLikes: number;
  }>);

  const topContributors = Object.values(contributorStats)
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 5);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return null;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0: return "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800";
      case 1: return "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800";
      case 2: return "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800";
      default: return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        Top Contributors
      </h3>
      
      <div className="space-y-3">
        {topContributors.map((contributor, index) => (
          <div 
            key={contributor.nickname}
            className={`relative p-4 rounded-xl border transition-all hover:shadow-md ${getRankBg(index)}`}
          >
            {/* Rank Badge */}
            {index < 3 && (
              <div className="absolute -top-2 -right-2">
                {getRankIcon(index)}
              </div>
            )}
            
            {/* Main Content */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Rank Number */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                  index === 0 ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50" :
                  index === 1 ? "text-gray-600 bg-gray-100 dark:bg-gray-900/50" :
                  index === 2 ? "text-amber-600 bg-amber-100 dark:bg-amber-900/50" :
                  "text-gray-500 bg-gray-100 dark:bg-gray-800"
                }`}>
                  {index + 1}
                </div>
                
                {/* User Info */}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 font-pretendard">
                    {contributor.nickname}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {contributor.sentenceCount}개 문장
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="text-right">
                <p className="font-semibold text-red-500">
                  ♥ {contributor.totalLikes}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  평균 {(contributor.totalLikes / contributor.sentenceCount).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}