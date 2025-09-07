import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatTimeAgo } from "@/lib/utils";
import { Heart, Trash2, Share, Edit, ShieldX, User, Copy, Sparkles, NotebookPen, Bookmark } from "lucide-react";
import type { SentenceWithUser } from "@shared/schema";

interface SentenceCardProps {
  sentence: SentenceWithUser;
  onDelete: (id: number) => void;
  onEdit: (sentence: SentenceWithUser) => void;
  onAdminDelete: (id: number) => void;
  onNote?: (sentence: SentenceWithUser) => void;
}

export default function SentenceCard({ sentence, onDelete, onEdit, onAdminDelete, onNote }: SentenceCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const isOwnSentence = user?.id === sentence.userId;
  
  // 디버깅 로그
  console.log("SentenceCard Debug:", {
    userId: user?.id,
    sentenceUserId: sentence.userId,
    isOwnSentence,
    hasOnNote: !!onNote,
    sentenceId: sentence.id
  });

  const likeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sentences/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      setIsLiked(true);
      queryClient.invalidateQueries({ queryKey: ["/api/sentences"] });
      setTimeout(() => setIsLiked(false), 500);
      toast({
        title: "공감합니다",
        description: "이 문장에 공감했습니다.",
      });
    },
    onError: (error: Error) => {
      console.error("Like error:", error);
      toast({
        title: "오류",
        description: "공감 처리에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate(sentence.id);
  };

  const handleShare = async () => {
    try {
      let shareText = `"${sentence.content}"`;
      if (sentence.bookTitle) {
        shareText += ` - ${sentence.bookTitle}`;
        if (sentence.author) {
          shareText += ` (${sentence.author})`;
        }
        if (sentence.pageNumber) {
          shareText += ` p.${sentence.pageNumber}`;
        }
      }
      shareText += ` | 등록자: ${sentence.user.nickname}`;
      
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "클립보드 복사",
        description: "문장이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <article className="bg-card rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={sentence.user?.profileImage ?? undefined} />
            <AvatarFallback>
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{sentence.user.nickname}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimeAgo(new Date(sentence.createdAt))}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {isOwnSentence && onNote && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNote(sentence)}
              className="text-muted-foreground hover:text-amber-600 transition-colors h-8 w-8 relative"
              title="독서 노트"
            >
              <NotebookPen className="w-4 h-4" />
              {sentence.privateNote && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </Button>
          )}
          
          {isOwnSentence && sentence.isBookmarked === 1 && (
            <div className="text-amber-500" title="책갈피">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
          )}
          
          {isOwnSentence && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(sentence)}
              className="text-muted-foreground hover:text-gray-600 transition-colors h-8 w-8"
              title="문장 수정"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          
          {isOwnSentence && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(sentence.id)}
              className="text-muted-foreground hover:text-destructive transition-colors h-8 w-8"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAdminDelete(sentence.id)}
            className="text-muted-foreground hover:text-gray-600 transition-colors h-8 w-8"
            title="관리자 삭제"
          >
            <ShieldX className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <blockquote className="font-myeongjo text-lg leading-relaxed text-foreground mb-4 border-l-4 border-border pl-4">
        "{sentence.content}"
      </blockquote>
      
      {(sentence.bookTitle || sentence.author || sentence.pageNumber) && (
        <div className="mb-4 text-sm text-muted-foreground">
          <p className="font-medium">
            {sentence.bookTitle && <span>『{sentence.bookTitle}』</span>}
            {sentence.author && (
              <>
                {sentence.bookTitle && " "}
                <span>{sentence.author}</span>
              </>
            )}
            {sentence.pageNumber && (
              <span className="text-xs ml-1">
                {(sentence.bookTitle || sentence.author) && ", "}
                p.{sentence.pageNumber}
              </span>
            )}
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-2 transition-all ${
            isLiked ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
          }`}
          title="이 문장에 공감하기"
        >
          <Sparkles className={`w-5 h-5 ${isLiked ? "fill-current animate-pulse" : ""}`} />
          <span className="text-sm font-medium">공감 {sentence.likes > 0 && sentence.likes}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="text-muted-foreground hover:text-foreground transition-colors h-8 w-8"
        >
          <Share className="w-4 h-4" />
        </Button>
      </div>
    </article>
  );
}
