import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, ChevronLeft, ChevronRight, User, LogOut, Settings } from "lucide-react";

import SentenceCard from "@/components/sentence-card";
import AddSentenceModal from "@/components/add-sentence-modal";
import EditSentenceModal from "@/components/edit-sentence-modal";
import DeleteConfirmModal from "@/components/delete-confirm-modal";
import AdminDeleteModal from "@/components/admin-delete-modal";
import FilterControls from "@/components/filter-controls";
import FloatingActionButton from "@/components/floating-action-button";
import ThemeToggle from "@/components/theme-toggle";
import ExportButton from "@/components/export-button";
import ContributorRankings from "@/components/contributor-rankings";
import RecentActivity from "@/components/recent-activity";
import SentenceStats from "@/components/sentence-stats";
import UserProfileModal from "@/components/user-profile-modal";
import UserStatsCard from "@/components/user-stats-card";
import GlassmorphismOverlay from "@/components/glassmorphism-overlay";

import { useAuth, useLogout } from "@/hooks/useAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { GoogleAuthButton } from "@/components/google-auth-button";
import type { SentenceWithUser } from "@shared/schema";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { user: googleUser, isAuthenticated: isGoogleAuthenticated } = useGoogleAuth();
  const logoutMutation = useLogout();
  
  console.log("Home component - Auth state:", { user, isLoading, isAuthenticated, googleUser, isGoogleAuthenticated });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  // Google 사용자나 기본 사용자 중 하나라도 인증되어 있으면 접근 허용
  if (!user && !googleUser && !isAuthenticated && !isGoogleAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 확인할 수 없습니다.</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="mt-4 px-4 py-2 bg-black text-white rounded"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGlassmorphismOpen, setIsGlassmorphismOpen] = useState(true);
  const [editingSentence, setEditingSentence] = useState<SentenceWithUser | null>(null);
  const [deletingSentenceId, setDeletingSentenceId] = useState<number | null>(null);
  const [adminDeletingSentenceId, setAdminDeletingSentenceId] = useState<number | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Filter states
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "likes" | "length" | "page-asc" | "page-desc">("newest");
  const [showOnlyBooks, setShowOnlyBooks] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "short" | "medium" | "long">("all");
  const [pageFilter, setPageFilter] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const SENTENCES_PER_PAGE = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: rawSentences, isLoading: sentencesLoading, error } = useQuery<SentenceWithUser[]>({
    queryKey: [debouncedSearch ? "/api/sentences/search" : "/api/sentences", debouncedSearch],
    queryFn: async ({ queryKey }) => {
      const [baseUrl, search] = queryKey;
      const url = search ? `${baseUrl}?query=${encodeURIComponent(search as string)}` : baseUrl as string;
      try {
        const response = await fetch(url, { 
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error: ${response.status} - ${errorText}`);
          throw new Error(`Failed to fetch sentences: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched sentences:", data);
        return data;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
    retry: false
  });

  // Apply filters and sorting
  const allFilteredSentences = rawSentences ? rawSentences.filter(sentence => {
    if (showOnlyBooks && !sentence.bookTitle) return false;
    
    if (categoryFilter !== "all") {
      const length = sentence.content.length;
      if (categoryFilter === "short" && length > 50) return false;
      if (categoryFilter === "medium" && (length <= 50 || length > 150)) return false;
      if (categoryFilter === "long" && length <= 150) return false;
    }
    
    // Page filter
    if (pageFilter && sentence.pageNumber !== parseInt(pageFilter)) return false;
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "likes": return b.likes - a.likes;
      case "length": return a.content.length - b.content.length;
      case "page-asc":
        // Sort by page number ascending, nulls last
        if (a.pageNumber === null && b.pageNumber === null) return 0;
        if (a.pageNumber === null) return 1;
        if (b.pageNumber === null) return -1;
        return a.pageNumber - b.pageNumber;
      case "page-desc":
        // Sort by page number descending, nulls last
        if (a.pageNumber === null && b.pageNumber === null) return 0;
        if (a.pageNumber === null) return 1;
        if (b.pageNumber === null) return -1;
        return b.pageNumber - a.pageNumber;
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }) : [];

  // Apply pagination
  const totalPages = Math.ceil(allFilteredSentences.length / SENTENCES_PER_PAGE);
  const startIndex = (currentPage - 1) * SENTENCES_PER_PAGE;
  const endIndex = startIndex + SENTENCES_PER_PAGE;
  const sentences = allFilteredSentences.slice(startIndex, endIndex);
  
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, showOnlyBooks, categoryFilter, pageFilter, debouncedSearch]);

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleEdit = (sentence: SentenceWithUser) => {
    setEditingSentence(sentence);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Top Row - Title and Action Buttons */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">문장수집</h1>
            
            <div className="flex items-center gap-1 md:gap-2">
              <div className="hidden sm:flex items-center gap-1 md:gap-2">
                <Button
                  onClick={() => setIsGlassmorphismOpen(true)}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  오늘의 문장
                </Button>
                <ExportButton />
                <ThemeToggle />
                
                {/* Google 사용자 정보 표시 */}
                {isGoogleAuthenticated && googleUser && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    {googleUser.picture && (
                      <img
                        src={googleUser.picture}
                        alt={googleUser.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {googleUser.name}
                    </span>
                  </div>
                )}
                
                {/* Google 로그아웃 버튼 */}
                {isGoogleAuthenticated ? (
                  <GoogleAuthButton showUserInfo={false} />
                ) : (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline ml-1">로그아웃</span>
                  </Button>
                )}
              </div>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary text-sm md:text-base px-3 md:px-4"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">문장 등록</span>
                <span className="sm:hidden">등록</span>
              </Button>
            </div>
          </div>
          
          {/* Bottom Row - Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="닉네임, 책제목, 저자, 내용으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm md:text-base"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          </div>
          
          {/* Mobile-only Actions Row */}
          <div className="flex sm:hidden items-center justify-center gap-4 mt-3 pt-2 border-t border-border/50">
            <Button
              onClick={() => setIsGlassmorphismOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              오늘의 문장
            </Button>
            <ExportButton />
            <ThemeToggle />
            
            {/* Google 사용자 정보 (모바일) */}
            {isGoogleAuthenticated && googleUser && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded border">
                {googleUser.picture && (
                  <img
                    src={googleUser.picture}
                    alt={googleUser.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                )}
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-20">
                  {googleUser.given_name || googleUser.name}
                </span>
              </div>
            )}
            
            {/* 로그아웃 버튼 (모바일) */}
            {isGoogleAuthenticated ? (
              <GoogleAuthButton showUserInfo={false} />
            ) : (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Left Sidebar - User Profile */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-24">
            <UserStatsCard onEditProfile={() => setIsProfileModalOpen(true)} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Mobile Profile Card - Only visible on small screens */}
          <div className="lg:hidden mb-6">
            <UserStatsCard onEditProfile={() => setIsProfileModalOpen(true)} />
          </div>

          {/* Recent Activity with Popular Rankings */}
          <RecentActivity />
        
        {/* Filter Controls */}
        <FilterControls
          sortBy={sortBy}
          setSortBy={setSortBy}
          showOnlyBooks={showOnlyBooks}
          setShowOnlyBooks={setShowOnlyBooks}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          pageFilter={pageFilter}
          setPageFilter={setPageFilter}
        />
        


        {/* Sentence List */}
        <div className="space-y-6">
          {isLoading ? (
            // Loading skeletons
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow-sm border animate-pulse">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sentences && sentences.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                총 {sentences.length}개의 문장
              </div>
              {sentences.map((sentence) => (
                <SentenceCard
                  key={sentence.id}
                  sentence={sentence}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeletingSentenceId(id)}
                  onAdminDelete={(id) => setAdminDeletingSentenceId(id)}
                />
              ))}
            </>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">데이터를 불러오는데 실패했습니다.</p>
              <p className="text-muted-foreground mt-2">{error.message}</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {debouncedSearch ? "검색 결과가 없습니다." : "등록된 문장이 없습니다."}
              </p>
              {!debouncedSearch && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  첫 번째 문장 등록하기
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination Buttons */}
        <div className="text-center mt-16 mb-16">
          <div className="flex justify-center items-center gap-4 flex-wrap">
            {hasPreviousPage && (
              <Button 
                variant="outline" 
                className="px-8 py-3"
                onClick={handlePreviousPage}
              >
                이전 10개
              </Button>
            )}
            
            <span className="px-4 py-2 text-muted-foreground">
              {currentPage} / {totalPages} 페이지 ({allFilteredSentences.length}개 문장)
            </span>
            
            {hasNextPage && (
              <Button 
                variant="secondary" 
                className="px-8 py-3"
                onClick={handleNextPage}
              >
                다음 10개
              </Button>
            )}
          </div>
        </div>

        {/* Contributor Rankings */}
        <ContributorRankings />
        
          {/* Statistics at Bottom */}
          <div className="mt-12">
            <SentenceStats />
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />

      {/* Modals */}
      <AddSentenceModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

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

      <UserProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <GlassmorphismOverlay
        isOpen={isGlassmorphismOpen}
        onClose={() => setIsGlassmorphismOpen(false)}
      />
    </div>
  );
}