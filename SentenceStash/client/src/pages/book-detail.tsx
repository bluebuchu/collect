import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SentenceCard from "@/components/sentence-card";
import EditSentenceModal from "@/components/edit-sentence-modal";
import DeleteConfirmModal from "@/components/delete-confirm-modal";
import { 
  ArrowLeft,
  BookOpen,
  Heart,
  BookMarked,
  User,
  Calendar
} from "lucide-react";
import type { SentenceWithUser } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function BookDetailPage() {
  const [, params] = useRoute("/books/:bookTitle");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const bookTitle = params?.bookTitle ? decodeURIComponent(params.bookTitle) : "";
  
  const [editingSentence, setEditingSentence] = useState<SentenceWithUser | null>(null);
  const [deletingSentenceId, setDeletingSentenceId] = useState<number | null>(null);

  // Fetch sentences for this book
  const { data: sentences, isLoading } = useQuery({
    queryKey: ["book-sentences", bookTitle],
    queryFn: () => apiRequest(`/api/books/${encodeURIComponent(bookTitle)}/sentences`, { method: "GET" }),
    enabled: !!bookTitle,
  });

  // Calculate stats
  const stats = sentences ? {
    totalSentences: sentences.length,
    totalLikes: sentences.reduce((sum: number, s: SentenceWithUser) => sum + s.likes, 0),
    contributors: new Set(sentences.map((s: SentenceWithUser) => s.user?.nickname)).size,
    author: sentences[0]?.author || "저자 미상",
    publisher: sentences[0]?.publisher || null,
  } : null;

  const handleEdit = (sentence: SentenceWithUser) => {
    if (user?.id === sentence.userId) {
      setEditingSentence(sentence);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingSentenceId(id);
  };

  const handleLike = async (id: number) => {
    // Like functionality is handled in SentenceCard
  };

  if (!bookTitle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">책을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/books")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            책 목록으로
          </Button>

          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{bookTitle}</h1>
              {stats && (
                <>
                  <p className="text-lg text-muted-foreground mb-1">
                    {stats.author}
                  </p>
                  {stats.publisher && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {stats.publisher}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BookMarked className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{stats.totalSentences}</span>
                </div>
                <p className="text-sm text-muted-foreground">문장</p>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-2xl font-bold">{stats.totalLikes}</span>
                </div>
                <p className="text-sm text-muted-foreground">좋아요</p>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold">{stats.contributors}</span>
                </div>
                <p className="text-sm text-muted-foreground">수집가</p>
              </Card>
            </div>
          )}
        </div>

        {/* Sentences */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">수집된 문장들</h2>
          
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : sentences && sentences.length > 0 ? (
            sentences.map((sentence: SentenceWithUser) => (
              <SentenceCard
                key={sentence.id}
                sentence={sentence}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLike={handleLike}
                currentUserId={user?.id}
              />
            ))
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                이 책에서 수집된 문장이 아직 없습니다
              </p>
              <Button
                variant="default"
                className="mt-4"
                onClick={() => setLocation("/")}
              >
                문장 추가하러 가기
              </Button>
            </Card>
          )}
        </div>

        {/* Modals */}
        {editingSentence && (
          <EditSentenceModal
            open={!!editingSentence}
            onClose={() => setEditingSentence(null)}
            sentence={editingSentence}
          />
        )}

        {deletingSentenceId && (
          <DeleteConfirmModal
            open={!!deletingSentenceId}
            onClose={() => setDeletingSentenceId(null)}
            sentenceId={deletingSentenceId}
          />
        )}
      </div>
    </div>
  );
}