import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Clock, Filter, FileText } from "lucide-react";

interface FilterControlsProps {
  sortBy: "newest" | "oldest" | "likes" | "length" | "page-asc" | "page-desc";
  setSortBy: (value: "newest" | "oldest" | "likes" | "length" | "page-asc" | "page-desc") => void;
  showOnlyBooks: boolean;
  setShowOnlyBooks: (value: boolean) => void;
  pageFilter: string;
  setPageFilter: (value: string) => void;
}

export default function FilterControls({
  sortBy,
  setSortBy,
  showOnlyBooks,
  setShowOnlyBooks,
  pageFilter,
  setPageFilter,
}: FilterControlsProps) {

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest": return "최신순";
      case "oldest": return "오래된순";
      case "likes": return "좋아요순";
      case "length": return "글자수순";
      case "page-asc": return "페이지 순서";
      case "page-desc": return "페이지 역순";
      default: return "최신순";
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 border mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">필터 및 정렬</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {/* Sort By */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="oldest">오래된순</SelectItem>
              <SelectItem value="likes">좋아요순</SelectItem>
              <SelectItem value="length">글자수순</SelectItem>
              <SelectItem value="page-asc">페이지 순서</SelectItem>
              <SelectItem value="page-desc">페이지 역순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Books Only Filter */}
        <Button
          variant={showOnlyBooks ? "default" : "outline"}
          size="sm"
          onClick={() => setShowOnlyBooks(!showOnlyBooks)}
          className="h-9 gap-2"
        >
          <BookOpen className="w-4 h-4" />
          책 출처만
        </Button>

        {/* Page Number Search */}
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <Input
            type="number"
            placeholder="페이지 검색"
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="w-24 h-9"
            min="1"
          />
        </div>
      </div>
    </div>
  );
}