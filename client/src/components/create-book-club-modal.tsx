import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CreateBookClubModalProps {
  communityId: number;
  open: boolean;
  onClose: () => void;
}

export default function CreateBookClubModal({ 
  communityId, 
  open, 
  onClose 
}: CreateBookClubModalProps) {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookCover, setBookCover] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [totalChapters, setTotalChapters] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState("20");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/book-clubs", data);
    },
    onSuccess: () => {
      toast({
        title: "북클럽 생성 완료",
        description: "북클럽이 성공적으로 생성되었습니다!",
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/communities/${communityId}/book-clubs`] 
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "생성 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookTitle || !bookAuthor || !totalPages || !startDate || !endDate) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (startDate >= endDate) {
      toast({
        title: "날짜 오류",
        description: "종료일은 시작일보다 이후여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      communityId,
      bookTitle: bookTitle.trim(),
      bookAuthor: bookAuthor.trim(),
      bookCover: bookCover.trim() || undefined,
      totalPages: parseInt(totalPages),
      totalChapters: totalChapters ? parseInt(totalChapters) : undefined,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      description: description.trim() || undefined,
      maxMembers: parseInt(maxMembers),
    };

    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">새 북클럽 만들기</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Book Information */}
          <div className="space-y-4">
            <div className="text-lg font-semibold">책 정보</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookTitle">책 제목 *</Label>
                <Input
                  id="bookTitle"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="예: 데미안"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bookAuthor">저자 *</Label>
                <Input
                  id="bookAuthor"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="예: 헤르만 헤세"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookCover">책 표지 URL (선택)</Label>
              <Input
                id="bookCover"
                type="url"
                value={bookCover}
                onChange={(e) => setBookCover(e.target.value)}
                placeholder="https://example.com/book-cover.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalPages">총 페이지 수 *</Label>
                <Input
                  id="totalPages"
                  type="number"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  placeholder="예: 280"
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalChapters">총 챕터 수 (선택)</Label>
                <Input
                  id="totalChapters"
                  type="number"
                  value={totalChapters}
                  onChange={(e) => setTotalChapters(e.target.value)}
                  placeholder="예: 12"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <div className="text-lg font-semibold">일정</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>시작일 *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: ko }) : "날짜 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>종료일 *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: ko }) : "날짜 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => date <= (startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <div className="text-lg font-semibold">추가 정보</div>
            
            <div className="space-y-2">
              <Label htmlFor="description">북클럽 소개 (선택)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="북클럽의 목표나 진행 방식 등을 소개해주세요..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">최대 인원</Label>
              <Input
                id="maxMembers"
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                min="2"
                max="100"
              />
            </div>
          </div>

          {/* Preview */}
          {bookTitle && bookAuthor && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-sm font-semibold mb-2">미리보기</div>
              <div className="flex gap-3">
                {bookCover && (
                  <img
                    src={bookCover}
                    alt={bookTitle}
                    className="w-16 h-20 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <div className="font-bold">{bookTitle}</div>
                  <div className="text-sm text-muted-foreground">{bookAuthor}</div>
                  {totalPages && (
                    <div className="text-sm text-muted-foreground">
                      {totalPages}페이지
                      {totalChapters && ` · ${totalChapters}챕터`}
                    </div>
                  )}
                  {startDate && endDate && (
                    <div className="text-sm text-muted-foreground">
                      {format(startDate, "M월 d일")} - {format(endDate, "M월 d일")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "생성 중..." : "북클럽 만들기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}