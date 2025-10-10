import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, Calendar } from "lucide-react";
import BookClubCard from "@/components/book-club-card";
import CreateBookClubModal from "@/components/create-book-club-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type BookClubWithDetails } from "@shared/schema";

export default function BookClubsList() {
  const { communityId } = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch book clubs
  const { data: bookClubs, isLoading } = useQuery<BookClubWithDetails[]>({
    queryKey: [`/api/communities/${communityId}/book-clubs`],
    enabled: !!communityId,
  });

  // Join book club mutation
  const joinMutation = useMutation({
    mutationFn: async (bookClubId: number) => {
      return apiRequest("POST", `/api/book-clubs/${bookClubId}/join`);
    },
    onSuccess: () => {
      toast({
        title: "참여 완료",
        description: "북클럽에 성공적으로 참여했습니다!",
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/communities/${communityId}/book-clubs`] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "참여 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeClubs = bookClubs?.filter(club => club.status === "active") || [];
  const upcomingClubs = bookClubs?.filter(club => club.status === "upcoming") || [];
  const completedClubs = bookClubs?.filter(club => club.status === "completed") || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">📚 함께 책읽기</h1>
            <p className="text-muted-foreground">
              커뮤니티 멤버들과 함께 책을 읽고 감상을 나누세요
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            북클럽 만들기
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bookClubs?.length || 0}</p>
              <p className="text-sm text-muted-foreground">전체 북클럽</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeClubs.length}</p>
              <p className="text-sm text-muted-foreground">진행 중</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {bookClubs?.reduce((sum, club) => sum + club.memberCount, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">전체 참여자</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Book Clubs */}
      {activeClubs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-green-600">●</span> 진행 중인 북클럽
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeClubs.map(club => (
              <BookClubCard
                key={club.id}
                bookClub={club}
                onJoin={() => joinMutation.mutate(club.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Book Clubs */}
      {upcomingClubs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-blue-600">●</span> 시작 예정
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingClubs.map(club => (
              <BookClubCard
                key={club.id}
                bookClub={club}
                onJoin={() => joinMutation.mutate(club.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Book Clubs */}
      {completedClubs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-gray-600">●</span> 완료된 북클럽
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedClubs.map(club => (
              <BookClubCard
                key={club.id}
                bookClub={club}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {bookClubs?.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">아직 북클럽이 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            첫 번째 북클럽을 만들어보세요!
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            북클럽 만들기
          </Button>
        </div>
      )}

      {/* Create Book Club Modal */}
      {isCreateModalOpen && (
        <CreateBookClubModal
          communityId={parseInt(communityId!)}
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}