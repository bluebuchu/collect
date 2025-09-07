import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/auth/verify", { inviteCode: code });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "환영합니다!",
        description: "성공적으로 입장했습니다.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "입장 실패",
        description: "잘못된 초대코드입니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast({
        title: "입력 오류",
        description: "초대코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate(inviteCode);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-bold text-center mb-2">문장수집</DialogTitle>
          <p className="text-muted-foreground text-sm">아름다운 문장을 모으는 공간</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">초대코드</Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="초대코드를 입력하세요"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="h-12"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 btn-primary"
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? "확인 중..." : "입장하기"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
