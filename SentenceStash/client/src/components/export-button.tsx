import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, X } from "lucide-react";
import type { SentenceWithUser } from "@shared/schema";

export default function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"all" | "by-book">("all");
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const { toast } = useToast();
  
  const { data: sentences } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
    queryFn: async () => {
      const response = await fetch("/api/sentences", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch sentences");
      return response.json();
    },
  });

  // Korean title normalization function - removes all whitespace and punctuation
  const normalizeKoreanTitle = (str: string) => {
    // Remove all whitespace, punctuation, and special characters more comprehensively
    const cleaned = str
      .replace(/\s+/g, '') // Remove all whitespace
      .replace(/[^\w가-힣]/g, '') // Keep only word characters and Korean
      .toLowerCase();
    return cleaned.length > 10 ? cleaned.substring(0, 10) : cleaned;
  };

  // Group books by normalized Korean titles - combines books with same characters regardless of spacing/punctuation
  const getBookGroups = () => {
    if (!sentences) return [];
    
    const bookGroups: Record<string, { titles: string[], representative: string, priority: number }> = {};
    
    sentences
      .filter(s => s.bookTitle)
      .forEach(sentence => {
        const normalizedTitle = normalizeKoreanTitle(sentence.bookTitle!);
        const originalTitleLength = sentence.bookTitle!.length;
        
        if (!bookGroups[normalizedTitle]) {
          bookGroups[normalizedTitle] = {
            titles: [],
            representative: sentence.bookTitle!,
            priority: originalTitleLength // Prefer longer titles (with spaces and formatting)
          };
        }
        
        // Update representative if current title is longer (prefers spaced version)
        if (originalTitleLength > bookGroups[normalizedTitle].priority) {
          bookGroups[normalizedTitle].representative = sentence.bookTitle!;
          bookGroups[normalizedTitle].priority = originalTitleLength;
        }
        
        if (!bookGroups[normalizedTitle].titles.includes(sentence.bookTitle!)) {
          bookGroups[normalizedTitle].titles.push(sentence.bookTitle!);
        }
      });
    
    // Return representative titles sorted
    return Object.values(bookGroups)
      .map(group => group.representative)
      .sort();
  };

  const availableBooks = getBookGroups();

  // Get all sentences that belong to the same normalized book group
  const getSentencesForBook = (bookTitle: string) => {
    if (!sentences) return [];
    
    const targetNormalized = normalizeKoreanTitle(bookTitle);
    return sentences.filter(s => 
      s.bookTitle && normalizeKoreanTitle(s.bookTitle) === targetNormalized
    );
  };

  const handleBookSelection = (bookTitle: string, checked: boolean) => {
    if (checked) {
      setSelectedBooks(prev => [...prev, bookTitle]);
    } else {
      setSelectedBooks(prev => prev.filter(book => book !== bookTitle));
    }
  };

  const handleSelectAllBooks = () => {
    setSelectedBooks(availableBooks);
  };

  const handleDeselectAllBooks = () => {
    setSelectedBooks([]);
  };

  const getFilteredSentences = () => {
    if (!sentences) return [];
    
    if (exportFormat === "all") {
      return sentences;
    } else {
      return sentences.filter(sentence => {
        if (!sentence.bookTitle) return false;
        
        // Check if sentence's book title matches any selected book (using normalization)
        const sentenceNormalized = normalizeKoreanTitle(sentence.bookTitle);
        return selectedBooks.some(selectedBook => {
          const selectedNormalized = normalizeKoreanTitle(selectedBook);
          return sentenceNormalized === selectedNormalized;
        });
      });
    }
  };

  const formatSentenceText = (sentence: SentenceWithUser, index: number) => {
    let text = `${index + 1}. "${sentence.content}"`;
    
    if (sentence.bookTitle) {
      text += `\n   출처: ${sentence.bookTitle}`;
      if (sentence.author) {
        text += ` - ${sentence.author}`;
      }
      if (includePageNumbers && sentence.pageNumber) {
        text += ` (${sentence.pageNumber}페이지)`;
      }
    }
    
    text += `\n   등록자: ${sentence.user.nickname}`;
    text += `\n   좋아요: ${sentence.likes}`;
    text += `\n   등록일: ${new Date(sentence.createdAt).toLocaleDateString('ko-KR')}`;
    text += "\n";
    
    return text;
  };

  const handleExport = () => {
    const filteredSentences = getFilteredSentences();
    
    if (filteredSentences.length === 0) {
      toast({
        title: "내보내기 실패",
        description: "내보낼 문장이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    let exportContent = "";
    let filename = "";

    if (exportFormat === "by-book" && selectedBooks.length > 0) {
      // Export by book with separate sections using Korean title normalization
      selectedBooks.forEach(bookTitle => {
        const bookSentences = getSentencesForBook(bookTitle).filter(s => 
          filteredSentences.includes(s)
        );
        if (bookSentences.length > 0) {
          const uniqueTitles = Array.from(new Set(bookSentences.map(s => s.bookTitle)));
          const displayTitle = bookSentences[0].bookTitle || bookTitle;
          
          exportContent += `\n${'='.repeat(60)}\n`;
          exportContent += `📖 ${displayTitle}\n`;
          const author = bookSentences[0].author;
          if (author) {
            exportContent += `✍️ ${author}\n`;
          }
          exportContent += `문장 수: ${bookSentences.length}개\n`;
          
          // Add note if multiple title variations were merged
          if (uniqueTitles.length > 1) {
            exportContent += `📝 통합된 제목 변형: ${uniqueTitles.join(', ')}\n`;
          }
          
          exportContent += `${'='.repeat(60)}\n\n`;
          
          // Sort by page number if available
          const sortedSentences = bookSentences.sort((a, b) => {
            if (a.pageNumber && b.pageNumber) {
              return a.pageNumber - b.pageNumber;
            }
            if (a.pageNumber && !b.pageNumber) return -1;
            if (!a.pageNumber && b.pageNumber) return 1;
            return 0;
          });
          
          sortedSentences.forEach((sentence, index) => {
            exportContent += formatSentenceText(sentence, index);
            exportContent += "\n";
          });
          exportContent += "\n";
        }
      });
      
      const header = `문장수집 - 책별 내보내기\n생성일: ${new Date().toLocaleDateString('ko-KR')}\n선택된 책: ${selectedBooks.length}권\n총 ${filteredSentences.length}개 문장\n`;
      exportContent = header + exportContent;
      filename = `문장수집_책별_${new Date().toISOString().split('T')[0]}.txt`;
    } else {
      // Export all sentences in one list
      const exportData = filteredSentences.map((sentence, index) => 
        formatSentenceText(sentence, index)
      ).join("\n");
      
      const header = `문장수집 내보내기\n생성일: ${new Date().toLocaleDateString('ko-KR')}\n총 ${filteredSentences.length}개 문장\n\n${'='.repeat(50)}\n\n`;
      exportContent = header + exportData;
      filename = `문장수집_${new Date().toISOString().split('T')[0]}.txt`;
    }

    const blob = new Blob([exportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "내보내기 완료",
      description: `${filteredSentences.length}개 문장이 텍스트 파일로 저장되었습니다.`,
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!sentences || sentences.length === 0}
        >
          <Download className="w-4 h-4" />
          내보내기
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">문장 내보내기 설정</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">내보내기 형식</label>
            <Select value={exportFormat} onValueChange={(value: "all" | "by-book") => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 문장 (하나의 목록)</SelectItem>
                <SelectItem value="by-book">책별로 분류해서 내보내기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Book Selection (only when by-book format is selected) */}
          {exportFormat === "by-book" && availableBooks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">내보낼 책 선택</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllBooks}
                    className="text-xs"
                  >
                    전체 선택
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAllBooks}
                    className="text-xs"
                  >
                    전체 해제
                  </Button>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                {availableBooks.map(bookTitle => {
                  const bookSentences = getSentencesForBook(bookTitle);
                  const uniqueTitles = Array.from(new Set(bookSentences.map(s => s.bookTitle)));
                  return (
                    <div key={bookTitle} className="flex items-center space-x-2">
                      <Checkbox
                        id={bookTitle}
                        checked={selectedBooks.includes(bookTitle)}
                        onCheckedChange={(checked) => handleBookSelection(bookTitle, checked as boolean)}
                      />
                      <label
                        htmlFor={bookTitle}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        <div>
                          {bookTitle} ({bookSentences.length}개 문장)
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">추가 옵션</label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-pages"
                checked={includePageNumbers}
                onCheckedChange={(checked) => setIncludePageNumbers(checked as boolean)}
              />
              <label htmlFor="include-pages" className="text-sm cursor-pointer">
                페이지 번호 포함
              </label>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">내보내기 미리보기</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {exportFormat === "all" ? (
                <p>전체 {sentences?.length || 0}개 문장을 하나의 목록으로 내보냅니다.</p>
              ) : (
                <p>
                  선택된 {selectedBooks.length}권의 책에서 총 {getFilteredSentences().length}개 문장을 책별로 분류해서 내보냅니다.
                  {selectedBooks.length > 0 && (
                    <>
                      <br />
                      <span className="font-medium">선택된 책:</span> {selectedBooks.join(", ")}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleExport}
              disabled={exportFormat === "by-book" && selectedBooks.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              내보내기 실행
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}