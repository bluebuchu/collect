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
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sentence) {
      setNickname(sentence.user?.nickname || sentence.legacyNickname || "");
      setContent(sentence.content);
      setBookTitle(sentence.bookTitle || "");
      setAuthor(sentence.author || "");
      setPassword("");
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
    onSuccess: () => {
      toast({
        title: "수정 완료",
        description: "문장이 성공적으로 수정되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences"] });
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
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Edit form submitted with:", { nickname, content, bookTitle, author, password: "***" });
    
    if (!nickname.trim() || !content.trim() || !password.trim()) {
      toast({
        title: "입력 오류",
        description: "닉네임, 문장 내용, 비밀번호는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      nickname: nickname.trim(),
      content: content.trim(),
      bookTitle: bookTitle.trim() || null,
      author: author.trim() || null,
      password: password.trim(),
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

          <div>
            <Label htmlFor="password">비밀번호 *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="등록할 때 사용한 비밀번호"
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