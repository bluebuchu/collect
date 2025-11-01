import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SentenceWithUser } from "@shared/schema";

interface EditSentenceModalProps {
  sentence: SentenceWithUser | null;
  open: boolean;
  onClose: () => void;
}

export default function EditSentenceModal({ sentence, open, onClose }: EditSentenceModalProps) {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sentence) {
      setNickname(sentence.user?.nickname || sentence.legacyNickname || "");
      setContent(sentence.content);
      setBookTitle(sentence.bookTitle || "");
      setAuthor(sentence.author || "");
    }
  }, [sentence]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!sentence) throw new Error("No sentence to update");
      console.log("Updating sentence:", sentence.id, data);
      const response = await fetch(`/api/sentences/${sentence.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log("Update response:", response.status);
      if (!response.ok) {
        const error = await response.json();
        console.error("Update error:", error);
        throw new Error(error.message || "수정에 실패했습니다");
      }
      const result = await response.json();
      console.log("Update success:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Sentence updated successfully:', data);
      toast({
        title: "수정 완료",
        description: "문장이 성공적으로 수정되었습니다.",
      });
      
      // Invalidate all sentence-related queries to refresh data
      console.log('Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ["/api/sentences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/community"] });
      
      // Also invalidate any query that starts with /api/sentences
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/sentences');
        }
      });
      
      console.log('Queries invalidated, closing modal');
      onClose();
      clearForm();
    },
    onError: (error: Error) => {
      toast({
        title: "수정 실패",
        description: error.message || "문장 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const clearForm = () => {
    setNickname("");
    setContent("");
    setBookTitle("");
    setAuthor("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Edit form submitted with:", { nickname, content, bookTitle, author });
    
    if (!nickname.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "닉네임과 문장 내용은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      nickname: nickname.trim(),
      content: content.trim(),
      bookTitle: bookTitle.trim() || null,
      author: author.trim() || null,
    };
    console.log("Calling updateMutation with:", updateData);
    updateMutation.mutate(updateData);
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose();
      clearForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>문장 수정</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nickname">닉네임 *</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              disabled={updateMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="content">문장 내용 *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공유하고 싶은 문장을 입력하세요"
              className="min-h-[100px]"
              disabled={updateMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="bookTitle">책 제목</Label>
            <Input
              id="bookTitle"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="책 제목 (선택사항)"
              disabled={updateMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="author">저자</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="저자명 (선택사항)"
              disabled={updateMutation.isPending}
            />
          </div>


          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 btn-primary"
            >
              {updateMutation.isPending ? "수정 중..." : "수정하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}