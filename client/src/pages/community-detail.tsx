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
  UserMinus
} from "lucide-react";
import type { CommunityWithStats, SentenceWithUser } from "@shared/schema";

export default function CommunityDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sentenceSort, setSentenceSort] = useState("latest");

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
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-gray-400" />
                            <span>{sentence.likes}</span>
                          </div>
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