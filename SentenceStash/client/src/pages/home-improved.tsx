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
import CommunitySectionV3 from "@/components/community-section-v3";

import { useAuth, useLogout } from "@/hooks/useAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { apiRequest } from "@/lib/queryClient";
import type { SentenceWithUser } from "@shared/schema";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const SENTENCES_PER_PAGE = 10;

export default function HomeImproved() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { user: googleUser, isAuthenticated: isGoogleAuthenticated } = useGoogleAuth();
  const logoutMutation = useLogout();
  
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<SentenceWithUser | null>(null);
  const [deletingSentence, setDeletingSentence] = useState<SentenceWithUser | null>(null);
  const [adminDeletingSentence, setAdminDeletingSentence] = useState<SentenceWithUser | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGlassmorphismOpen, setIsGlassmorphismOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "oldest" | "reverse-page">("latest");
  const [showOnlyBooks, setShowOnlyBooks] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [pageFilter, setPageFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch sentences
  const { data: allSentences = [], isLoading: sentencesLoading } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences", user?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/sentences");
      return response;
    }
  });

  // Apply all filters
  const allFilteredSentences = allSentences?.filter(sentence => {
    const searchLower = debouncedSearch.toLowerCase();
    const contentMatch = sentence.content.toLowerCase().includes(searchLower);
    const authorMatch = sentence.author?.toLowerCase().includes(searchLower) || false;
    const bookMatch = sentence.bookTitle?.toLowerCase().includes(searchLower) || false;
    const nicknameMatch = sentence.user?.nickname?.toLowerCase().includes(searchLower) || false;
    const legacyMatch = sentence.legacyNickname?.toLowerCase().includes(searchLower) || false;
    const matchesSearch = !debouncedSearch || contentMatch || authorMatch || bookMatch || nicknameMatch || legacyMatch;
    
    const matchesBookFilter = !showOnlyBooks || sentence.bookTitle;
    const matchesCategory = !categoryFilter || 
      (categoryFilter === "book" && sentence.bookTitle) ||
      (categoryFilter === "no-book" && !sentence.bookTitle);
    const matchesPageFilter = !pageFilter || 
      (pageFilter === "page" && sentence.pageNumber) ||
      (pageFilter === "no-page" && !sentence.pageNumber);
    
    return matchesSearch && matchesBookFilter && matchesCategory && matchesPageFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case "likes": return b.likes - a.likes;
      case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "reverse-page":
        if (a.pageNumber === null && b.pageNumber === null) return 0;
        if (a.pageNumber === null) return 1;
        if (b.pageNumber === null) return -1;
        return b.pageNumber - a.pageNumber;
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }) ?? [];

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

  // Neumorphism style classes
  const neumorphismCard = "bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#1a1a1a,-20px_-20px_60px_#2a2a2a]";
  const neumorphismInset = "bg-gray-50 dark:bg-gray-800 rounded-xl shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff] dark:shadow-[inset_8px_8px_16px_#1a1a1a,inset_-8px_-8px_16px_#2a2a2a]";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header with Neumorphism */}
      <header className={`${neumorphismCard} sticky top-0 z-40 mx-4 mt-4 mb-6`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">문장수집</h1>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsGlassmorphismOpen(true)}
                variant="ghost"
                className="hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                오늘의 문장
              </Button>
              <ExportButton />
              <ThemeToggle />
              
              {isGoogleAuthenticated && googleUser && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700">
                  {googleUser.picture && (
                    <img
                      src={googleUser.picture}
                      alt={googleUser.name}
                      className="w-7 h-7 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {googleUser.name}
                  </span>
                </div>
              )}
              
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                문장 등록
              </Button>
            </div>
          </div>
          
          {/* Search Bar with Neumorphism inset effect */}
          <div className={`${neumorphismInset} p-1`}>
            <div className="relative">
              <Input
                type="text"
                placeholder="닉네임, 책제목, 저자, 내용으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 bg-transparent focus:ring-0"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with 3-column layout */}
      <div className="max-w-[1600px] mx-auto px-4 pb-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Section - Community (25%) */}
          <aside className="col-span-12 lg:col-span-3">
            <div className={`${neumorphismCard} p-6 h-[calc(100vh-200px)] sticky top-32`}>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">커뮤니티</h2>
              <CommunitySectionV3 />
            </div>
          </aside>

          {/* Center Section - Main Content (50%) */}
          <main className="col-span-12 lg:col-span-6">
            {/* Recent Activity */}
            <div className={`${neumorphismCard} p-6 mb-6`}>
              <RecentActivity />
            </div>

            {/* Filter Controls */}
            <div className={`${neumorphismCard} p-4 mb-6`}>
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
            </div>

            {/* Sentence List */}
            <div className="space-y-4">
              {sentencesLoading ? (
                <div className={`${neumorphismCard} p-8 text-center`}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">문장을 불러오는 중...</p>
                </div>
              ) : sentences.length === 0 ? (
                <div className={`${neumorphismCard} p-12 text-center`}>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {debouncedSearch ? "검색 결과가 없습니다." : "아직 등록된 문장이 없습니다."}
                  </p>
                  <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    첫 문장 등록하기
                  </Button>
                </div>
              ) : (
                <>
                  {sentences.map((sentence) => (
                    <div key={sentence.id} className={`${neumorphismCard} p-1`}>
                      <SentenceCard
                        sentence={sentence}
                        currentUserId={user?.id}
                        onEdit={handleEdit}
                        onDelete={setDeletingSentence}
                        onAdminDelete={setAdminDeletingSentence}
                      />
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={`${neumorphismCard} p-4 flex items-center justify-between`}>
                      <Button
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage}
                        variant="ghost"
                        className="hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        이전
                      </Button>
                      
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {currentPage} / {totalPages} 페이지
                      </span>
                      
                      <Button
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
                        variant="ghost"
                        className="hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        다음
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* Right Section - User Profile & Stats (25%) */}
          <aside className="col-span-12 lg:col-span-3">
            <div className={`${neumorphismCard} p-6 mb-6`}>
              <UserStatsCard onEditProfile={() => setIsProfileModalOpen(true)} />
            </div>
            
            <div className={`${neumorphismCard} p-6 mb-6`}>
              <SentenceStats />
            </div>
            
            <div className={`${neumorphismCard} p-6`}>
              <ContributorRankings />
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />

      {/* Modals */}
      <AddSentenceModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      {editingSentence && (
        <EditSentenceModal
          sentence={editingSentence}
          open={!!editingSentence}
          onClose={() => setEditingSentence(null)}
        />
      )}
      
      {deletingSentence && (
        <DeleteConfirmModal
          sentence={deletingSentence}
          open={!!deletingSentence}
          onClose={() => setDeletingSentence(null)}
        />
      )}
      
      {adminDeletingSentence && (
        <AdminDeleteModal
          sentence={adminDeletingSentence}
          open={!!adminDeletingSentence}
          onClose={() => setAdminDeletingSentence(null)}
        />
      )}
      
      <UserProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      
      <GlassmorphismOverlay
        open={isGlassmorphismOpen}
        onClose={() => setIsGlassmorphismOpen(false)}
        sentences={allSentences}
      />
    </div>
  );
}