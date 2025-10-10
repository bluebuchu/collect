import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import AuthModal from "./auth-modal";

interface CreateCommunityModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCommunityModal({ open, onClose }: CreateCommunityModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    relatedBook: "",
    isPublic: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/communities", data);
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communities/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communities/my"] });
      
      // Force refetch by removing from cache
      queryClient.removeQueries({ queryKey: ["/api/communities/all"] });
      
      toast({
        title: "성공",
        description: "커뮤니티가 생성되었습니다.",
      });
      onClose();
      resetForm();
      
      // 페이지 새로고침으로 확실하게 데이터 갱신
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "커뮤니티 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      relatedBook: "",
      isPublic: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "오류",
        description: "커뮤니티 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      ...formData,
      isPublic: formData.isPublic ? 1 : 0,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>새 커뮤니티 만들기</DialogTitle>
            <DialogDescription>
              관심사를 공유하는 사람들과 함께할 커뮤니티를 만들어보세요.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">커뮤니티 이름 *</Label>
              <Input
                id="name"
                placeholder="예: 무라카미 하루키 팬클럽"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="커뮤니티에 대한 간단한 설명을 작성해주세요"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={createMutation.isPending}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">특정 도서</SelectItem>
                  <SelectItem value="author">작가</SelectItem>
                  <SelectItem value="genre">장르</SelectItem>
                  <SelectItem value="topic">주제</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.category === "book" && (
              <div className="space-y-2">
                <Label htmlFor="relatedBook">관련 도서</Label>
                <Input
                  id="relatedBook"
                  placeholder="도서명을 입력해주세요"
                  value={formData.relatedBook}
                  onChange={(e) => setFormData({ ...formData, relatedBook: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  disabled={createMutation.isPending}
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  공개 커뮤니티
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                {formData.isPublic ? "누구나 가입 가능" : "승인 후 가입"}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createMutation.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                생성하기
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab="login"
        />
      )}
    </>
  );
}