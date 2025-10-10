import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, BookOpen, Users, Calendar, Trophy, 
  Target, Clock, Edit, UserMinus 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { BookClubWithDetails, SentenceWithUser } from "@shared/schema";

interface BookClubFullDetails extends BookClubWithDetails {
  members: Array<{
    id: number;
    nickname: string;
    profileImage?: string;
    currentPage: number;
    lastReadAt?: string;
    role: string;
  }>;
  milestones: Array<{
    weekNumber: number;
    chapterStart: number;
    chapterEnd: number;
    targetDate: string;
    status: string;
  }>;
}

export default function BookClubDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState<number[]>([0]);

  // Fetch book club details
  const { data: bookClub, isLoading } = useQuery<BookClubFullDetails>({
    queryKey: [`/api/book-clubs/${id}`],
    enabled: !!id,
  });

  // Fetch book club sentences
  const { data: sentences } = useQuery<SentenceWithUser[]>({
    queryKey: [`/api/book-clubs/${id}/sentences`],
    enabled: !!id,
  });

  // Join mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/book-clubs/${id}/join`);
    },
    onSuccess: () => {
      toast({ title: "북클럽에 참여했습니다!" });
      queryClient.invalidateQueries({ queryKey: [`/api/book-clubs/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "참여 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Leave mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/book-clubs/${id}/leave`);
    },
    onSuccess: () => {
      toast({ title: "북클럽에서 나왔습니다" });
      queryClient.invalidateQueries({ queryKey: [`/api/book-clubs/${id}`] });
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (currentPage: number) => {
      return apiRequest("PUT", `/api/book-clubs/${id}/progress`, { currentPage });
    },
    onSuccess: () => {
      toast({ title: "진도를 업데이트했습니다" });
      queryClient.invalidateQueries({ queryKey: [`/api/book-clubs/${id}`] });
      setIsEditingProgress(false);
    },
  });

  const handleProgressUpdate = () => {
    updateProgressMutation.mutate(progressValue[0]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bookClub) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">북클럽을 찾을 수 없습니다</div>
      </div>
    );
  }

  const progressPercentage = bookClub.currentUserProgress 
    ? (bookClub.currentUserProgress / bookClub.totalPages) * 100 
    : 0;

  const averageProgressPercentage = bookClub.averageProgress 
    ? (bookClub.averageProgress / bookClub.totalPages) * 100 
    : 0;

  const currentMilestone = bookClub.milestones?.find(m => m.status === 'active');
  const sortedMembers = bookClub.members?.sort((a, b) => b.currentPage - a.currentPage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/communities/${bookClub.community.id}/book-clubs`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            북클럽 목록으로
          </Button>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Book Cover */}
            {bookClub.bookCover ? (
              <img
                src={bookClub.bookCover}
                alt={bookClub.bookTitle}
                className="w-32 h-40 object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-32 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Book Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{bookClub.bookTitle}</h1>
                  <p className="text-lg text-muted-foreground mb-2">{bookClub.bookAuthor}</p>
                  <Badge className="mb-3">
                    {bookClub.status === 'active' ? '진행 중' : 
                     bookClub.status === 'upcoming' ? '시작 예정' : '완료'}
                  </Badge>
                </div>
                
                {bookClub.isJoined ? (
                  <Button
                    variant="outline"
                    onClick={() => leaveMutation.mutate()}
                    size="sm"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    나가기
                  </Button>
                ) : (
                  <Button onClick={() => joinMutation.mutate()}>
                    참여하기
                  </Button>
                )}
              </div>

              {bookClub.description && (
                <p className="text-muted-foreground mb-4">{bookClub.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(bookClub.startDate).toLocaleDateString('ko-KR')} - 
                    {new Date(bookClub.endDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{bookClub.memberCount}/{bookClub.maxMembers || 50}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{bookClub.totalPages}페이지</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            {bookClub.isJoined && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>나의 진도</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingProgress(!isEditingProgress);
                        setProgressValue([bookClub.currentUserProgress || 0]);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingProgress ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Slider
                          value={progressValue}
                          onValueChange={setProgressValue}
                          min={0}
                          max={bookClub.totalPages}
                          step={1}
                          className="flex-1"
                        />
                        <span className="min-w-[60px] text-right">
                          {progressValue[0]}p
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleProgressUpdate}
                          disabled={updateProgressMutation.isPending}
                        >
                          저장
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setIsEditingProgress(false)}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">내 진도</span>
                          <span className="text-sm font-bold">
                            {bookClub.currentUserProgress || 0} / {bookClub.totalPages}페이지
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">평균 진도</span>
                          <span className="text-sm">
                            {Math.round(bookClub.averageProgress || 0)}페이지
                          </span>
                        </div>
                        <Progress value={averageProgressPercentage} className="h-2" />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Current Milestone */}
            {currentMilestone && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    이번 주 목표
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {currentMilestone.weekNumber}주차
                      </span>
                      <Badge variant="secondary">
                        챕터 {currentMilestone.chapterStart}-{currentMilestone.chapterEnd}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      목표일: {new Date(currentMilestone.targetDate).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Sentences */}
            <Card>
              <CardHeader>
                <CardTitle>공유된 문장</CardTitle>
              </CardHeader>
              <CardContent>
                {sentences && sentences.length > 0 ? (
                  <div className="space-y-4">
                    {sentences.slice(0, 5).map((sentence) => (
                      <div key={sentence.id} className="border-l-2 border-primary pl-4">
                        <p className="text-sm mb-2">{sentence.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{sentence.user?.nickname}</span>
                          {sentence.pageNumber && <span>• p.{sentence.pageNumber}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    아직 공유된 문장이 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Members */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  멤버 진도
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedMembers?.map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {index < 3 && (
                          <span className="text-lg">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profileImage} />
                        <AvatarFallback>{member.nickname[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {member.nickname}
                            {member.role === 'leader' && (
                              <Badge variant="secondary" className="ml-1 text-xs">
                                리더
                              </Badge>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {member.currentPage}p
                          </span>
                        </div>
                        <Progress 
                          value={(member.currentPage / bookClub.totalPages) * 100} 
                          className="h-1 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}