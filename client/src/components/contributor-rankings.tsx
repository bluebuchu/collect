import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Award, Medal, BookOpen, Star } from "lucide-react";
import type { SentenceWithUser } from "@shared/schema";

export default function ContributorRankings() {
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
        booksCount: 0,
      };
    }
    
    acc[nickname].sentenceCount++;
    acc[nickname].totalLikes += sentence.likes;
    if (sentence.bookTitle) {
      acc[nickname].booksCount++;
    }
    
    return acc;
  }, {} as Record<string, {
    nickname: string;
    sentenceCount: number;
    totalLikes: number;
    booksCount: number;
  }>);

  const topContributors = Object.values(contributorStats)
    .sort((a, b) => b.sentenceCount - a.sentenceCount)
    .slice(0, 5);

  const topLiked = Object.values(contributorStats)
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 3);

  // Korean title normalization function - removes all whitespace and punctuation
  const normalizeKoreanTitle = (str: string) => {
    // Remove all whitespace, punctuation, and special characters more comprehensively
    const cleaned = str
      .replace(/\s+/g, '') // Remove all whitespace
      .replace(/[^\w가-힣]/g, '') // Keep only word characters and Korean
      .toLowerCase();
    return cleaned.length > 10 ? cleaned.substring(0, 10) : cleaned;
  };

  // 책별 인기도 계산 (한글 띄어쓰기 무시, 10자 제한)
  const bookStats = sentences
    .filter(s => s.bookTitle && s.likes > 0)
    .reduce((acc, sentence) => {
      const normalizedTitle = normalizeKoreanTitle(sentence.bookTitle!);
      const normalizedAuthor = sentence.author ? normalizeKoreanTitle(sentence.author) : '';
      const bookKey = `${normalizedTitle}${normalizedAuthor ? `-${normalizedAuthor}` : ''}`;
      
      if (!acc[bookKey]) {
        acc[bookKey] = {
          bookTitle: sentence.bookTitle!,
          author: sentence.author,
          totalLikes: 0,
          sentenceCount: 0,
        };
      }
      acc[bookKey].totalLikes += sentence.likes;
      acc[bookKey].sentenceCount += 1;
      return acc;
    }, {} as Record<string, { bookTitle: string; author: string | null; totalLikes: number; sentenceCount: number }>);

  const popularBooks = Object.values(bookStats)
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 3);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-4 h-4 text-gray-500" />;
      case 1: return <Medal className="w-4 h-4 text-gray-400" />;
      case 2: return <Award className="w-4 h-4 text-gray-400" />;
      default: return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            참여도 순위
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topContributors.map((contributor, index) => (
            <div key={contributor.nickname} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(index)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{contributor.nickname}</span>
                  <Badge variant="secondary" className="text-xs">
                    {contributor.sentenceCount}개
                  </Badge>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    좋아요 {contributor.totalLikes}개
                  </span>
                  {contributor.booksCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      • 책 출처 {contributor.booksCount}개
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            인기도 순위
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topLiked.map((contributor, index) => (
            <div key={contributor.nickname} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(index)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{contributor.nickname}</span>
                  <Badge variant="destructive" className="text-xs">
                    ❤️ {contributor.totalLikes}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {contributor.sentenceCount}개 문장 • 평균 {(contributor.totalLikes / contributor.sentenceCount).toFixed(1)} 좋아요
                </span>
              </div>
            </div>
          ))}
          {topLiked.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">아직 좋아요를 받은 사용자가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            인기 책 순위
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {popularBooks.map((book, index) => (
            <div key={`${book.bookTitle}-${book.author}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(index)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{book.bookTitle}</span>
                  <Badge variant="outline" className="text-xs">
                    ❤️ {book.totalLikes}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {book.sentenceCount}개 문장
                  </span>
                  {book.author && (
                    <span className="text-xs text-muted-foreground truncate">
                      • {book.author}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {popularBooks.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">책 정보가 있는 문장이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}