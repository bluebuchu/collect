import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, LogOut, Settings, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import SentenceCard from "@/components/sentence-card";
import AddSentenceModal from "@/components/add-sentence-modal";
import EditSentenceModal from "@/components/edit-sentence-modal";
import DeleteConfirmModal from "@/components/delete-confirm-modal";
import AdminDeleteModal from "@/components/admin-delete-modal";
import FloatingActionButton from "@/components/floating-action-button";
import ThemeToggle from "@/components/theme-toggle";
import UserProfileModal from "@/components/user-profile-modal";
import CommunitySection from "@/components/community-section";
import ContributorRankings from "@/components/contributor-rankings";
import GlassmorphismOverlay from "@/components/glassmorphism-overlay";

import { useAuth, useLogout } from "@/hooks/useAuth";
import type { SentenceWithUser } from "@shared/schema";

export default function HomeNew() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGlassmorphismOpen, setIsGlassmorphismOpen] = useState(true);
  const [editingSentence, setEditingSentence] = useState<SentenceWithUser | null>(null);
  const [deletingSentenceId, setDeletingSentenceId] = useState<number | null>(null);
  const [adminDeletingSentenceId, setAdminDeletingSentenceId] = useState<number | null>(null);

  // Auto-close glassmorphism after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGlassmorphismOpen(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const { data: userSentences = [], isLoading: sentencesLoading } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/user/sentences"],
    enabled: !!user && isExpanded,
  });

  const { data: allSentences = [] } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-muted-foreground">로그인이 필요합니다</p>
          <Button onClick={() => window.location.href = "/"} className="mt-4">
            로그인 페이지로
          </Button>
        </Card>
      </div>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Glassmorphism Overlay */}
      <AnimatePresence>
        {isGlassmorphismOpen && (
          <GlassmorphismOverlay 
            isOpen={isGlassmorphismOpen}
            onClose={() => setIsGlassmorphismOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar - Profile (Initial State) */}
        <AnimatePresence mode="wait">
          {!isExpanded && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-80 border-r bg-card p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">SentenceStash</h1>
                <ThemeToggle />
              </div>

              {/* User Profile Card */}
              <Card className="p-6 mb-6">
                <div className="text-center space-y-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={user.profileImage || undefined} />
                    <AvatarFallback className="text-2xl">
                      {(user.nickname || user.email || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-lg font-semibold hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                      {user.nickname || "사용자"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  {user.bio && (
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {userSentences.length}
                      </p>
                      <p className="text-xs text-muted-foreground">내 문장</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {userSentences.reduce((sum, s) => sum + s.likes, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">받은 좋아요</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  문장 추가
                </Button>
                <Button
                  onClick={() => setIsProfileModalOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  프로필 설정
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              </div>

              {/* Recent Activity Preview */}
              <div className="mt-auto">
                <h3 className="text-sm font-semibold mb-2">최근 활동</h3>
                <div className="space-y-2">
                  {allSentences.slice(0, 3).map((sentence) => (
                    <div key={sentence.id} className="text-xs text-muted-foreground">
                      <span className="font-medium">{sentence.user?.nickname}</span>님이 문장 추가
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded State - 3 Columns */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex"
            >
              {/* Left Column - Community (30%) */}
              <div className="w-[30%] border-r bg-card p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    onClick={() => setIsExpanded(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    닫기
                  </Button>
                  <ThemeToggle />
                </div>
                <CommunitySection />
              </div>

              {/* Center Column - My Sentences (45%) */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">내 문장</h2>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      추가
                    </Button>
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
                          currentUserId={user.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Rankings (25%) */}
              <div className="w-[25%] border-l bg-card p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-4">순위</h2>
                    <ContributorRankings sentences={allSentences} />
                  </div>

                  {/* User Quick Actions */}
                  <Card className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.profileImage || undefined} />
                        <AvatarFallback>
                          {(user.nickname || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{user.nickname}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={() => setIsProfileModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Settings className="w-3 h-3 mr-2" />
                        설정
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                      >
                        <LogOut className="w-3 h-3 mr-2" />
                        로그아웃
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddClick={() => setIsAddModalOpen(true)}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />

      {/* Modals */}
      <AddSentenceModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      {editingSentence && (
        <EditSentenceModal
          open={!!editingSentence}
          onOpenChange={(open) => !open && setEditingSentence(null)}
          sentence={editingSentence}
        />
      )}

      {deletingSentenceId && (
        <DeleteConfirmModal
          open={!!deletingSentenceId}
          onOpenChange={(open) => !open && setDeletingSentenceId(null)}
          sentenceId={deletingSentenceId}
        />
      )}

      {adminDeletingSentenceId && (
        <AdminDeleteModal
          open={!!adminDeletingSentenceId}
          onOpenChange={(open) => !open && setAdminDeletingSentenceId(null)}
          sentenceId={adminDeletingSentenceId}
        />
      )}

      <UserProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </div>
  );
}