import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus,
  Compass,
  Users,
  Heart,
  Book,
  TrendingUp,
  ChevronRight,
  Search,
  UserPlus,
  LogOut
} from "lucide-react";
import CreateCommunityModal from "./create-community-modal";
import type { CommunityWithStats, SentenceWithUser } from "@shared/schema";

type ViewMode = "my" | "browse";

export default function CommunitySectionV3() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("my");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);

  // Fetch user's communities
  const { data: myCommunities, isLoading: myCommunitiesLoading } = useQuery<CommunityWithStats[]>({
    queryKey: ["/api/communities/my"],
    queryFn: async () => apiRequest("GET", "/api/communities/my"),
    enabled: !!user && viewMode === "my",
  });

  // Fetch all communities for browsing
  const { data: allCommunities, isLoading: allCommunitiesLoading } = useQuery<CommunityWithStats[]>({
    queryKey: ["/api/communities"],
    queryFn: async () => {
      const result = await apiRequest("GET", "/api/communities");
      console.log("Communities API response:", result);
      return Array.isArray(result) ? result : [];
    },
    enabled: viewMode === "browse",
  });

  // Join community mutation
  const joinMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return apiRequest("POST", `/api/communities/${communityId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communities/my"] });
      toast({
        title: "가입 완료",
        description: "커뮤니티에 가입했습니다!",
      });
    },
    onError: () => {
      toast({
        title: "가입 실패",
        description: "커뮤니티 가입에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Leave community mutation
  const leaveMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return apiRequest("DELETE", `/api/communities/${communityId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communities/my"] });
      toast({
        title: "탈퇴 완료",
        description: "커뮤니티에서 탈퇴했습니다.",
      });
    },
    onError: () => {
      toast({
        title: "탈퇴 실패",
        description: "커뮤니티 탈퇴에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const communities = viewMode === "my" ? myCommunities : allCommunities;
  const isLoading = viewMode === "my" ? myCommunitiesLoading : allCommunitiesLoading;
  
  // Ensure communities is always an array
  const communitiesList = Array.isArray(communities) ? communities : [];
  
  // Debug logging
  console.log("ViewMode:", viewMode);
  console.log("Communities data:", communities);
  console.log("Communities list:", communitiesList);

  const CommunityCard = ({ community }: { community: CommunityWithStats }) => (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur"
      onClick={() => setLocation(`/community/${community.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {community.name}
            </CardTitle>
            {community.category && (
              <Badge variant="secondary" className="mt-1">
                {community.category === "book" ? "📚 책" : 
                 community.category === "author" ? "✍️ 작가" :
                 community.category === "genre" ? "🎭 장르" : "📝 일반"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{community.memberCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Description */}
        {community.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {community.description}
          </p>
        )}
        
        {/* Top Sentences Preview */}
        {community.topSentences && community.topSentences.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">인기 문장</div>
            {community.topSentences.slice(0, 2).map((sentence, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs line-clamp-2 font-myeongjo">{sentence.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {sentence.user?.nickname}
                  </span>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-gray-400" />
                    <span className="text-xs">{sentence.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          {community.creator && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={community.creator.profileImage || undefined} />
                <AvatarFallback className="text-xs">
                  {community.creator.nickname[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {community.creator.nickname}
              </span>
            </div>
          )}
          
          {viewMode === "browse" && !community.isMember && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                joinMutation.mutate(community.id);
              }}
              disabled={joinMutation.isPending}
            >
              <UserPlus className="h-3 w-3 mr-1" />
              가입
            </Button>
          )}
          
          {viewMode === "my" && community.isMember && community.memberRole !== "owner" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                leaveMutation.mutate(community.id);
              }}
              disabled={leaveMutation.isPending}
            >
              <LogOut className="h-3 w-3 mr-1" />
              탈퇴
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header with Action Buttons */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 gap-2"
          >
            <Plus className="h-4 w-4" />
            생성
          </Button>
          <Button
            onClick={() => setViewMode(viewMode === "my" ? "browse" : "my")}
            variant={viewMode === "browse" ? "secondary" : "outline"}
            className="flex-1 gap-2"
          >
            {viewMode === "my" ? (
              <>
                <Compass className="h-4 w-4" />
                둘러보기
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                내 커뮤니티
              </>
            )}
          </Button>
        </div>
        
        {/* View Mode Title */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            {viewMode === "my" ? "내가 가입한 커뮤니티" : "커뮤니티 둘러보기"}
          </h3>
          {viewMode === "browse" && (
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              추천순
            </Badge>
          )}
        </div>
      </div>
      
      {/* Communities List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-0">
                <CardHeader>
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/3 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12" />
                </CardContent>
              </Card>
            ))
          ) : communitiesList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {viewMode === "my" 
                  ? "아직 가입한 커뮤니티가 없습니다"
                  : "생성된 커뮤니티가 없습니다"}
              </p>
              {viewMode === "my" && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => setViewMode("browse")}
                >
                  커뮤니티 둘러보기
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          ) : (
            communitiesList.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Create Community Modal */}
      <CreateCommunityModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}