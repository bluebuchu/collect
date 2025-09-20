import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Heart, 
  Calendar, 
  User, 
  Book, 
  Trophy, 
  TrendingUp,
  Filter,
  SortAsc,
  SortDesc,
  Users,
  Plus,
  PenSquare,
  ChevronLeft
} from "lucide-react";
import SentenceDetailModal from "@/components/sentence-detail-modal";
import AddSentenceModal from "@/components/add-sentence-modal";
import YouTubePlayer from "@/components/youtube-player";
import type { SentenceWithUser } from "@shared/schema";

interface CommunityStats {
  topSentences: Array<SentenceWithUser & { likesCount: number }>;
  topContributors: Array<{
    userId: number;
    nickname: string;
    profileImage: string | null;
    totalLikes: number;
    sentenceCount: number;
  }>;
  totalSentences: number;
  totalUsers: number;
}

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "likes">("latest");
  const [filterByAuthor, setFilterByAuthor] = useState("");
  const [filterByBook, setFilterByBook] = useState("");
  const [selectedSentence, setSelectedSentence] = useState<SentenceWithUser | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Fetch community sentences
  const { data: sentences, isLoading: sentencesLoading } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences/community", searchQuery, sortBy, filterByAuthor, filterByBook],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      params.append("sort", sortBy);
      if (filterByAuthor) params.append("author", filterByAuthor);
      if (filterByBook) params.append("book", filterByBook);
      
      return apiRequest("GET", `/api/sentences/community?${params.toString()}`);
    },
  });
  
  // Fetch community statistics
  const { data: stats, isLoading: statsLoading } = useQuery<CommunityStats>({
    queryKey: ["/api/sentences/community/stats"],
    queryFn: async () => {
      return apiRequest("GET", "/api/sentences/community/stats");
    },
  });
  
  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (sentenceId: number) => {
      return apiRequest("POST", `/api/sentences/${sentenceId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/community"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/community/stats"] });
      toast({
        title: "좋아요!",
        description: "문장에 좋아요를 표시했습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "좋아요 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });
  
  // Unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: async (sentenceId: number) => {
      return apiRequest("DELETE", `/api/sentences/${sentenceId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/community"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sentences/community/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "좋아요 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });
  
  const handleLikeToggle = (sentence: SentenceWithUser) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 표시하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    
    if (sentence.isLiked) {
      unlikeMutation.mutate(sentence.id);
    } else {
      likeMutation.mutate(sentence.id);
    }
  };
  
  // Get unique authors and books for filters
  const authors = Array.isArray(sentences) ? [...new Set(sentences.map(s => s.author).filter(Boolean))] : [];
  const books = Array.isArray(sentences) ? [...new Set(sentences.map(s => s.bookTitle).filter(Boolean))] : [];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  홈으로
                </Button>
                <Button
                  onClick={() => setLocation("/communities")}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  커뮤니티 목록
                </Button>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                커뮤니티 문장
              </h1>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2"
            >
              <PenSquare className="h-4 w-4" />
              문장 공유하기
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            다른 사용자들과 함께 소중한 문장을 공유하고 발견하세요
          </p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Left Column - Statistics (2 columns wide) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Sentences - Simplified */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  인기 문장
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {statsLoading ? (
                  <Skeleton className="h-20" />
                ) : stats?.topSentences?.slice(0, 3).map((sentence, index) => (
                  <div 
                    key={sentence.id} 
                    className="p-2 rounded bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setSelectedSentence(sentence)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-500' : 'text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs line-clamp-1">{sentence.content}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Heart className="h-3 w-3 text-red-500" />
                          <span className="text-xs">{sentence.likesCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) || <div className="text-xs text-gray-500">데이터 없음</div>}
              </CardContent>
            </Card>
            
            {/* Top Contributors - Simplified */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  최고 기여자
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {statsLoading ? (
                  <Skeleton className="h-20" />
                ) : stats?.topContributors?.slice(0, 3).map((contributor, index) => (
                  <div key={contributor.userId} className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contributor.profileImage || undefined} />
                      <AvatarFallback className="text-xs">{contributor.nickname[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{contributor.nickname}</div>
                      <div className="text-xs text-gray-500">
                        {contributor.sentenceCount}개
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs px-1">
                      #{index + 1}
                    </Badge>
                  </div>
                )) || <div className="text-xs text-gray-500">데이터 없음</div>}
              </CardContent>
            </Card>
            
            {/* Overall Stats - Simplified */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded bg-blue-50 dark:bg-blue-900/30">
                  <span className="text-xs text-gray-600 dark:text-gray-400">전체</span>
                  <span className="text-xl font-bold text-blue-600">
                    {stats?.totalSentences || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-purple-50 dark:bg-purple-900/30">
                  <span className="text-xs text-gray-600 dark:text-gray-400">사용자</span>
                  <span className="text-xl font-bold text-purple-600">
                    {stats?.totalUsers || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - YouTube Player */}
          <div className="lg:col-span-1">
            <YouTubePlayer />
          </div>
        </div>
        
        {/* Search and Filters */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="문장 내용으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              {/* Sort Options */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[180px] h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      최신순
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      오래된순
                    </div>
                  </SelectItem>
                  <SelectItem value="likes">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      좋아요순
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* Author Filter */}
              <Select value={filterByAuthor || "all"} onValueChange={(value) => setFilterByAuthor(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full md:w-[180px] h-12">
                  <SelectValue placeholder="저자 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 저자</SelectItem>
                  {authors.map(author => (
                    <SelectItem key={author} value={author || "unknown"}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Book Filter */}
              <Select value={filterByBook || "all"} onValueChange={(value) => setFilterByBook(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full md:w-[180px] h-12">
                  <SelectValue placeholder="도서 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 도서</SelectItem>
                  {books.map(book => (
                    <SelectItem key={book} value={book || "unknown"}>
                      {book}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Sentences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sentencesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-24 mb-4" />
                  <Skeleton className="h-4 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : Array.isArray(sentences) && sentences.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">아직 공유된 문장이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">첫 번째로 문장을 공유해보세요!</p>
            </div>
          ) : (
            Array.isArray(sentences) && sentences.map((sentence) => (
              <Card 
                key={sentence.id} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur"
                onClick={() => setSelectedSentence(sentence)}
              >
                <CardContent className="p-6">
                  {/* Sentence Content */}
                  <p className="font-myeongjo text-lg mb-4 line-clamp-4">
                    {sentence.content}
                  </p>
                  
                  {/* Book Info */}
                  {(sentence.bookTitle || sentence.author) && (
                    <div className="flex items-center gap-2 mb-3">
                      <Book className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {sentence.bookTitle && sentence.author ? 
                          `${sentence.bookTitle} - ${sentence.author}` :
                          sentence.bookTitle || sentence.author}
                      </span>
                    </div>
                  )}
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={sentence.user?.profileImage || undefined} />
                        <AvatarFallback>{sentence.user?.nickname[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{sentence.user?.nickname}</span>
                    </div>
                    
                    {/* Like Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1 ${sentence.isLiked ? 'text-red-500' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(sentence);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${sentence.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{sentence.likes || 0}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Sentence Detail Modal */}
        {selectedSentence && (
          <SentenceDetailModal
            sentence={selectedSentence}
            open={!!selectedSentence}
            onClose={() => setSelectedSentence(null)}
          />
        )}
        
        {/* Add Sentence Modal */}
        <AddSentenceModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
        
        {/* Floating Action Button for Mobile */}
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}