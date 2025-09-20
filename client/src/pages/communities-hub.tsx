import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Users, 
  TrendingUp, 
  Clock,
  MessageSquare,
  Heart,
  Lock,
  Globe,
  Plus,
  ChevronLeft,
  Play,
  Pause,
  SkipForward,
  Calendar,
  User,
  Book,
  Trophy,
  PenSquare,
  SortAsc,
  SortDesc,
  LayoutGrid,
  ListFilter
} from "lucide-react";
import CreateCommunityModal from "@/components/create-community-modal";
import SentenceDetailModal from "@/components/sentence-detail-modal";
import AddSentenceModal from "@/components/add-sentence-modal";
import YouTubePlayer from "@/components/youtube-player";
import type { CommunityWithStats, SentenceWithUser } from "@shared/schema";

type SortOption = "members" | "recent" | "activity";

interface CommunityTabProps {
  community: CommunityWithStats;
  topSentences: SentenceWithUser[];
  onJoin: () => void;
  isMember: boolean;
}

function CommunityCard({ community, topSentences, onJoin, isMember }: CommunityTabProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && topSentences.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentSentenceIndex((prev) => (prev + 1) % topSentences.length);
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, topSentences.length]);

  const currentSentence = topSentences[currentSentenceIndex];

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (community.isPublic === 1 || isMember) {
      setLocation(`/community/${community.id}`);
    }
  };

  return (
    <Card 
      className="h-full border-0 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-200 bg-white dark:bg-gray-800 overflow-hidden cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {community.isPublic === 0 && (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
              <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{community.name}</CardTitle>
            </div>
            {community.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {community.description}
              </p>
            )}
          </div>
          {community.isPublic === 1 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              공개
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {topSentences.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-3">
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500">
                인기 문장
              </span>
            </div>
            
            {currentSentence && (
              <div className="space-y-2">
                <p className="text-sm font-myeongjo line-clamp-3">
                  "{currentSentence.content}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    - {currentSentence.bookTitle || "Unknown"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-gray-400" />
                    <span className="text-xs">{currentSentence.likes}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-1 mt-2 justify-center">
              {topSentences.map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 w-6 rounded-full transition-colors ${
                    index === currentSentenceIndex
                      ? "bg-gray-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-around py-2 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {community.sentenceCount || 0}
            </p>
            <p className="text-xs text-gray-500">문장</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {community.totalLikes || 0}
            </p>
            <p className="text-xs text-gray-500">좋아요</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {community.memberCount}
            </p>
            <p className="text-xs text-gray-500">멤버</p>
          </div>
        </div>
        
        <div className="pt-2">
          {user && !isMember && (
            <Button 
              onClick={onJoin}
              className="w-full"
              size="sm"
            >
              {community.isPublic === 0 ? "가입 신청" : "가입하기"}
            </Button>
          )}
          {!user && community.isPublic === 0 && (
            <div className="text-center text-sm text-gray-500 py-2">
              <Lock className="h-4 w-4 inline-block mr-1" />
              로그인 필요
            </div>
          )}
          {isMember && (
            <div className="text-center text-sm text-green-600 dark:text-green-400 py-2">
              ✓ 가입된 커뮤니티
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

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

const COMMUNITIES_PER_PAGE = 9;

export default function CommunitiesHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState("communities");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("activity");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<SentenceWithUser | null>(null);
  
  // For sentences tab
  const [sentenceSortBy, setSentenceSortBy] = useState<"latest" | "oldest" | "likes">("latest");
  const [filterByAuthor, setFilterByAuthor] = useState("");
  const [filterByBook, setFilterByBook] = useState("");
  
  // Fetch communities with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: communitiesLoading,
  } = useInfiniteQuery<CommunityWithStats[]>({
    queryKey: ["/api/communities/all", sortOption, searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      params.append("sort", sortOption);
      params.append("includeTopSentences", "true");
      params.append("offset", String(pageParam));
      params.append("limit", String(COMMUNITIES_PER_PAGE));
      
      const response = await fetch(`/api/communities/all?${params.toString()}`, {
        credentials: "include",
        mode: "cors",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < COMMUNITIES_PER_PAGE) return undefined;
      return pages.length * COMMUNITIES_PER_PAGE;
    },
    initialPageParam: 0,
    enabled: activeTab === "communities",
  });

  const communities = data?.pages.flat() || [];
  
  // Fetch community sentences
  const { data: sentences, isLoading: sentencesLoading } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences/community", searchQuery, sentenceSortBy, filterByAuthor, filterByBook],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      params.append("sort", sentenceSortBy);
      if (filterByAuthor) params.append("author", filterByAuthor);
      if (filterByBook) params.append("book", filterByBook);
      
      return apiRequest("GET", `/api/sentences/community?${params.toString()}`);
    },
    enabled: activeTab === "sentences",
  });
  
  // Fetch community statistics
  const { data: stats, isLoading: statsLoading } = useQuery<CommunityStats>({
    queryKey: ["/api/sentences/community/stats"],
    queryFn: async () => {
      return apiRequest("GET", "/api/sentences/community/stats");
    },
    enabled: activeTab === "sentences",
  });
  
  // Join community mutation
  const joinMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return apiRequest("POST", `/api/communities/${communityId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities/all"] });
      toast({
        title: "성공",
        description: "커뮤니티에 가입했습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "커뮤니티 가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
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
  
  const handleJoinCommunity = (communityId: number) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "커뮤니티에 가입하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    joinMutation.mutate(communityId);
  };
  
  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (activeTab !== "communities") return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, activeTab]);
  
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
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                홈으로
              </Button>
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                커뮤니티
              </h1>
            </div>
            <div className="flex gap-2">
              {activeTab === "communities" && (
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  커뮤니티 만들기
                </Button>
              )}
              {activeTab === "sentences" && (
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="gap-2"
                >
                  <PenSquare className="h-4 w-4" />
                  문장 공유하기
                </Button>
              )}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            커뮤니티를 탐색하고 소중한 문장을 공유하세요
          </p>
        </div>
        
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full md:w-auto">
            <TabsTrigger value="communities" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              커뮤니티 둘러보기
            </TabsTrigger>
            <TabsTrigger value="sentences" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              커뮤니티 인기 문장
            </TabsTrigger>
          </TabsList>
          
          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            {/* Search and Sort Controls */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="커뮤니티 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  
                  <Tabs value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <TabsList className="grid grid-cols-3 w-full md:w-auto">
                      <TabsTrigger value="activity" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        활성도순
                      </TabsTrigger>
                      <TabsTrigger value="members" className="gap-2">
                        <Users className="h-4 w-4" />
                        가입자순
                      </TabsTrigger>
                      <TabsTrigger value="recent" className="gap-2">
                        <Clock className="h-4 w-4" />
                        최신순
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
            
            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communitiesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-32 mb-4" />
                      <Skeleton className="h-10" />
                    </CardContent>
                  </Card>
                ))
              ) : communities.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">다른 검색어를 시도해보세요.</p>
                </div>
              ) : (
                communities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    topSentences={community.topSentences || []}
                    onJoin={() => handleJoinCommunity(community.id)}
                    isMember={community.isMember || false}
                  />
                ))
              )}
            </div>
            
            {hasNextPage && (
              <div ref={observerTarget} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-gray-500">더 불러오는 중...</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Sentences Tab */}
          <TabsContent value="sentences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Statistics */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
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
              
              {/* YouTube Player */}
              <div className="lg:col-span-1">
                <YouTubePlayer />
              </div>
            </div>
            
            {/* Search and Filters */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
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
                  
                  <Select value={sentenceSortBy} onValueChange={(value: any) => setSentenceSortBy(value)}>
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
                      <p className="font-myeongjo text-lg mb-4 line-clamp-4">
                        {sentence.content}
                      </p>
                      
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
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sentence.user?.profileImage || undefined} />
                            <AvatarFallback>{sentence.user?.nickname[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{sentence.user?.nickname}</span>
                        </div>
                        
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
          </TabsContent>
        </Tabs>
        
        {/* Modals */}
        <CreateCommunityModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
        
        <AddSentenceModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
        
        {selectedSentence && (
          <SentenceDetailModal
            sentence={selectedSentence}
            open={!!selectedSentence}
            onClose={() => setSelectedSentence(null)}
          />
        )}
        
        {/* Mobile FAB */}
        <Button
          onClick={() => activeTab === "communities" ? setIsCreateModalOpen(true) : setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}