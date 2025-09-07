import { BookOpen, Heart, Calendar, TrendingUp, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsWidgetProps {
  totalSentences: number;
  todaySentences: number;
  totalLikes: number;
  bookSentences: number;
  className?: string;
}

export default function StatsWidget({
  totalSentences,
  todaySentences,
  totalLikes,
  bookSentences,
  className
}: StatsWidgetProps) {
  return (
    <Card className={cn("p-4 bg-white/50 dark:bg-gray-800/50 border-0 shadow-sm", className)}>
      <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Pencil className="h-3.5 w-3.5" />
        나의 기록
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
            전체
          </span>
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {totalSentences}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="h-3.5 w-3.5 text-green-500" />
            오늘
          </span>
          <span className="font-semibold text-sm text-green-600 dark:text-green-400">
            {todaySentences}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Heart className="h-3.5 w-3.5 text-red-500" />
            좋아요
          </span>
          <span className="font-semibold text-sm text-red-500 dark:text-red-400">
            {totalLikes}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <BookOpen className="h-3.5 w-3.5 text-blue-500" />
            책
          </span>
          <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
            {bookSentences}
          </span>
        </div>
      </div>
    </Card>
  );
}