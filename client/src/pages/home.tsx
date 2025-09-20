import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronLeft, ChevronRight, LogOut, BookOpen, Heart, Calendar, Users } from "lucide-react";

import SentenceCard from "@/components/sentence-card";
import AddSentenceModal from "@/components/add-sentence-modal";
import EditSentenceModal from "@/components/edit-sentence-modal";
import DeleteConfirmModal from "@/components/delete-confirm-modal";
import AdminDeleteModal from "@/components/admin-delete-modal";
import FilterControls from "@/components/filter-controls";
import FloatingActionButton from "@/components/floating-action-button";
import ThemeToggle from "@/components/theme-toggle";
import UserProfileModal from "@/components/user-profile-modal";
import GlassmorphismOverlay from "@/components/glassmorphism-overlay";
import ExportModal from "@/components/export-modal-v2";
import YouTubePlayer from "@/components/youtube-player";
import BookCoverCarousel from "@/components/book-cover-carousel";
import StatsWidget from "@/components/stats-widget";
import ReadingNoteModal from "@/components/reading-note-modal";

import { useAuth, useLogout } from "@/hooks/useAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import type { SentenceWithUser } from "@shared/schema";

const SENTENCES_PER_PAGE = 10;

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { user: googleUser, isAuthenticated: isGoogleAuthenticated } = useGoogleAuth();
  const logoutMutation = useLogout();
  const [, setLocation] = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<SentenceWithUser | null>(null);
  const [deletingSentenceId, setDeletingSentenceId] = useState<number | null>(null);
  const [adminDeletingSentenceId, setAdminDeletingSentenceId] = useState<number | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGlassmorphismOpen, setIsGlassmorphismOpen] = useState(false);
  const [noteSentence, setNoteSentence] = useState<SentenceWithUser | null>(null);
  
  // Auto-show daily sentence only on initial login
  useEffect(() => {
    const hasShownToday = sessionStorage.getItem('hasShownDailySentence');
    if ((user || googleUser) && (isAuthenticated || isGoogleAuthenticated) && !hasShownToday) {
      setIsGlassmorphismOpen(true);
      sessionStorage.setItem('hasShownDailySentence', 'true');
    }
  }, []); // Empty dependency array - only runs once on mount
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "likes" | "length" | "page-asc" | "page-desc">("newest");
  const [showOnlyBooks, setShowOnlyBooks] = useState(false);
  const [pageFilter, setPageFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBookFilter, setSelectedBookFilter] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch sentences
  const { data: rawSentences, isLoading: sentencesLoading, error } = useQuery<SentenceWithUser[]>({
    queryKey: [debouncedSearch ? "/api/sentences/search" : "/api/sentences", debouncedSearch],
    queryFn: async ({ queryKey }) => {
      const [baseUrl, search] = queryKey;
      const url = search ? `${baseUrl}?query=${encodeURIComponent(search as string)}` : baseUrl as string;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      return response.json();
    },
    retry: false
  });

  // Apply filters
  const allFilteredSentences = rawSentences?.filter(sentence => {
    if (showOnlyBooks && !sentence.bookTitle) return false;
    if (pageFilter && sentence.pageNumber !== parseInt(pageFilter)) return false;
    if (selectedBookFilter && sentence.bookTitle !== selectedBookFilter) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "likes": return b.likes - a.likes;
      case "length": return a.content.length - b.content.length;
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

  // Pagination
  const totalPages = Math.ceil(allFilteredSentences.length / SENTENCES_PER_PAGE);
  const startIndex = (currentPage - 1) * SENTENCES_PER_PAGE;
  const sentences = allFilteredSentences.slice(startIndex, startIndex + SENTENCES_PER_PAGE);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, showOnlyBooks, pageFilter, debouncedSearch, selectedBookFilter]);

  // Calculate stats
  const totalSentences = allFilteredSentences.length;
  const todaySentences = allFilteredSentences.filter(s => {
    const today = new Date().toDateString();
    return new Date(s.createdAt).toDateString() === today;
  }).length;
  const totalLikes = allFilteredSentences.reduce((sum, s) => sum + s.likes, 0);
  const bookSentences = allFilteredSentences.filter(s => s.bookTitle).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user && !googleUser && !isAuthenticated && !isGoogleAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다</p>
          <button 
            onClick={() => setLocation("/")}
            className="px-4 py-2 bg-black text-white rounded"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Minimal Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            <h1 className="text-2xl font-bold font-display tracking-wide">문장수집가</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setLocation("/communities")}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <Users className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">커뮤니티</span>
              </Button>
              <Button
                onClick={() => setIsExportModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                내보내기
              </Button>
              <ThemeToggle />
              <Button
                onClick={() => logoutMutation.mutate()}
                variant="ghost"
                size="icon"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - 문장 등록 강조 */}
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
            오늘 읽은 문장을 기록하세요
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto text-sm">
            책에서 발견한 인상 깊은 구절, 마음에 와닿은 문장을 수집하고 다시 읽어보세요
          </p>
          
          {/* Primary CTA - 문장 등록 */}
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="lg"
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Plus className="w-6 h-6 mr-2" />
            새 문장 등록하기
          </Button>
          
          {/* Book Cover Carousel */}
          <BookCoverCarousel 
            className="mt-10 max-w-5xl mx-auto"
            onBookSelect={(bookTitle) => {
              setSelectedBookFilter(bookTitle);
              setShowOnlyBooks(true);
            }}
          />
        </div>
      </section>

      {/* Main Content with YouTube Player */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Left Content - Search & Sentences (3 columns) */}
          <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="문장 내용, 책 제목, 저자명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg shadow-md"
              />
            </div>
          </div>
          
          {/* Mobile Stats - Horizontal compact layout */}
          <div className="lg:hidden mb-6">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-around text-xs">
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-gray-100">{totalSentences}</div>
                  <div className="text-gray-500 dark:text-gray-400">전체</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{todaySentences}</div>
                  <div className="text-gray-500 dark:text-gray-400">오늘</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-red-500">{totalLikes}</div>
                  <div className="text-gray-500 dark:text-gray-400">좋아요</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">{bookSentences}</div>
                  <div className="text-gray-500 dark:text-gray-400">책</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow mb-8">
            <FilterControls
              sortBy={sortBy}
              setSortBy={setSortBy}
              showOnlyBooks={showOnlyBooks}
              setShowOnlyBooks={setShowOnlyBooks}
              pageFilter={pageFilter}
              setPageFilter={setPageFilter}
            />
            {selectedBookFilter && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  필터: <strong>{selectedBookFilter}</strong>
                </span>
                <Button
                  onClick={() => {
                    setSelectedBookFilter(null);
                    setShowOnlyBooks(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  ✕ 필터 해제
                </Button>
              </div>
            )}
          </div>

          {/* Sentences List */}
          <div className="space-y-4">
            {/* List Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                내가 기록한 문장들
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {debouncedSearch ? `검색 결과 ${sentences.length}개` : `총 ${totalSentences}개`}
              </span>
            </div>
            
            {/* Sentences */}
            {sentencesLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : sentences.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-16 text-center">
                <p className="text-gray-500 mb-6 text-lg">
                  {debouncedSearch ? "검색 결과가 없습니다." : "아직 등록된 문장이 없습니다."}
                </p>
                {!debouncedSearch && (
                  <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    size="lg"
                    className="bg-black dark:bg-white text-white dark:text-black"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    첫 문장 등록하기
                  </Button>
                )}
              </div>
            ) : (
              <>
                {sentences.map((sentence) => (
                  <div key={sentence.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <SentenceCard
                      sentence={sentence}
                      onEdit={setEditingSentence}
                      onDelete={(id) => setDeletingSentenceId(id)}
                      onAdminDelete={(id) => setAdminDeletingSentenceId(id)}
                      onNote={setNoteSentence}
                    />
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 py-8">
                    <Button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      이전
                    </Button>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                    >
                      다음
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
          
          {/* Right Sidebar - YouTube Player & Stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <YouTubePlayer />
              
              {/* Stats Widget - Desktop only */}
              <div className="hidden lg:block">
                <StatsWidget
                  totalSentences={totalSentences}
                  todaySentences={todaySentences}
                  totalLikes={totalLikes}
                  bookSentences={bookSentences}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Button
          onClick={() => setIsGlassmorphismOpen(true)}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          오늘의 문장
        </Button>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden">
        <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />
      </div>

      {/* Modals */}
      <AddSentenceModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      <EditSentenceModal
        sentence={editingSentence}
        open={!!editingSentence}
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
      
      <UserProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      
      <GlassmorphismOverlay
        isOpen={isGlassmorphismOpen}
        onClose={() => setIsGlassmorphismOpen(false)}
      />
      
      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
      />
      
      <ReadingNoteModal
        isOpen={!!noteSentence}
        onClose={() => setNoteSentence(null)}
        sentence={noteSentence}
      />
    </div>
  );
}