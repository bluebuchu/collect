import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, Heart, Book, User, Sparkles } from "lucide-react";
import type { SentenceWithUser } from "@shared/schema";

interface GlassmorphismOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlassmorphismOverlayV2({ isOpen, onClose }: GlassmorphismOverlayProps) {
  const [currentSentence, setCurrentSentence] = useState<SentenceWithUser | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasInitialized = useRef(false);

  const { data: sentences = [] } = useQuery<SentenceWithUser[]>({
    queryKey: ["/api/sentences"],
    enabled: isOpen,
  });

  // Get random sentence
  const getRandomSentence = () => {
    if (!sentences || sentences.length === 0) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      setCurrentSentence(sentences[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  // Set initial random sentence when sentences are loaded
  useEffect(() => {
    if (isOpen && sentences && sentences.length > 0 && !hasInitialized.current) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      setCurrentSentence(sentences[randomIndex]);
      hasInitialized.current = true;
    }
  }, [isOpen, sentences]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentSentence(null);
      hasInitialized.current = false;
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        getRandomSentence();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Background with pastel gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/95 via-yellow-100/90 to-green-100/95 backdrop-blur-sm" />
          
          {/* Animated background shapes - pastel colors */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-pink-200/40 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-200/40 to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-green-200/30 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000" />
          </div>

          {/* Glassmorphism Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl mx-auto"
          >
            <div 
              className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-10 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,240,245,0.6) 25%, rgba(255,255,240,0.6) 50%, rgba(240,255,240,0.6) 75%, rgba(255,255,255,0.95) 100%)',
                boxShadow: '0 20px 40px -10px rgba(251, 207, 232, 0.3), 0 10px 25px -5px rgba(254, 240, 138, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.9)',
              }}
            >

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 hover:bg-gray-100/50 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Header */}
              <div className="text-center mb-10">
                <motion.h2 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl font-bold text-gray-700 mb-3 tracking-wide"
                  style={{ 
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  오늘의 문장
                </motion.h2>
                <motion.p 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 text-sm"
                >
                  마음에 와닿는 문장을 만나보세요
                </motion.p>
              </div>

              {/* Sentence Content */}
              <div className="min-h-[250px] flex items-center justify-center mb-10">
                <AnimatePresence mode="wait">
                  {!currentSentence ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-gray-500"
                    >
                      {sentences.length === 0 ? (
                        <>
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-300 mx-auto mb-4"></div>
                          <p>문장을 불러오는 중...</p>
                        </>
                      ) : (
                        <p>아직 저장된 문장이 없습니다</p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentSentence.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-center w-full"
                    >
                      {/* Main sentence */}
                      <blockquote 
                        className="text-xl md:text-2xl lg:text-3xl text-gray-700 leading-relaxed mb-8 px-6 relative"
                        style={{ 
                          fontFamily: 'Georgia, serif'
                        }}
                      >
                        <span className="absolute -top-2 -left-2 text-4xl text-gray-300 font-serif">“</span>
                        {currentSentence.content}
                        <span className="absolute -bottom-2 -right-2 text-4xl text-gray-300 font-serif">”</span>
                      </blockquote>

                      {/* Sentence metadata */}
                      <div className="space-y-3">
                        {/* Book info */}
                        {currentSentence.bookTitle && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center justify-center gap-2 text-gray-600"
                          >
                            <Book className="w-4 h-4" />
                            <span className="text-sm">
                              {currentSentence.bookTitle}
                              {currentSentence.author && ` · ${currentSentence.author}`}
                              {currentSentence.pageNumber && ` · p.${currentSentence.pageNumber}`}
                            </span>
                          </motion.div>
                        )}

                        {/* Author info */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center justify-center gap-3 text-gray-500"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm">
                              {currentSentence.user?.nickname || currentSentence.legacyNickname || '익명'}
                            </span>
                          </div>
                          {currentSentence.likes > 0 && (
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4 fill-gray-400 text-gray-400" />
                              <span className="text-sm">{currentSentence.likes}</span>
                            </div>
                          )}
                        </motion.div>

                        {/* Date */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-gray-400 text-xs"
                        >
                          {new Date(currentSentence.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-4"
              >
                <Button
                  onClick={getRandomSentence}
                  disabled={!sentences || sentences.length === 0 || isAnimating}
                  className="bg-gradient-to-r from-pink-200 via-yellow-200 to-green-200 hover:from-pink-300 hover:via-yellow-300 hover:to-green-300 text-gray-700 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 px-6"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isAnimating ? 'animate-spin' : ''}`} />
                  다른 문장 보기
                </Button>
              </motion.div>

              {/* Keyboard hint */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-6 text-gray-400 text-xs"
              >
                <span>Space/Enter: 다른 문장</span>
                <span className="mx-2">·</span>
                <span>ESC: 닫기</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
  );
}