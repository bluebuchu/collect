import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  Users, 
  Heart, 
  MessageSquare, 
  TrendingUp,
  BookOpen,
  Clock,
  Lock,
  Globe,
  UserPlus,
  UserMinus,
  Book,
  ArrowRight
} from "lucide-react";
import type { CommunityWithStats, SentenceWithUser } from "@shared/schema";

export default function CommunityDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sentenceSort, setSentenceSort] = useState("latest");
  const [likedSentences, setLikedSentences] = useState<Set<number>>(new Set());
  
  // Fetch user's liked sentences
  useEffect(() => {
    if (user) {
      console.log("Fetching liked sentences for user:", user.id);
      // Fetch liked sentences from API
      fetch("/api/user/liked-sentences", {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            console.log("Failed to fetch liked sentences");
            return [];
          }
          return res.json();
        })
        .then((data) => {
          console.log("Liked sentences data:", data);
          if (Array.isArray(data)) {
            setLikedSentences(new Set(data));
          }
        })
        .catch((err) => {
          console.log("Error fetching liked sentences:", err);
        });
    }
  }, [user?.id]);

  // Fetch community details
  const { data: community, isLoading: isLoadingCommunity } = useQuery<CommunityWithStats>({
    queryKey: [`/api/communities/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/communities/${id}`, {
        credentials: "include",
        mode: "cors",
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("비공개 커뮤니티입니다. 가입 후 이용해주세요.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch community sentences
  const { data: sentences, isLoading: isLoadingSentences } = useQuery<SentenceWithUser[]>({
    queryKey: [`/api/communities/${id}/sentences`, sentenceSort],
    queryFn: async () => {
      const params = new URLSearchParams({ sort: sentenceSort });
      const response = await fetch(`/api/communities/${id}/sentences?${params}`, {
        credentials: "include",
        mode: "cors",
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!id && !!community,
  });

  // Join community mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/communities/${id}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}`] });
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

  // Like/Unlike sentence mutation
  const likeMutation = useMutation({
    mutationFn: async (sentenceId: number) => {
      console.log(`Liking sentence ${sentenceId}`);
      const response = await fetch(`/api/sentences/${sentenceId}/like`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error("Like error:", error);
        throw new Error("좋아요 처리 중 오류가 발생했습니다");
      }
      
      return response.json();
    },
    onSuccess: (data, sentenceId) => {
      // Update local state
      setLikedSentences(prev => {
        const newSet = new Set(prev);
        if (data.isLiked) {
          newSet.add(sentenceId);
        } else {
          newSet.delete(sentenceId);
        }
        return newSet;
      });
      
      // Invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/sentences`] });
      
      toast({
        title: data.isLiked ? "좋아요" : "좋아요 취소",
        description: data.message || (data.isLiked ? "문장을 좋아합니다." : "좋아요를 취소했습니다."),
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

  // Leave community mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/communities/${id}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}`] });
      toast({
        title: "성공",
        description: "커뮤니티에서 탈퇴했습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "커뮤니티 탈퇴 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  if (isLoadingCommunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">커뮤니티를 찾을 수 없습니다</h2>
            <Button onClick={() => setLocation("/communities")}>
              커뮤니티 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => setLocation("/communities")}
            variant="outline"
            size="sm"
            className="mb-4 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            커뮤니티 목록
          </Button>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {community.isPublic === 0 && (
                      <Lock className="h-5 w-5 text-gray-500" />
                    )}
                    {community.isPublic === 1 && (
                      <Globe className="h-5 w-5 text-gray-500" />
                    )}
                    <CardTitle className="text-3xl">{community.name}</CardTitle>
                  </div>
                  {community.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      {community.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{community.memberCount} 멤버</span>
                    </div>
                    {community.category && (
                      <Badge variant="secondary">{community.category}</Badge>
                    )}
                    {community.creator && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={community.creator.profileImage || undefined} />
                          <AvatarFallback>
                            {community.creator.nickname?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>by {community.creator.nickname}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {user && !community.isMember && (
                    <Button
                      onClick={() => joinMutation.mutate()}
                      disabled={joinMutation.isPending}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      가입하기
                    </Button>
                  )}
                  {user && community.isMember && community.memberRole !== "owner" && (
                    <Button
                      onClick={() => leaveMutation.mutate()}
                      disabled={leaveMutation.isPending}
                      variant="outline"
                      className="gap-2"
                    >
                      <UserMinus className="h-4 w-4" />
                      탈퇴하기
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Book Club Section */}
        {community.isMember && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Book className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-xl">📚 함께 책읽기</CardTitle>
                </div>
                <Button
                  onClick={() => setLocation(`/communities/${id}/book-clubs`)}
                  className="gap-2"
                >
                  북클럽 보기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                커뮤니티 멤버들과 함께 책을 읽고 감상을 나누세요
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">진행 중 0개</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">예정 0개</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md bg-gray-50 dark:bg-gray-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">문장</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {community.sentenceCount || 0}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gray-50 dark:bg-gray-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">좋아요</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {community.totalLikes || 0}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gray-50 dark:bg-gray-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">댓글</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {community.totalComments || 0}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gray-50 dark:bg-gray-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">활동점수</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {community.activityScore || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sentences */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">커뮤니티 문장</CardTitle>
              <Tabs value={sentenceSort} onValueChange={setSentenceSort}>
                <TabsList>
                  <TabsTrigger value="latest">최신순</TabsTrigger>
                  <TabsTrigger value="likes">인기순</TabsTrigger>
                  <TabsTrigger value="oldest">오래된순</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSentences ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : sentences && sentences.length > 0 ? (
              <div className="space-y-4">
                {sentences.map((sentence) => (
                  <Card key={sentence.id} className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <p className="text-lg font-myeongjo mb-3 leading-relaxed">
                        "{sentence.content}"
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          {sentence.bookTitle && (
                            <span className="font-medium">{sentence.bookTitle}</span>
                          )}
                          {sentence.author && (
                            <span>{sentence.author}</span>
                          )}
                          {sentence.pageNumber && (
                            <span>p.{sentence.pageNumber}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Like button clicked for sentence:", sentence.id);
                              if (!user) {
                                toast({
                                  title: "로그인 필요",
                                  description: "좋아요를 누르려면 로그인이 필요합니다.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              likeMutation.mutate(sentence.id);
                            }}
                            disabled={likeMutation.isPending}
                            className="h-8 px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Heart 
                              className={`h-4 w-4 mr-1 transition-colors ${
                                likedSentences.has(sentence.id) 
                                  ? "fill-red-500 text-red-500" 
                                  : "text-gray-400 hover:text-gray-600"
                              }`} 
                            />
                            <span className="text-sm">{sentence.likes || 0}</span>
                          </Button>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={sentence.user?.profileImage || undefined} />
                              <AvatarFallback>
                                {sentence.user?.nickname?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{sentence.user?.nickname}</span>
                          </div>
                          <span className="text-xs">
                            {new Date(sentence.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>아직 등록된 문장이 없습니다.</p>
                {community.isMember && (
                  <p className="text-sm mt-2">첫 번째 문장을 등록해보세요!</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}