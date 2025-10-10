import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, BookOpen, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SentenceWithUser } from "@shared/schema";

interface CommunityCard {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
}

const communities: CommunityCard[] = [
  {
    id: "popular",
    title: "인기 문장",
    icon: TrendingUp,
    color: "text-orange-500",
    description: "가장 많은 좋아요를 받은 문장들"
  },
  {
    id: "recent",
    title: "최신 문장",
    icon: BookOpen,
    color: "text-blue-500",
    description: "방금 등록된 따끈한 문장들"
  },
  {
    id: "contributors",
    title: "활발한 기여자",
    icon: Users,
    color: "text-green-500",
    description: "많은 문장을 공유하는 분들"
  },
  {
    id: "loved",
    title: "사랑받는 문장",
    icon: Heart,
    color: "text-red-500",
    description: "꾸준히 사랑받는 스테디셀러"
  }
];

export default function CommunitySection() {
  const [currentSentences, setCurrentSentences] = useState<{ [key: string]: SentenceWithUser }>({});
  
  const { data: sentences = [] } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
    enabled: true,
  });

  // Auto-rotate sentences for each community card
  useEffect(() => {
    if (sentences.length === 0) return;

    const updateSentences = () => {
      const newSentences: { [key: string]: SentenceWithUser } = {};
      
      // Popular sentences (by likes)
      const popularSentences = [...sentences].sort((a, b) => b.likes - a.likes);
      if (popularSentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(5, popularSentences.length));
        newSentences.popular = popularSentences[randomIndex];
      }

      // Recent sentences
      const recentSentences = [...sentences].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      if (recentSentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(5, recentSentences.length));
        newSentences.recent = recentSentences[randomIndex];
      }

      // Random for contributors
      if (sentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        newSentences.contributors = sentences[randomIndex];
      }

      // Loved sentences (mix of likes and age)
      const lovedSentences = [...sentences].filter(s => s.likes > 0);
      if (lovedSentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * lovedSentences.length);
        newSentences.loved = lovedSentences[randomIndex];
      }

      setCurrentSentences(newSentences);
    };

    // Initial update
    updateSentences();

    // Update every 5 seconds
    const interval = setInterval(updateSentences, 5000);

    return () => clearInterval(interval);
  }, [sentences]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">커뮤니티</h2>
        <Badge variant="secondary" className="text-xs">
          {sentences.length} 문장
        </Badge>
      </div>

      <div className="space-y-3">
        {communities.map((community) => {
          const Icon = community.icon;
          const sentence = currentSentences[community.id];
          
          return (
            <Card 
              key={community.id} 
              className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-background ${community.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{community.title}</h3>
                      <p className="text-xs text-muted-foreground">{community.description}</p>
                    </div>
                  </div>
                </div>

                {sentence && (
                  <div className="pl-11 space-y-2 animate-fade-in">
                    <p className="text-sm line-clamp-2 text-foreground/80 italic">
                      "{sentence.content}"
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={sentence.user?.profileImage || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {sentence.user?.nickname?.slice(0, 1) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{sentence.user?.nickname || "익명"}</span>
                      </div>
                      {sentence.likes > 0 && (
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{sentence.likes}</span>
                        </div>
                      )}
                    </div>
                    {sentence.bookTitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {sentence.bookTitle}
                      </p>
                    )}
                  </div>
                )}

                {!sentence && sentences.length === 0 && (
                  <div className="pl-11 text-sm text-muted-foreground italic">
                    아직 문장이 없습니다
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}