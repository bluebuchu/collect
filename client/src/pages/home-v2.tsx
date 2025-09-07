import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, User, LogOut, Settings, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/theme-toggle";
import AddSentenceModal from "@/components/add-sentence-modal";
import EditSentenceModal from "@/components/edit-sentence-modal";
import DeleteConfirmModal from "@/components/delete-confirm-modal";
import AdminDeleteModal from "@/components/admin-delete-modal";
import SentenceCard from "@/components/sentence-card";
import CommunitySectionV2 from "@/components/community-section-v2";
import ContributorRankings from "@/components/contributor-rankings";
import FloatingActionButton from "@/components/floating-action-button";
import GlassmorphismOverlayV2 from "@/components/glassmorphism-overlay-v2";
import type { SentenceWithUser } from "@shared/schema";

export default function HomeV2() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const mainRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGlassmorphismOpen, setIsGlassmorphismOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<SentenceWithUser | null>(null);
  const [deletingSentenceId, setDeletingSentenceId] = useState<number | null>(null);
  const [adminDeletingSentenceId, setAdminDeletingSentenceId] = useState<number | null>(null);

  // Queries
  const { data: allSentences = [], isLoading: sentencesLoading } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
  });

  const userSentences = allSentences.filter(s => s.userId === user?.id);

  const handleScrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Profile Sidebar Component
  const ProfileSidebar = () => (
    <div className="h-full bg-card border-r p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">SentenceStash</h1>
        <ThemeToggle />
      </div>

      {/* User Profile */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={user?.profileImage || undefined} />
          <AvatarFallback>
            <User className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-xl font-semibold mb-2">{user?.nickname}</h2>
        <p className="text-sm text-muted-foreground mb-6">{user?.email}</p>
        
        {user?.bio && (
          <p className="text-center text-sm mb-6 px-4">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="w-full space-y-2 mb-6">
          <div className="flex justify-between px-4">
            <span className="text-sm text-muted-foreground">내 문장</span>
            <span className="font-semibold">{userSentences.length}</span>
          </div>
          <div className="flex justify-between px-4">
            <span className="text-sm text-muted-foreground">받은 좋아요</span>
            <span className="font-semibold">
              {userSentences.reduce((sum, s) => sum + s.likes, 0)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => setIsExpanded(true)}
          className="w-full max-w-[200px] mb-4"
          size="lg"
        >
          <ChevronRight className="w-4 h-4 mr-2" />
          문장 기록 보기
        </Button>
      </div>

      {/* Footer Actions */}
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setIsGlassmorphismOpen(true)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          랜덤 문장 보기
        </Button>
        <Button variant="outline" className="w-full">
          <Settings className="w-4 h-4 mr-2" />
          설정
        </Button>
        <Button variant="ghost" onClick={logout} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </div>
  );

  // Three Column Layout Component
  const ThreeColumnLayout = () => (
    <div className="h-full flex">
      {/* Left Column - Community (25%) */}
      <div className="w-[25%] border-r bg-card/50 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">커뮤니티</h2>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CommunitySectionV2 />
      </div>

      {/* Center Column - My Sentences (50%) */}
      <div className="w-[50%] p-6 overflow-y-auto" ref={mainRef}>
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
                />
              ))}
            </div>
          )}

          {/* System Sentences */}
          {allSentences.length > userSentences.length && (
            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                다른 사용자의 문장
              </h3>
              <div className="space-y-4">
                {allSentences
                  .filter(s => s.userId !== user?.id)
                  .slice(0, 5)
                  .map((sentence) => (
                    <SentenceCard
                      key={sentence.id}
                      sentence={sentence}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onAdminDelete={() => setAdminDeletingSentenceId(sentence.id)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Rankings (25%) */}
      <div className="w-[25%] border-l bg-card/50 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">순위</h2>
        <ContributorRankings />
        
        {/* Actions at bottom */}
        <div className="mt-auto pt-6 space-y-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsGlassmorphismOpen(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            랜덤 문장
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Glassmorphism Overlay */}
      <AnimatePresence>
        {isGlassmorphismOpen && (
          <GlassmorphismOverlayV2 
            isOpen={isGlassmorphismOpen}
            onClose={() => setIsGlassmorphismOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex justify-center items-center"
          >
            <div className="w-[400px] h-full">
              <ProfileSidebar />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
          >
            <ThreeColumnLayout />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {isExpanded && (
        <FloatingActionButton 
          onClick={() => setIsAddModalOpen(true)}
          onScrollToTop={handleScrollToTop}
        />
      )}

      {/* Modals */}
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
    </div>
  );
}