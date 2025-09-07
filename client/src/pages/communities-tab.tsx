import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CreateCommunityModal from "@/components/create-community-modal";
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
  SkipForward
} from "lucide-react";
import type { CommunityWithStats, SentenceWithUser } from "@shared/schema";

type SortOption = "members" | "recent" | "activity";

interface CommunityTabProps {
  community: CommunityWithStats;
  topSentences: SentenceWithUser[];
  onJoin: () => void;
  onView: () => void;
  isMember: boolean;
}

function CommunityTab({ community, topSentences, onJoin, onView, isMember }: CommunityTabProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && topSentences.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentSentenceIndex((prev) => (prev + 1) % topSentences.length);
      }, 5000); // Change sentence every 5 seconds
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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentSentenceIndex((prev) => (prev + 1) % topSentences.length);
  };

  const currentSentence = topSentences[currentSentenceIndex];

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // Direct navigation for public communities or if user is a member
    if (community.isPublic === 1 || isMember) {
      console.log('Navigating to community:', community.id);
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
        {/* Popular Sentences Auto-play Section - More Simplified */}
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
            
            {/* Progress indicators - Smaller */}
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
        
        {/* Community Stats - Simplified */}
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
        
        {/* Action Buttons - Simplified */}
        <div className="pt-2">
          {/* Show join button only if user is logged in and not a member */}
          {user && !isMember && (
            <Button 
              onClick={onJoin}
              className="w-full"
              size="sm"
            >
              {community.isPublic === 0 ? "가입 신청" : "가입하기"}
            </Button>
          )}
          {/* Show locked state for private communities when not logged in */}
          {!user && community.isPublic === 0 && (
            <div className="text-center text-sm text-gray-500 py-2">
              <Lock className="h-4 w-4 inline-block mr-1" />
              로그인 필요
            </div>
          )}
          {/* Already a member badge */}
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

const COMMUNITIES_PER_PAGE = 9;

export default function CommunitiesTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("activity");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Fetch communities with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: false, // Disable auto refetch to prevent infinite loops
    refetchOnMount: false, // Don't refetch when component mounts if data exists
  });

  // Flatten the pages array to get all communities
  const communities = data?.pages.flat() || [];
  
  // Debug logging
  useEffect(() => {
    console.log("Communities data:", { 
      data, 
      communities, 
      isLoading, 
      hasNextPage,
      pages: data?.pages,
      communitiesLength: communities.length
    });
  }, [data, communities, isLoading, hasNextPage]);
  
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
  
  const handleViewCommunity = (communityId: number) => {
    window.location.href = `/community/${communityId}`;
  };
  
  // Intersection Observer for infinite scroll
  useEffect(() => {
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
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Note: refetch is handled automatically by queryKey changes
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.location.href = "/"}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  홈으로
                </Button>
                <Button
                  onClick={() => window.location.href = "/community"}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  커뮤니티 문장
                </Button>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                커뮤니티 탐색
              </h1>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              커뮤니티 만들기
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            다양한 커뮤니티를 탐색하고 관심있는 커뮤니티에 참여해보세요
          </p>
        </div>
        
        {/* Search and Sort Controls */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
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
              
              {/* Sort Tabs */}
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
          {isLoading ? (
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
              <CommunityTab
                key={community.id}
                community={community}
                topSentences={community.topSentences || []}
                onJoin={() => handleJoinCommunity(community.id)}
                onView={() => handleViewCommunity(community.id)}
                isMember={community.isMember || false}
              />
            ))
          )}
        </div>
        
        {/* Infinite scroll trigger */}
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
        
        {/* Create Community Modal */}
        <CreateCommunityModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
        
        {/* Floating Action Button for Mobile */}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}