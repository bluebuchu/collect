import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo } from "@/lib/utils";
import { Heart, Share, X, BookOpen, User, Calendar, ThumbsUp } from "lucide-react";
import type { SentenceWithUser } from "@shared/schema";

interface SentenceDetailModalProps {
  sentence: SentenceWithUser | null;
  open: boolean;
  onClose: () => void;
}

export default function SentenceDetailModal({ sentence, open, onClose }: SentenceDetailModalProps) {
  const { toast } = useToast();

  if (!sentence) return null;

  const handleShare = async () => {
    try {
      let shareText = `"${sentence.content}"`;
      if (sentence.bookTitle) {
        shareText += ` - ${sentence.bookTitle}`;
        if (sentence.author) {
          shareText += ` (${sentence.author})`;
        }
      }
      shareText += ` | 공유자: ${sentence.user?.nickname || sentence.legacyNickname || "익명"}`;
      
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">문장 상세보기</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Author Info */}
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{sentence.user?.nickname || sentence.legacyNickname || "익명"}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatTimeAgo(new Date(sentence.createdAt))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            <blockquote className="font-myeongjo text-xl leading-relaxed text-foreground p-6 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl border-l-4 border-primary">
              "{sentence.content}"
            </blockquote>

          </div>

          {/* Book Information */}
          {(sentence.bookTitle || sentence.author) && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-200">출처 정보</span>
              </div>
              <p className="text-amber-900 dark:text-amber-100">
                {sentence.bookTitle && <span className="font-semibold">『{sentence.bookTitle}』</span>}
                {sentence.author && (
                  <>
                    {sentence.bookTitle && <br />}
                    <span className="text-amber-800 dark:text-amber-200">{sentence.author}</span>
                  </>
                )}
                {sentence.pageNumber && (
                  <>
                    {(sentence.bookTitle || sentence.author) && ", "}
                    <span className="text-amber-800 dark:text-amber-200 text-sm">p.{sentence.pageNumber}</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">{sentence.likes}</span>
              <span className="text-sm text-muted-foreground">좋아요</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share className="w-4 h-4" />
              공유하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}