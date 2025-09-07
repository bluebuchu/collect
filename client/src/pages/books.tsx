import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  BookOpen, 
  TrendingUp, 
  Clock,
  Heart,
  User,
  ArrowLeft,
  BookMarked
} from "lucide-react";
import type { BookWithStats } from "@shared/schema";

interface AuthorStats {
  author: string;
  sentenceCount: number;
  totalLikes: number;
  books: string[];
}

function BookCard({ book, onClick }: { book: BookWithStats; onClick: () => void }) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {book.cover ? (
            <img 
              src={book.cover} 
              alt={book.title}
              className="w-16 h-20 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
            {book.author && (
              <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
            )}
            {book.publisher && (
              <p className="text-xs text-muted-foreground">{book.publisher}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookMarked className="w-4 h-4" />
            <span>{book.totalSentences}개 문장</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{book.totalLikes}개</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AuthorCard({ author }: { author: AuthorStats }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{author.author}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {author.books.length}권의 책
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <BookMarked className="w-4 h-4" />
            <span>{author.sentenceCount}개 문장</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{author.totalLikes}개</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {author.books.slice(0, 3).map((book, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {book}
            </Badge>
          ))}
          {author.books.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{author.books.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BooksPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("popular");

  // Fetch book statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["book-stats"],
    queryFn: () => apiRequest("/api/books/stats", { method: "GET" }),
  });

  const handleBookClick = (bookTitle: string) => {
    setLocation(`/books/${encodeURIComponent(bookTitle)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Button>
          
          <h1 className="text-4xl font-bold mb-4">책 도서관</h1>
          <p className="text-muted-foreground">
            문장이 수집된 책들을 모아보세요
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="책 제목, 저자로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg"
            />
          </div>
        </form>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              인기 책
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              최근 책
            </TabsTrigger>
            <TabsTrigger value="authors" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              저자
            </TabsTrigger>
          </TabsList>

          {/* Popular Books */}
          <TabsContent value="popular" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))
              ) : stats?.popularBooks?.length > 0 ? (
                stats.popularBooks.map((book: BookWithStats, idx: number) => (
                  <BookCard 
                    key={idx} 
                    book={book} 
                    onClick={() => handleBookClick(book.title)}
                  />
                ))
              ) : (
                <p className="text-muted-foreground col-span-3 text-center py-8">
                  아직 등록된 책이 없습니다
                </p>
              )}
            </div>
          </TabsContent>

          {/* Recent Books */}
          <TabsContent value="recent" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))
              ) : stats?.recentBooks?.length > 0 ? (
                stats.recentBooks.map((book: BookWithStats, idx: number) => (
                  <BookCard 
                    key={idx} 
                    book={book} 
                    onClick={() => handleBookClick(book.title)}
                  />
                ))
              ) : (
                <p className="text-muted-foreground col-span-3 text-center py-8">
                  아직 등록된 책이 없습니다
                </p>
              )}
            </div>
          </TabsContent>

          {/* Authors */}
          <TabsContent value="authors" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))
              ) : stats?.topAuthors?.length > 0 ? (
                stats.topAuthors.map((author: AuthorStats, idx: number) => (
                  <AuthorCard key={idx} author={author} />
                ))
              ) : (
                <p className="text-muted-foreground col-span-3 text-center py-8">
                  아직 등록된 저자가 없습니다
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}