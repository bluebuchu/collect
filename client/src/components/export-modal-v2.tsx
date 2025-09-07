import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  Check,
  Info,
  FileCode,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { SentenceWithUser } from "@shared/schema";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExportStats {
  totalSentences: number;
  totalBooks: number;
  totalLikes: number;
  averageLength: number;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
  bookList: {
    title: string;
    count: number;
    author: string | null;
  }[];
}

const formatOptions = [
  {
    id: "txt",
    name: "텍스트",
    icon: FileText,
    description: "아름답게 포맷된 텍스트",
    mobileDesc: "텍스트",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    preview: "【1】 문장 내용...\n    ▸ p.123 | ♥ 5 | 2024년 1월 1일"
  },
  {
    id: "markdown",
    name: "마크다운",
    icon: FileCode,
    description: "노션, 옵시디언 등에서 사용",
    mobileDesc: "마크다운",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    preview: "## 📖 책 제목\n> 문장 내용...\n*❤️ 5 • 📅 2024년 1월 1일*"
  },
  {
    id: "csv",
    name: "CSV",
    icon: FileSpreadsheet,
    description: "엑셀, 구글 시트에서 열기",
    mobileDesc: "엑셀",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    preview: "번호,문장,책 제목,저자,페이지,좋아요,등록일"
  },
  {
    id: "json",
    name: "JSON",
    icon: FileJson,
    description: "프로그래밍 활용 가능",
    mobileDesc: "JSON",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    preview: '{\n  "content": "문장",\n  "book": {...}\n}'
  }
];

export default function ExportModalV2({ open, onOpenChange }: ExportModalProps) {
  const { toast } = useToast();
  const [exportType, setExportType] = useState<"all" | "book" | "date">("all");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedFormat, setSelectedFormat] = useState<string>("txt");
  const [isExporting, setIsExporting] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  // Fetch export statistics
  const { data: stats, isLoading: statsLoading } = useQuery<ExportStats>({
    queryKey: ["/api/export/stats"],
    queryFn: async () => {
      const response = await fetch("/api/export/stats", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: open,
  });

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setExportType("all");
      setSelectedBook("");
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedFormat("txt");
      setShowPreview(false);
    }
  }, [open]);

  // Update preview based on selection
  useEffect(() => {
    if (!stats) return;
    
    let preview = "";
    const format = formatOptions.find(f => f.id === selectedFormat);
    if (format) {
      preview = format.preview;
    }
    
    setPreviewContent(preview);
  }, [selectedFormat, stats]);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let url = `/api/export?format=${selectedFormat}`;
      let filename = `sentences.${selectedFormat}`;
      
      if (exportType === "book" && selectedBook) {
        url += `&type=book&bookTitle=${encodeURIComponent(selectedBook)}`;
        filename = `${selectedBook}_sentences.${selectedFormat}`;
      } else if (exportType === "date" && startDate && endDate) {
        const start = format(startDate, "yyyy-MM-dd");
        const end = format(endDate, "yyyy-MM-dd");
        url += `&type=date&startDate=${start}&endDate=${end}`;
        filename = `sentences_${start}_to_${end}.${selectedFormat}`;
      } else if (exportType === "all") {
        url += "&type=all";
        filename = `all_sentences_${format(new Date(), "yyyy-MM-dd")}.${selectedFormat}`;
      }
      
      const response = await fetch(url, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "내보내기 완료",
        description: `${filename} 파일이 다운로드되었습니다.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "내보내기 실패",
        description: "파일을 다운로드하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = () => {
    if (exportType === "book" && !selectedBook) return false;
    if (exportType === "date" && (!startDate || !endDate)) return false;
    return true;
  };

  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] xs:w-[90vw] sm:w-[85vw] md:w-[80vw] lg:w-[75vw] max-w-4xl max-h-[85vh] xs:max-h-[80vh] sm:max-h-[75vh] md:max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header - More Responsive */}
          <DialogHeader className="relative p-3 xs:p-4 sm:p-5 md:p-6 pb-2 xs:pb-3 sm:pb-4 border-b">
            <DialogTitle className="pr-8 text-base xs:text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-1.5 xs:gap-2 sm:gap-3">
              <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                <Download className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <span className="truncate">문장 내보내기</span>
            </DialogTitle>
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 sm:hidden"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <ScrollArea className="flex-1 px-3 xs:px-4 sm:px-5 md:px-6 py-2 sm:py-3">
            {/* Statistics Card - Compact Layout */}
            {stats && (
              <div className="grid grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4">
                <Card className="p-2 xs:p-2.5 sm:p-3 text-center bg-card/50">
                  <div className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-primary">
                    {stats.totalSentences}
                  </div>
                  <div className="text-[8px] xs:text-[9px] sm:text-[10px] text-muted-foreground">문장</div>
                </Card>
                <Card className="p-2 xs:p-2.5 sm:p-3 text-center bg-card/50">
                  <div className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-primary">
                    {stats.totalBooks}
                  </div>
                  <div className="text-[8px] xs:text-[9px] sm:text-[10px] text-muted-foreground">책</div>
                </Card>
                <Card className="p-2 xs:p-2.5 sm:p-3 text-center bg-card/50">
                  <div className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-primary">
                    {stats.totalLikes}
                  </div>
                  <div className="text-[8px] xs:text-[9px] sm:text-[10px] text-muted-foreground">좋아요</div>
                </Card>
                <Card className="p-2 xs:p-2.5 sm:p-3 text-center bg-card/50">
                  <div className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-primary">
                    {stats.averageLength}
                  </div>
                  <div className="text-[8px] xs:text-[9px] sm:text-[10px] text-muted-foreground">글자</div>
                </Card>
              </div>
            )}

            {/* Export Options */}
            <div className="space-y-3 xs:space-y-3 sm:space-y-4">
              {/* Export Type Selection - Better Mobile Tabs */}
              <div>
                <Label className="text-xs xs:text-sm sm:text-base font-semibold mb-2 xs:mb-2.5 sm:mb-3 block">
                  내보낼 범위 선택
                </Label>
                <Tabs value={exportType} onValueChange={(value) => setExportType(value as typeof exportType)}>
                  <TabsList className="grid w-full grid-cols-3 h-8 xs:h-9 sm:h-10">
                    <TabsTrigger value="all" className="text-[10px] xs:text-xs sm:text-sm gap-0.5 xs:gap-1 sm:gap-2 px-2 xs:px-3">
                      <BookOpen className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                      <span>전체</span>
                    </TabsTrigger>
                    <TabsTrigger value="book" className="text-[10px] xs:text-xs sm:text-sm gap-0.5 xs:gap-1 sm:gap-2 px-2 xs:px-3">
                      <BookOpen className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                      <span>책별</span>
                    </TabsTrigger>
                    <TabsTrigger value="date" className="text-[10px] xs:text-xs sm:text-sm gap-0.5 xs:gap-1 sm:gap-2 px-2 xs:px-3">
                      <Calendar className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                      <span>기간</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-2.5 xs:mt-3 sm:mt-4">
                    <Card className="p-2.5 xs:p-3 sm:p-4">
                      <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
                        <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                          <BookOpen className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs xs:text-sm sm:text-base font-medium">모든 문장 내보내기</div>
                          <div className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
                            등록한 {stats?.totalSentences || 0}개의 모든 문장
                          </div>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="book" className="mt-2.5 xs:mt-3 sm:mt-4">
                    <Card className="p-2.5 xs:p-3 sm:p-4">
                      <Label htmlFor="book-select" className="text-xs xs:text-sm sm:text-base mb-1.5 xs:mb-2 block">
                        책 선택
                      </Label>
                      <ScrollArea className="h-24 xs:h-28 sm:h-32 md:h-40 rounded-md border p-2 xs:p-2.5 sm:p-3">
                        <RadioGroup value={selectedBook} onValueChange={setSelectedBook}>
                          {stats?.bookList.map((book) => (
                            <div key={book.title} className="flex items-start xs:items-center space-x-1.5 xs:space-x-2 mb-2 xs:mb-2.5 sm:mb-3 py-1">
                              <RadioGroupItem 
                                value={book.title} 
                                id={book.title} 
                                className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 mt-0.5 xs:mt-0" 
                              />
                              <Label 
                                htmlFor={book.title} 
                                className="flex-1 cursor-pointer flex flex-col xs:flex-row xs:items-center xs:justify-between text-[10px] xs:text-xs sm:text-sm gap-0.5 xs:gap-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate pr-1">{book.title}</div>
                                  {book.author && (
                                    <div className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground truncate">
                                      {book.author}
                                    </div>
                                  )}
                                </div>
                                <Badge variant="secondary" className="text-[9px] xs:text-[10px] sm:text-xs px-1.5 xs:px-2 h-4 xs:h-5 sm:h-6 shrink-0">
                                  {book.count}개
                                </Badge>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </ScrollArea>
                    </Card>
                  </TabsContent>

                  <TabsContent value="date" className="mt-2.5 xs:mt-3 sm:mt-4">
                    <Card className="p-2.5 xs:p-3 sm:p-4">
                      <Label className="text-xs xs:text-sm sm:text-base mb-1.5 xs:mb-2 block">기간 선택</Label>
                      <div className="flex flex-col gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9 sm:h-10",
                                !startDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-1.5 xs:mr-2 h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                              {startDate ? format(startDate, "yyyy년 MM월 dd일") : "시작일 선택"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
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
                                "w-full justify-start text-left font-normal text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9 sm:h-10",
                                !endDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-1.5 xs:mr-2 h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                              {endDate ? format(endDate, "yyyy년 MM월 dd일") : "종료일 선택"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator className="my-2 xs:my-3" />

              {/* Format Selection - Dropdown Style */}
              <div>
                <Label className="text-xs xs:text-sm sm:text-base font-semibold mb-2 xs:mb-2.5 sm:mb-3 block">
                  파일 형식 선택
                </Label>
                <div className="space-y-3">
                  {/* Dropdown Selector */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-left font-normal h-9 xs:h-10 sm:h-11"
                      >
                        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 min-w-0">
                          {(() => {
                            const selected = formatOptions.find(f => f.id === selectedFormat);
                            if (selected) {
                              const Icon = selected.icon;
                              return (
                                <>
                                  <div className={cn("p-0.5 xs:p-1 rounded shrink-0", selected.bgColor)}>
                                    <Icon className={cn("h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4", selected.color)} />
                                  </div>
                                  <span className="text-xs xs:text-sm sm:text-base font-medium">{selected.name}</span>
                                  <span className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground hidden sm:inline truncate">
                                    - {selected.description}
                                  </span>
                                </>
                              );
                            }
                            return <span className="text-xs xs:text-sm">형식 선택</span>;
                          })()}
                        </div>
                        <ChevronRight className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-muted-foreground rotate-90 shrink-0 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[85vw] xs:w-[320px] sm:w-[380px] max-w-[420px] p-1.5 xs:p-2" align="start">
                      <div className="space-y-0.5 xs:space-y-1">
                        {formatOptions.map((format) => {
                          const Icon = format.icon;
                          const isSelected = selectedFormat === format.id;
                          
                          return (
                            <Button
                              key={format.id}
                              variant={isSelected ? "secondary" : "ghost"}
                              className="w-full justify-start h-auto py-1.5 xs:py-2 sm:py-2.5 px-2 xs:px-3"
                              onClick={() => {
                                setSelectedFormat(format.id);
                                // Close popover by clicking the trigger
                                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                              }}
                            >
                              <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 w-full">
                                <div className={cn("p-1 xs:p-1.5 rounded-lg shrink-0", format.bgColor)}>
                                  <Icon className={cn("h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4", format.color)} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="flex items-center gap-1.5 xs:gap-2">
                                    <span className="text-xs xs:text-sm sm:text-base font-medium">
                                      {format.name}
                                    </span>
                                    {isSelected && (
                                      <Check className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground truncate">
                                    {format.description}
                                  </div>
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Format Info - Inline Text */}
                  <div className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground px-1">
                    {(() => {
                      const selected = formatOptions.find(f => f.id === selectedFormat);
                      if (selected) {
                        return (
                          <>
                            <span className="font-medium">{selected.name}</span> - {selected.description} (.{selected.id})
                          </>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>

              {/* Preview - Collapsible on Mobile */}
              {previewContent && (
                <>
                  <Separator className="my-2 xs:my-3" />
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-xs xs:text-sm sm:text-base font-semibold p-0 h-auto sm:cursor-default"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <span className="flex items-center gap-1.5 xs:gap-2">
                        <Info className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                        미리보기
                      </span>
                      <ChevronRight className={cn(
                        "h-3 w-3 xs:h-4 xs:w-4 transition-transform sm:hidden",
                        showPreview && "rotate-90"
                      )} />
                    </Button>
                    <AnimatePresence>
                      {(showPreview || !isMobile) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="mt-2 xs:mt-2.5 sm:mt-3 p-2 xs:p-2.5 sm:p-3 md:p-4 bg-muted/30">
                            <pre className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-24 xs:max-h-32 sm:max-h-40">
                              {previewContent}
                            </pre>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer - Better Mobile Layout */}
          <div className="p-3 xs:p-4 sm:p-5 md:p-6 pt-2 xs:pt-3 sm:pt-4 border-t bg-muted/30">
            <div className="flex flex-col xs:flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4 sm:justify-between sm:items-center">
              <div className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground text-center xs:text-center sm:text-left order-2 xs:order-2 sm:order-1">
                {exportType === "all" && (
                  <span>전체 <strong>{stats?.totalSentences || 0}</strong>개 문장</span>
                )}
                {exportType === "book" && selectedBook && (
                  <span className="truncate block"><strong>{selectedBook}</strong></span>
                )}
                {exportType === "date" && startDate && endDate && (
                  <span className="text-[9px] xs:text-[10px] sm:text-xs">
                    {format(startDate, "MM/dd")} ~ {format(endDate, "MM/dd")}
                  </span>
                )}
              </div>
              <div className="flex gap-2 xs:gap-2.5 sm:gap-3 order-1 xs:order-1 sm:order-2">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-initial text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9 sm:h-10 px-3 xs:px-4"
                >
                  취소
                </Button>
                <Button 
                  onClick={handleExport} 
                  disabled={!canExport() || isExporting}
                  className="flex-1 sm:flex-initial gap-1 xs:gap-1.5 sm:gap-2 text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9 sm:h-10 px-3 xs:px-4"
                >
                  {isExporting ? (
                    <>
                      <div className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      <span>처리중...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                      <span>다운로드</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}