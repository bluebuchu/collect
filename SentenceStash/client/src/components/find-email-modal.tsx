import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface FindEmailModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FindEmailModal({ open, onClose }: FindEmailModalProps) {
  const [nickname, setNickname] = useState("");
  const [foundEmail, setFoundEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFindEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/find-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nickname }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setFoundEmail(data.email);
      toast({
        title: "이메일 찾기 성공",
        description: data.message,
      });
    } catch (error: any) {
      toast({
        title: "이메일 찾기 실패",
        description: error.message || "해당 닉네임의 사용자를 찾을 수 없습니다.",
        variant: "destructive",
      });
      setFoundEmail("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNickname("");
    setFoundEmail("");
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>이메일 찾기</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleFindEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="find-nickname">닉네임</Label>
            <Input
              id="find-nickname"
              type="text"
              placeholder="가입할 때 사용한 닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          {foundEmail && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>찾은 이메일:</strong> {foundEmail}
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "검색 중..." : "이메일 찾기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}