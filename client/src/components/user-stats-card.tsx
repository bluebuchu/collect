import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, BookOpen, Heart, Edit3 } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface UserStats {
  totalSentences: number;
  totalLikes: number;
  favoriteBooks: string[];
  joinedDate: string;
  recentActivity: string;
}

interface UserStatsCardProps {
  onEditProfile: () => void;
}

export default function UserStatsCard({ onEditProfile }: UserStatsCardProps) {
  const { user } = useAuth();

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  if (!user) return null;

  const getInitials = (nickname: string) => {
    if (!nickname) return "??";
    return nickname.slice(0, 2).toUpperCase();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">내 프로필</CardTitle>
          <Button variant="outline" size="sm" onClick={onEditProfile}>
            <Edit3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">편집</span>
            <span className="sm:hidden">편집</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 프로필 정보 */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
            <AvatarImage src={user.profileImage || undefined} />
            <AvatarFallback className="text-sm sm:text-lg font-bold">
              {getInitials(user.nickname || user.email || "User")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-bold text-lg sm:text-xl">{user.nickname || "사용자"}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
            {user.bio && (
              <p className="text-xs sm:text-sm mt-1 text-gray-600 dark:text-gray-300 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link href="/my-sentences">
            <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-center mb-1">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                {userStats?.totalSentences || 0}
              </div>
              <div className="text-xs text-muted-foreground">등록한 문장</div>
            </div>
          </Link>
          
          <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-red-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
              {userStats?.totalLikes || 0}
            </div>
            <div className="text-xs text-muted-foreground">받은 좋아요</div>
          </div>
        </div>

        {/* 가입일 */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {userStats?.joinedDate 
              ? `${formatTimeAgo(new Date(userStats.joinedDate))} 가입`
              : '최근 가입'
            }
          </span>
        </div>

        {/* 즐겨읽는 책 */}
        {userStats?.favoriteBooks && userStats.favoriteBooks.length > 0 && (
          <div className="lg:block">
            <div className="text-sm font-medium mb-2">자주 인용한 책</div>
            <div className="flex flex-wrap gap-1">
              {userStats.favoriteBooks.slice(0, 2).map((book, index) => (
                <Badge key={index} variant="secondary" className="text-xs truncate max-w-[120px]">
                  {book}
                </Badge>
              ))}
              {userStats.favoriteBooks.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{userStats.favoriteBooks.length - 2}개
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}