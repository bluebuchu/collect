import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, Bookmark, Edit3, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { SentenceWithUser } from '@shared/schema';

interface ReadingNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentence: SentenceWithUser | null;
}

export default function ReadingNoteModal({ isOpen, onClose, sentence }: ReadingNoteModalProps) {
  const [note, setNote] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sentence) {
      setNote(sentence.privateNote || '');
      setIsBookmarked(sentence.isBookmarked === 1);
    }
  }, [sentence]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sentences/${sentence?.id}/note`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          privateNote: note,
          isBookmarked: isBookmarked ? 1 : 0
        }),
      });
      if (!response.ok) throw new Error('Failed to save note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sentences'] });
      toast({
        title: '저장 완료',
        description: '독서 노트가 저장되었습니다.',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: '저장 실패',
        description: '독서 노트 저장에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  if (!sentence) return null;

  const notePrompts = [
    '이 문장을 읽고 떠오른 생각...',
    '왜 이 문장이 마음에 들었나요?',
    '이 문장이 나에게 주는 의미...',
    '언제 다시 읽고 싶은 문장인가요?',
    '이 문장과 연결되는 나의 경험...'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            독서 노트
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 문장 표시 */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200/50 dark:border-amber-800/30">
            <blockquote className="text-lg font-serif italic">
              "{sentence.content}"
            </blockquote>
            {sentence.bookTitle && (
              <div className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>《{sentence.bookTitle}》</span>
                {sentence.author && <span>· {sentence.author}</span>}
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(sentence.createdAt), 'yyyy년 M월 d일', { locale: ko })} 수집</span>
            </div>
          </div>

          {/* 책갈피 옵션 */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              id="bookmark"
              checked={isBookmarked}
              onChange={(e) => setIsBookmarked(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <Label htmlFor="bookmark" className="flex items-center gap-2 cursor-pointer">
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>나중에 다시 읽고 싶은 문장으로 표시</span>
            </Label>
          </div>

          {/* 개인 노트 입력 */}
          <div className="space-y-2">
            <Label htmlFor="note">나만의 감상 / 메모</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={notePrompts[Math.floor(Math.random() * notePrompts.length)]}
              className="min-h-[150px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              이 메모는 오직 나만 볼 수 있습니다. 자유롭게 작성해보세요.
            </p>
          </div>

          {/* 기존 노트가 있다면 표시 */}
          {sentence.privateNote && note !== sentence.privateNote && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">이전 메모:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {sentence.privateNote}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}