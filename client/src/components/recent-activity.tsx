import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, TrendingUp, BookOpen, Heart } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import SentenceDetailModal from "@/components/sentence-detail-modal";
import type { SentenceWithUser } from "@shared/schema";

export default function RecentActivity() {
  const [selectedSentence, setSelectedSentence] = useState<SentenceWithUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const { data: sentences } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
    queryFn: async () => {
      const response = await fetch("/api/sentences", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch sentences");
      return response.json();
    },
  });

  if (!sentences || sentences.length === 0) return null;

  const handleSentenceClick = (sentence: SentenceWithUser) => {
    setSelectedSentence(sentence);
    setShowDetailModal(true);
  };

  const recentSentences = sentences.slice(0, 5);
  const popularSentences = sentences
    .filter(s => s.likes > 0)
    .sort((a, b) => b.likes - a.likes)
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
          topSentence: sentence
        };
      }
      acc[bookKey].totalLikes += sentence.likes;
      acc[bookKey].sentenceCount += 1;
      if (sentence.likes > acc[bookKey].topSentence.likes) {
        acc[bookKey].topSentence = sentence;
      }
      return acc;
    }, {} as Record<string, { bookTitle: string; author: string | null; totalLikes: number; sentenceCount: number; topSentence: SentenceWithUser }>);

  const popularBooks = Object.values(bookStats)
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 3);

  return (
    <div className="grid md:grid-cols-1 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            인기 순위
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sentences" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sentences">문장별</TabsTrigger>
              <TabsTrigger value="books">책별</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sentences" className="space-y-3 mt-4">
              {popularSentences.length > 0 ? (
                popularSentences.map((sentence, index) => (
                  <div 
                    key={sentence.id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleSentenceClick(sentence)}
                  >
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{sentence.user?.nickname || 'Unknown User'}</p>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900 px-3 py-1.5 rounded-full border border-red-300 dark:border-red-700 shadow-sm flex-shrink-0">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">
                            {sentence.likes}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        "{sentence.content}"
                      </p>
                      <p className="text-xs text-primary mt-1 opacity-70">
                        클릭하여 전체 내용 보기
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">아직 좋아요를 받은 문장이 없습니다</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="books" className="space-y-3 mt-4">
              {popularBooks.length > 0 ? (
                popularBooks.map((book, index) => (
                  <div 
                    key={`${book.bookTitle}-${book.author}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 cursor-pointer transition-colors border border-amber-200 dark:border-amber-800"
                    onClick={() => {
                      // 책의 가장 인기 문장을 찾아서 보여줍니다
                      const bookSentences = sentences.filter(s => s.bookTitle === book.bookTitle && s.author === book.author);
                      const topSentence = bookSentences.sort((a, b) => b.likes - a.likes)[0];
                      if (topSentence) {
                        handleSentenceClick(topSentence);
                      }
                    }}
                  >
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 truncate">
                            {book.bookTitle}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900 px-3 py-1.5 rounded-full border border-red-300 dark:border-red-700 shadow-sm flex-shrink-0">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">
                            {book.totalLikes}
                          </span>
                        </div>
                      </div>
                      {book.author && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 mb-1">
                          {book.author}
                        </p>
                      )}
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {book.sentenceCount}개 문장
                      </p>
                      <p className="text-xs text-primary mt-1 opacity-70">
                        클릭하여 인기 문장 보기
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">아직 책 정보가 있는 좋아요 문장이 없습니다</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SentenceDetailModal
        sentence={selectedSentence}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}