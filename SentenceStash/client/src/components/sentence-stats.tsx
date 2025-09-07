import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Heart } from "lucide-react";
import type { SentenceWithUser } from "@shared/schema";

export default function SentenceStats() {
  const { data: sentences } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
    queryFn: async () => {
      const response = await fetch("/api/sentences", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch sentences");
      return response.json();
    },
  });

  if (!sentences) return null;

  const totalSentences = sentences.length;
  const totalLikes = sentences.reduce((sum, sentence) => sum + sentence.likes, 0);
  const uniqueContributors = new Set(sentences.map(sentence => sentence.user.nickname)).size;
  
  // Korean title normalization function - removes all whitespace and punctuation
  const normalizeKoreanTitle = (str: string) => {
    // Remove all whitespace, punctuation, and special characters more comprehensively
    const cleaned = str
      .replace(/\s+/g, '') // Remove all whitespace
      .replace(/[^\w가-힣]/g, '') // Keep only word characters and Korean
      .toLowerCase();
    return cleaned.length > 10 ? cleaned.substring(0, 10) : cleaned;
  };

  // Group books by normalized Korean title (10 chars max, no spaces)
  const booksByNormalizedTitle = sentences
    .filter(sentence => sentence.bookTitle)
    .reduce((acc, sentence) => {
      const normalizedTitle = normalizeKoreanTitle(sentence.bookTitle!);
      if (!acc[normalizedTitle]) {
        acc[normalizedTitle] = 0;
      }
      acc[normalizedTitle]++;
      return acc;
    }, {} as Record<string, number>);
  
  const uniqueBookGroups = Object.keys(booksByNormalizedTitle).length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground text-center">통계</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalSentences}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">총 문장</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalLikes}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">총 좋아요</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{uniqueContributors}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">참여자</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{uniqueBookGroups}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">책 출처</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}