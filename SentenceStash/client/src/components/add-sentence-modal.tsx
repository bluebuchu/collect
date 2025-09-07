import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { X, Search, Book, Check, ChevronsUpDown, Lock, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Book {
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  cover: string;
}

interface AddSentenceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddSentenceModal({ open, onClose }: AddSentenceModalProps) {
  const [content, setContent] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [isBookSearchOpen, setIsBookSearchOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [isPublic, setIsPublic] = useState("0"); // "0" for private, "1" for community
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Book search query
  const { data: searchResults } = useQuery<{ books: Book[] }>({
    queryKey: ["/api/books/search", bookSearchQuery],
    queryFn: async () => {
      if (!bookSearchQuery.trim()) return { books: [] };
      const response = await fetch(`/api/books/search?query=${encodeURIComponent(bookSearchQuery)}`);
      const data = await response.json();
      // API returns { items: [] }, convert to { books: [] }
      return { books: data.items || [] };
    },
    enabled: !!bookSearchQuery.trim() && bookSearchQuery.length > 1,
  });

  // Get user's communities
  const { data: userCommunities = [] } = useQuery({
    queryKey: ["/api/communities/my"],
    queryFn: async () => {
      const response = await fetch("/api/communities/my", {
        credentials: "include"
      });
      if (!response.ok) {
        console.error("Failed to fetch user communities");
        return [];
      }
      return response.json();
    },
    enabled: isPublic === "1", // Only fetch when community sharing is selected
  });

  const addMutation = useMutation({
    mutationFn: async (data: { content: string; bookTitle?: string; author?: string; publisher?: string; pageNumber?: number; isPublic?: number; communityId?: number }) => {
      return apiRequest("POST", "/api/sentences", data);
    },
    onSuccess: () => {
      toast({
        title: "등록 완료",
        description: "문장이 성공적으로 등록되었습니다!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/community"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/community/stats"] });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({
        title: "등록 실패",
        description: "문장 등록에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setContent("");
    setBookTitle("");
    setAuthor("");
    setPublisher("");
    setPageNumber("");
    setBookSearchQuery("");
    setManualEntry(false);
    setIsPublic("0");
    setSelectedCommunityId(null);
  };

  const handleBookSelect = (book: Book) => {
    setBookTitle(book.title);
    setAuthor(book.author);
    setPublisher(book.publisher || "");
    setBookSearchQuery(book.title);
    setIsBookSearchOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "입력 오류",
        description: "문장은 필수입니다.",
        variant: "destructive",
      });
      return;
    }
    const payload = { 
      content: content.trim(), 
      bookTitle: bookTitle.trim() || undefined,
      author: author.trim() || undefined,
      publisher: publisher.trim() || undefined,
      pageNumber: pageNumber.trim() ? parseInt(pageNumber.trim()) : undefined,
      isPublic: parseInt(isPublic),
      communityId: isPublic === "1" && selectedCommunityId ? selectedCommunityId : undefined,
    };
    console.log("Submitting sentence with payload:", payload);
    addMutation.mutate(payload);
  };

  const handleClose = () => {
    setContent("");
    setBookTitle("");
    setAuthor("");
    setPublisher("");
    setPageNumber("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">새 문장 등록</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="content">문장</Label>
            <Textarea
              id="content"
              rows={4}
              placeholder="소중한 문장을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-myeongjo text-lg resize-none"
              required
            />
          </div>
          
          {/* Book Search Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>책 정보 (선택)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManualEntry(!manualEntry)}
              >
                {manualEntry ? "자동 검색" : "직접 입력"}
              </Button>
            </div>

            {!manualEntry ? (
              <div className="space-y-3">
                <Popover open={isBookSearchOpen} onOpenChange={setIsBookSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isBookSearchOpen}
                      className="w-full justify-between h-12"
                    >
                      {bookTitle ? (
                        <span className="truncate">{bookTitle}</span>
                      ) : (
                        "책 제목으로 검색..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput
                        placeholder="책 제목 검색..."
                        value={bookSearchQuery}
                        onValueChange={setBookSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {bookSearchQuery.length > 1 ? "검색 결과가 없습니다." : "검색어를 입력하세요."}
                        </CommandEmpty>
                        {searchResults?.books && searchResults.books.length > 0 && (
                          <CommandGroup>
                            {searchResults.books.map((book, index) => (
                              <CommandItem
                                key={index}
                                value={book.title}
                                onSelect={() => handleBookSelect(book)}
                                className="flex items-start gap-3 p-3 cursor-pointer"
                              >
                                {book.cover && (
                                  <img
                                    src={book.cover}
                                    alt={book.title}
                                    className="w-8 h-10 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm line-clamp-1">
                                    {book.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {book.author} · {book.publisher}
                                  </div>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    bookTitle === book.title ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {bookTitle && (
                  <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="font-medium">{bookTitle}</div>
                    <div>{author}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookTitle">책 제목</Label>
                    <Input
                      id="bookTitle"
                      type="text"
                      placeholder="책 제목"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">저자</Label>
                    <Input
                      id="author"
                      type="text"
                      placeholder="저자 이름"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="publisher">출판사 (선택)</Label>
                  <Input
                    id="publisher"
                    type="text"
                    placeholder="출판사 이름"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pageNumber">페이지 번호 (선택)</Label>
            <Input
              id="pageNumber"
              type="number"
              placeholder="페이지 번호 (예: 23)"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              className="h-12"
              min="1"
            />
          </div>
          
          {/* Visibility Selection */}
          <div className="space-y-3">
            <Label>공개 범위</Label>
            <RadioGroup value={isPublic} onValueChange={(value) => {
              setIsPublic(value);
              if (value === "0") {
                setSelectedCommunityId(null);
              }
            }}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <RadioGroupItem value="0" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">개인용으로만 저장</div>
                    <div className="text-sm text-muted-foreground">나만 볼 수 있습니다</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <RadioGroupItem value="1" id="community" />
                <Label htmlFor="community" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">커뮤니티에 공유</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCommunityId && userCommunities.find(c => c.id === selectedCommunityId)
                        ? `${userCommunities.find(c => c.id === selectedCommunityId).name}에 공유됩니다`
                        : "다른 사용자들과 함께 공유됩니다"}
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            {/* Community Selection Dropdown */}
            {isPublic === "1" && (
              <div className="ml-8 space-y-2">
                <Label htmlFor="community-select">공유할 커뮤니티 선택</Label>
                <Select
                  value={selectedCommunityId?.toString() || ""}
                  onValueChange={(value) => {
                    if (value === "public") {
                      setSelectedCommunityId(null);
                    } else {
                      setSelectedCommunityId(parseInt(value));
                    }
                  }}
                >
                  <SelectTrigger id="community-select" className="w-full">
                    <SelectValue placeholder="커뮤니티를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span>전체 공개</span>
                      </div>
                    </SelectItem>
                    {userCommunities.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-muted-foreground">내가 가입한 커뮤니티</div>
                        {userCommunities.map(community => (
                          <SelectItem key={community.id} value={community.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{community.name}</span>
                              <span className="text-xs text-muted-foreground">({community.memberCount}명)</span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleClose}
              className="flex-1 h-12"
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 btn-primary"
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? "등록 중..." : "등록하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
