import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Calendar, Heart, Book, FileText, TrendingUp, Clock, Hash } from "lucide-react";

import SentenceCard from "@/components/sentence-card";
import EditSentenceModal from "@/components/edit-sentence-modal";
import DeleteConfirmModal from "@/components/delete-confirm-modal";
import AdminDeleteModal from "@/components/admin-delete-modal";

import { useAuth } from "@/hooks/useAuth";
import type { SentenceWithUser } from "@shared/schema";

type SortOption = "newest" | "oldest" | "likes" | "length" | "book" | "page-asc" | "page-desc";
type ViewMode = "grid" | "list" | "timeline" | "books";

export default function MySentences() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBook, setSelectedBook] = useState<string>("all");
  const [editingSentence, setEditingSentence] = useState<SentenceWithUser | null>(null);
  const [deletingSentenceId, setDeletingSentenceId] = useState<number | null>(null);
  const [adminDeletingSentenceId, setAdminDeletingSentenceId] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch user's sentences
  const { data: sentences, isLoading } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences/my", debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch 
        ? `/api/sentences/my?search=${encodeURIComponent(debouncedSearch)}`
        : "/api/sentences/my";
      
      const response = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sentences: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!user,
  });

  // Filter and sort sentences
  const filteredSentences = sentences?.filter(sentence => {
    if (selectedBook !== "all" && sentence.bookTitle !== selectedBook) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "likes": return b.likes - a.likes;
      case "length": return b.content.length - a.content.length;
      case "book": return (a.bookTitle || "").localeCompare(b.bookTitle || "");
      case "page-asc":
        if (a.pageNumber === null && b.pageNumber === null) return 0;
        if (a.pageNumber === null) return 1;
        if (b.pageNumber === null) return -1;
        return a.pageNumber - b.pageNumber;
      case "page-desc":
        if (a.pageNumber === null && b.pageNumber === null) return 0;
        if (a.pageNumber === null) return 1;
        if (b.pageNumber === null) return -1;
        return b.pageNumber - a.pageNumber;
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }) || [];

  // Get unique books for filter
  const availableBooks = Array.from(new Set(
    sentences?.map(s => s.bookTitle).filter(Boolean) || []
  )).sort();

  // Statistics
  const stats = {
    total: sentences?.length || 0,
    totalLikes: sentences?.reduce((sum, s) => sum + s.likes, 0) || 0,
    booksCount: availableBooks.length,
    avgLength: sentences?.length ? Math.round(sentences.reduce((sum, s) => sum + s.content.length, 0) / sentences.length) : 0,
    thisMonth: sentences?.filter(s => 
      new Date(s.createdAt).getMonth() === new Date().getMonth() &&
      new Date(s.createdAt).getFullYear() === new Date().getFullYear()
    ).length || 0,
  };

  // Group sentences by book for books view
  const sentencesByBook = filteredSentences.reduce((acc, sentence) => {
    const book = sentence.bookTitle || "책 정보 없음";
    if (!acc[book]) acc[book] = [];
    acc[book].push(sentence);
    return acc;
  }, {} as Record<string, SentenceWithUser[]>);

  // Group sentences by month for timeline view
  const sentencesByMonth = filteredSentences.reduce((acc, sentence) => {
    const date = new Date(sentence.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(sentence);
    return acc;
  }, {} as Record<string, SentenceWithUser[]>);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">로그인이 필요합니다.</div>;
  }

  const renderSentenceCard = (sentence: SentenceWithUser) => (
    <SentenceCard
      key={sentence.id}
      sentence={sentence}
      onEdit={setEditingSentence}
      onDelete={setDeletingSentenceId}
      onAdminDelete={setAdminDeletingSentenceId}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">내가 등록한 문장</h1>
              <p className="text-muted-foreground text-sm">
                {user.nickname}님이 등록한 {stats.total}개의 문장
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="문장 내용이나 책 제목으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                  <SelectItem value="likes">좋아요순</SelectItem>
                  <SelectItem value="length">길이순</SelectItem>
                  <SelectItem value="book">책 제목순</SelectItem>
                  <SelectItem value="page-asc">페이지 오름차순</SelectItem>
                  <SelectItem value="page-desc">페이지 내림차순</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="책 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 책</SelectItem>
                  {availableBooks.map(book => (
                    <SelectItem key={book} value={book}>{book}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-muted-foreground">총 문장</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{stats.totalLikes}</div>
              <div className="text-xs text-muted-foreground">받은 좋아요</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Book className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{stats.booksCount}</div>
              <div className="text-xs text-muted-foreground">참고 도서</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Hash className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-purple-600">{stats.avgLength}</div>
              <div className="text-xs text-muted-foreground">평균 글자수</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-orange-600">{stats.thisMonth}</div>
              <div className="text-xs text-muted-foreground">이번 달</div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="mb-6">
          <TabsList>
            <TabsTrigger value="list">목록 보기</TabsTrigger>
            <TabsTrigger value="timeline">시간순 보기</TabsTrigger>
            <TabsTrigger value="books">책별 보기</TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 shadow-sm border animate-pulse">
                    <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredSentences.length > 0 ? (
              filteredSentences.map(renderSentenceCard)
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {debouncedSearch ? "검색 결과가 없습니다." : "등록된 문장이 없습니다."}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Timeline View */}
          <TabsContent value="timeline" className="space-y-8">
            {Object.entries(sentencesByMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([monthKey, monthSentences]) => (
                <div key={monthKey}>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">
                      {new Date(monthKey + "-01").toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </h3>
                    <Badge variant="secondary">{monthSentences.length}개</Badge>
                  </div>
                  <div className="space-y-4 ml-8 border-l-2 border-muted pl-6">
                    {monthSentences.map(renderSentenceCard)}
                  </div>
                </div>
              ))}
          </TabsContent>

          {/* Books View */}
          <TabsContent value="books" className="space-y-8">
            {Object.entries(sentencesByBook).map(([bookTitle, bookSentences]) => (
              <Card key={bookTitle}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{bookTitle}</h3>
                    <Badge variant="secondary">{bookSentences.length}개 문장</Badge>
                    <Badge variant="outline">
                      {bookSentences.reduce((sum, s) => sum + s.likes, 0)} 좋아요
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookSentences.map(renderSentenceCard)}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <EditSentenceModal
        sentence={editingSentence}
        open={editingSentence !== null}
        onClose={() => setEditingSentence(null)}
      />

      <DeleteConfirmModal
        open={deletingSentenceId !== null}
        onClose={() => setDeletingSentenceId(null)}
        sentenceId={deletingSentenceId}
      />

      <AdminDeleteModal
        open={adminDeletingSentenceId !== null}
        onClose={() => setAdminDeletingSentenceId(null)}
        sentenceId={adminDeletingSentenceId}
      />
    </div>
  );
}