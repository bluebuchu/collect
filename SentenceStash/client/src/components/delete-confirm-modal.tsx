import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  sentenceId: number | null;
}

export default function DeleteConfirmModal({ open, onClose, sentenceId }: DeleteConfirmModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/sentences/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "삭제 완료",
        description: "문장이 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "문장을 삭제할 권한이 없습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (sentenceId) {
      deleteMutation.mutate(sentenceId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold">문장 삭제</DialogTitle>
            <p className="text-muted-foreground text-sm">정말로 이 문장을 삭제하시겠습니까?</p>
            <p className="text-muted-foreground text-xs">이 작업은 되돌릴 수 없습니다.</p>
          </DialogHeader>
        </div>
        
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            className="flex-1 h-12"
          >
            취소
          </Button>
          <Button 
            onClick={handleDelete}
            variant="destructive"
            className="flex-1 h-12"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "삭제 중..." : "삭제하기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
