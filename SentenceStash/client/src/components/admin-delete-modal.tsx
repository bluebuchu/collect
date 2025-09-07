import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdminDeleteModalProps {
  open: boolean;
  onClose: () => void;
  sentenceId: number | null;
}

export default function AdminDeleteModal({ open, onClose, sentenceId }: AdminDeleteModalProps) {
  const [adminPassword, setAdminPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (data: { adminPassword: string }) => {
      if (!sentenceId) throw new Error("No sentence ID");
      const response = await fetch(`/api/sentences/${sentenceId}/admin`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "삭제에 실패했습니다");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "삭제 완료",
        description: "문장이 성공적으로 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences"] });
      onClose();
      setAdminPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "삭제 실패",
        description: error.message || "관리자 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminPassword.trim()) {
      toast({
        title: "입력 오류",
        description: "관리자 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    deleteMutation.mutate({ adminPassword: adminPassword.trim() });
  };

  const handleClose = () => {
    if (!deleteMutation.isPending) {
      onClose();
      setAdminPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>관리자 삭제</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            관리자 권한으로 이 문장을 삭제하시겠습니까?
          </div>

          <div>
            <Label htmlFor="adminPassword">관리자 비밀번호</Label>
            <Input
              id="adminPassword"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="관리자 비밀번호를 입력하세요"
              disabled={deleteMutation.isPending}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              {deleteMutation.isPending ? "삭제 중..." : "삭제하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}