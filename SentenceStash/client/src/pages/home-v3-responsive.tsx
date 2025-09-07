import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, User, LogOut, Settings, ChevronRight, Sparkles, Edit, Menu, BookOpen, Users, Download, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import ThemeToggle from "@/components/theme-toggle";
import AddSentenceModal from "@/components/add-sentence-modal";
import EditSentenceModal from "@/components/edit-sentence-modal";
import DeleteConfirmModal from "@/components/delete-confirm-modal";
import AdminDeleteModal from "@/components/admin-delete-modal";
import UserProfileModal from "@/components/user-profile-modal";
import ExportModalV2 from "@/components/export-modal-v2";
import SentenceCard from "@/components/sentence-card";
import CommunitySectionV3 from "@/components/community-section-v3";
import ContributorRankings from "@/components/contributor-rankings";
import FloatingActionButton from "@/components/floating-action-button";
import GlassmorphismOverlayV2 from "@/components/glassmorphism-overlay-v2";
import type { SentenceWithUser } from "@shared/schema";

type ViewState = 'random' | 'main';

export default function HomeV3Responsive() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const mainRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  
  // View state management
  const [currentView, setCurrentView] = useState<ViewState>('random');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<SentenceWithUser | null>(null);
  const [deletingSentenceId, setDeletingSentenceId] = useState<number | null>(null);
  const [adminDeletingSentenceId, setAdminDeletingSentenceId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"sentences" | "community" | "rankings">("sentences");

  // Queries
  const { data: allSentences = [], isLoading: sentencesLoading } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
  });

  const userSentences = allSentences.filter(s => s.userId === user?.id);

  const handleScrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Profile Dropdown Component
  const ProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImage || undefined} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.nickname}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>프로필 편집</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrentView('random')}>
          <Sparkles className="mr-2 h-4 w-4" />
          <span>랜덤 문장</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocation('/community')}>
          <Users className="mr-2 h-4 w-4" />
          <span>커뮤니티</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setIsExportModalOpen(true)}>
          <Download className="mr-2 h-4 w-4" />
          <span>내보내기</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Random Sentence View
  const RandomSentenceView = () => (
    <>
      <GlassmorphismOverlayV2 
        isOpen={true}
        onClose={() => setCurrentView('main')}
      />

      {/* Profile at top right */}
      {user && (
        <div className="fixed top-4 right-4 z-[102] flex items-center gap-2">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-1">
            <ThemeToggle />
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg">
            <ProfileDropdown />
          </div>
        </div>
      )}
    </>
  );

  // Stats Component
  const StatsOverview = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">내 문장</p>
            <p className="text-lg sm:text-2xl font-bold">{userSentences.length}</p>
          </div>
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-50" />
        </div>
      </Card>
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">전체 문장</p>
            <p className="text-lg sm:text-2xl font-bold">{allSentences.length}</p>
          </div>
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-50" />
        </div>
      </Card>
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">좋아요</p>
            <p className="text-lg sm:text-2xl font-bold">
              {userSentences.reduce((sum, s) => sum + (s.likes || 0), 0)}
            </p>
          </div>
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-50" />
        </div>
      </Card>
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">순위</p>
            <p className="text-lg sm:text-2xl font-bold">#12</p>
          </div>
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-50" />
        </div>
      </Card>
    </div>
  );

  // Mobile/Tablet View with Tabs
  const MobileMainView = () => (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80vw] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>메뉴</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setCurrentView('random')}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  랜덤 문장
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setLocation('/community')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  커뮤니티
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  내보내기
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg sm:text-xl font-bold">SentenceStash</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="sentences" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              내 문장
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              커뮤니티
            </TabsTrigger>
            <TabsTrigger value="rankings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              순위
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sentences" className="flex-1 overflow-y-auto p-4 mt-0">
            <StatsOverview />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">내 문장</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">내보내기</span>
                </Button>
                <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">추가</span>
                </Button>
              </div>
            </div>

            {sentencesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : userSentences.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  아직 등록한 문장이 없습니다
                </p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  첫 문장 등록하기
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {userSentences.map((sentence) => (
                  <SentenceCard
                    key={sentence.id}
                    sentence={sentence}
                    onEdit={() => setEditingSentence(sentence)}
                    onDelete={() => setDeletingSentenceId(sentence.id)}
                    onAdminDelete={() => setAdminDeletingSentenceId(sentence.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="community" className="flex-1 overflow-y-auto p-4 mt-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">커뮤니티</h2>
            <CommunitySectionV3 />
          </TabsContent>

          <TabsContent value="rankings" className="flex-1 overflow-y-auto p-4 mt-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">순위</h2>
            <ContributorRankings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setIsAddModalOpen(true)}
        onScrollToTop={handleScrollToTop}
      />
    </div>
  );

  // Desktop Three Column View - unchanged
  const DesktopMainView = () => (
    <div className="h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">SentenceStash</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('random')}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            랜덤 문장
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/community')}
          >
            <Users className="mr-2 h-4 w-4" />
            커뮤니티
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="h-[calc(100vh-3.5rem)] flex">
        {/* Left Column - Community (25%) */}
        <div className="w-[25%] border-r bg-card/50 p-6 overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold mb-4">커뮤니티</h2>
          <CommunitySectionV3 />
        </div>

        {/* Center Column - My Sentences (50%) */}
        <div className="w-[50%] p-6 overflow-y-auto" ref={mainRef}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">내 문장</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  내보내기
                </Button>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  추가
                </Button>
              </div>
            </div>

            {sentencesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : userSentences.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  아직 등록한 문장이 없습니다
                </p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  첫 문장 등록하기
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {userSentences.map((sentence) => (
                  <SentenceCard
                    key={sentence.id}
                    sentence={sentence}
                    onEdit={() => setEditingSentence(sentence)}
                    onDelete={() => setDeletingSentenceId(sentence.id)}
                    onAdminDelete={() => setAdminDeletingSentenceId(sentence.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Rankings (25%) */}
        <div className="w-[25%] border-l bg-card/50 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6">순위</h2>
          <ContributorRankings />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setIsAddModalOpen(true)}
        onScrollToTop={handleScrollToTop}
      />
    </div>
  );

  // Check if desktop
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <>
      <AnimatePresence mode="wait">
        {currentView === 'random' && (
          <motion.div
            key="random"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RandomSentenceView />
          </motion.div>
        )}
        
        {currentView === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isDesktop ? <DesktopMainView /> : <MobileMainView />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <UserProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <AddSentenceModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingSentence && (
        <EditSentenceModal
          open={!!editingSentence}
          onClose={() => setEditingSentence(null)}
          sentence={editingSentence}
        />
      )}

      {deletingSentenceId && (
        <DeleteConfirmModal
          open={!!deletingSentenceId}
          onClose={() => setDeletingSentenceId(null)}
          sentenceId={deletingSentenceId}
        />
      )}

      {adminDeletingSentenceId && (
        <AdminDeleteModal
          open={!!adminDeletingSentenceId}
          onClose={() => setAdminDeletingSentenceId(null)}
          sentenceId={adminDeletingSentenceId}
        />
      )}

      <ExportModalV2
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
      />
    </>
  );
}