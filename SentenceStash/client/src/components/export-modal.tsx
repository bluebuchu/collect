import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Calendar as CalendarIcon, FileText, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BookInfo {
  title: string;
  count: number;
}

export default function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const { user } = useAuth();
  const [exportType, setExportType] = useState<"book" | "date">("book");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [fileFormat, setFileFormat] = useState<"csv" | "txt">("csv");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch available books
  const { data: books = [] } = useQuery<BookInfo[]>({
    queryKey: ["export-books"],
    queryFn: () => apiRequest("/api/export/books", { method: "GET" }),
    enabled: open && !!user,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setExportType("book");
      setSelectedBook("");
      setStartDate(undefined);
      setEndDate(undefined);
      setFileFormat("csv");
    }
  }, [open]);

  const handleExport = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      let url = "";
      let filename = "";
      
      if (exportType === "book") {
        if (!selectedBook) {
          alert("책을 선택해주세요.");
          return;
        }
        url = `/api/export/book/${encodeURIComponent(selectedBook)}?format=${fileFormat}`;
        filename = `${selectedBook}_sentences.${fileFormat}`;
      } else {
        if (!startDate || !endDate) {
          alert("날짜 범위를 선택해주세요.");
          return;
        }
        const start = format(startDate, "yyyy-MM-dd");
        const end = format(endDate, "yyyy-MM-dd");
        url = `/api/export/date?startDate=${start}&endDate=${end}&format=${fileFormat}`;
        filename = `sentences_${start}_to_${end}.${fileFormat}`;
      }
      
      // Fetch the file
      const response = await fetch(url, {
        credentials: "include",
        mode: "cors",
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      // Create download link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("내보내기 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            문장 내보내기
          </DialogTitle>
          <DialogDescription>
            저장한 문장들을 CSV 또는 텍스트 파일로 다운로드할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <Label>내보내기 방식</Label>
            <RadioGroup value={exportType} onValueChange={(value) => setExportType(value as "book" | "date")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="book" id="book" />
                <Label htmlFor="book" className="font-normal cursor-pointer">
                  책 목록별 (페이지 번호순 정렬)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="date" />
                <Label htmlFor="date" className="font-normal cursor-pointer">
                  등록 시기별 (날짜 범위 선택)
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Book Selection */}
          {exportType === "book" && (
            <div className="space-y-2">
              <Label htmlFor="book-select">책 선택</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger id="book-select">
                  <SelectValue placeholder="내보낼 책을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.title} value={book.title}>
                      {book.title} ({book.count}개 문장)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Date Range Selection */}
          {exportType === "date" && (
            <div className="space-y-2">
              <Label>날짜 범위</Label>
              <div className="flex gap-2">
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
                      {startDate ? format(startDate, "PPP", { locale: ko }) : "시작 날짜"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
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
                      {endDate ? format(endDate, "PPP", { locale: ko }) : "종료 날짜"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          
          {/* File Format Selection */}
          <div className="space-y-3">
            <Label>파일 형식</Label>
            <RadioGroup value={fileFormat} onValueChange={(value) => setFileFormat(value as "csv" | "txt")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal cursor-pointer flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (엑셀에서 열기 가능)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="txt" id="txt" />
                <Label htmlFor="txt" className="font-normal cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  텍스트 파일 (읽기 편한 형식)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>처리 중...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                다운로드
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}