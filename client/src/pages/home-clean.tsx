import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, LogOut } from "lucide-react";

import SentenceCard from "@/components/sentence-card";
import AddSentenceModal from "@/components/add-sentence-modal";
import EditSentenceModal from "@/components/edit-sentence-modal";
import DeleteConfirmModal from "@/components/delete-confirm-modal";
import AdminDeleteModal from "@/components/admin-delete-modal";
import FilterControls from "@/components/filter-controls";
import FloatingActionButton from "@/components/floating-action-button";
import ThemeToggle from "@/components/theme-toggle";
import ExportButton from "@/components/export-button";
import ContributorRankingsImproved from "@/components/contributor-rankings-improved";
import UserProfileModal from "@/components/user-profile-modal";
import UserStatsCard from "@/components/user-stats-card";
import GlassmorphismOverlay from "@/components/glassmorphism-overlay";
import CommunitySectionV3 from "@/components/community-section-v3";

import { useAuth, useLogout } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { SentenceWithUser } from "@shared/schema";

const SENTENCES_PER_PAGE = 10;

export default function HomeClean() {
  const { user, isLoading } = useAuth();
  const logoutMutation = useLogout();
  
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<SentenceWithUser | null>(null);
  const [deletingSentence, setDeletingSentence] = useState<SentenceWithUser | null>(null);
  const [adminDeletingSentence, setAdminDeletingSentence] = useState<SentenceWithUser | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGlassmorphismOpen, setIsGlassmorphismOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "oldest">("latest");
  const [showOnlyBooks, setShowOnlyBooks] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [pageFilter, setPageFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch sentences
  const { data: allSentences = [], isLoading: sentencesLoading } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
    queryFn: async () => apiRequest("GET", "/api/sentences"),
  });

  // Apply filters
  const allFilteredSentences = allSentences?.filter(sentence => {
    const searchLower = debouncedSearch.toLowerCase();
    const matchesSearch = !debouncedSearch || 
      sentence.content.toLowerCase().includes(searchLower) ||
      sentence.author?.toLowerCase().includes(searchLower) ||
      sentence.bookTitle?.toLowerCase().includes(searchLower) ||
      sentence.user?.nickname?.toLowerCase().includes(searchLower);
    
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
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }) ?? [];

  // Pagination
  const totalPages = Math.ceil(allFilteredSentences.length / SENTENCES_PER_PAGE);
  const startIndex = (currentPage - 1) * SENTENCES_PER_PAGE;
  const sentences = allFilteredSentences.slice(startIndex, startIndex + SENTENCES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, showOnlyBooks, categoryFilter, pageFilter, debouncedSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Fixed */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <h1 className="text-xl font-bold font-display">문장수집</h1>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                onClick={() => setIsGlassmorphismOpen(true)}
                variant="ghost"
                size="sm"
              >
                오늘의 문장
              </Button>
              <ExportButton />
              <ThemeToggle />
              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                문장 등록
              </Button>
              <Button
                onClick={() => logoutMutation.mutate()}
                variant="ghost"
                size="sm"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="검색어를 입력하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {/* 3-Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Community (3 cols) */}
          <aside className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">커뮤니티</h2>
              <CommunitySectionV3 />
            </div>
          </aside>

          {/* Main Content (6 cols) */}
          <main className="lg:col-span-6">
            {/* Filter Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
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

            {/* Sentences List */}
            <div className="space-y-4">
              {sentencesLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : sentences.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                  <p className="text-gray-500 mb-4">
                    {debouncedSearch ? "검색 결과가 없습니다." : "아직 등록된 문장이 없습니다."}
                  </p>
                  {!debouncedSearch && (
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      첫 문장 등록하기
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {sentences.map((sentence) => (
                    <div key={sentence.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <SentenceCard
                        sentence={sentence}
                        currentUserId={user?.id}
                        onEdit={setEditingSentence}
                        onDelete={setDeletingSentence}
                        onAdminDelete={setAdminDeletingSentence}
                      />
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 py-6">
                      <Button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        이전
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        다음
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* Right Sidebar (3 cols) */}
          <aside className="lg:col-span-3 space-y-4">
            {/* User Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <UserStatsCard onEditProfile={() => setIsProfileModalOpen(true)} />
            </div>
            
            {/* Rankings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <ContributorRankingsImproved />
            </div>
          </aside>
        </div>
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