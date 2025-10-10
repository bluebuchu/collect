import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, BookOpen, Clock } from "lucide-react";
import { type BookClubWithDetails } from "@shared/schema";
import { useLocation } from "wouter";

interface BookClubCardProps {
  bookClub: BookClubWithDetails;
  onJoin?: () => void;
  onView?: () => void;
}

export default function BookClubCard({ bookClub, onJoin, onView }: BookClubCardProps) {
  const [, setLocation] = useLocation();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "시작 예정";
      case "active":
        return "진행 중";
      case "completed":
        return "완료";
      default:
        return status;
    }
  };

  const calculateDaysLeft = () => {
    const end = new Date(bookClub.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleCardClick = () => {
    if (onView) {
      onView();
    } else {
      setLocation(`/book-clubs/${bookClub.id}`);
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-1">{bookClub.bookTitle}</CardTitle>
          <Badge className={getStatusColor(bookClub.status)}>
            {getStatusText(bookClub.status)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{bookClub.bookAuthor}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Book cover and info */}
        <div className="flex gap-4">
          {bookClub.bookCover ? (
            <img
              src={bookClub.bookCover}
              alt={bookClub.bookTitle}
              className="w-16 h-20 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{bookClub.memberCount}/{bookClub.maxMembers || 50}명</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(bookClub.startDate).toLocaleDateString('ko-KR')} - 
                {new Date(bookClub.endDate).toLocaleDateString('ko-KR')}
              </span>
            </div>
            
            {bookClub.status === "active" && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{calculateDaysLeft()}일 남음</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {bookClub.status === "active" && bookClub.averageProgress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>평균 진도</span>
              <span>{Math.round((bookClub.averageProgress / bookClub.totalPages) * 100)}%</span>
            </div>
            <Progress value={(bookClub.averageProgress / bookClub.totalPages) * 100} />
          </div>
        )}

        {/* Description */}
        {bookClub.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bookClub.description}
          </p>
        )}

        {/* Actions */}
        <div 
          className="flex gap-2" 
          onClick={(e) => e.stopPropagation()}
        >
          {bookClub.isJoined ? (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={() => setLocation(`/book-clubs/${bookClub.id}`)}
            >
              참여 중
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={onJoin}
              disabled={bookClub.memberCount >= (bookClub.maxMembers || 50)}
            >
              {bookClub.memberCount >= (bookClub.maxMembers || 50) ? "정원 마감" : "참여하기"}
            </Button>
          )}
        </div>

        {/* Creator info */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            개설자: {bookClub.creator.nickname}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}