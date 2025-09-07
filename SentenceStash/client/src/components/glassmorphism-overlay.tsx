import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, Heart, Book, User } from "lucide-react";
import type { SentenceWithUser } from "@shared/schema";

interface GlassmorphismOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlassmorphismOverlay({ isOpen, onClose }: GlassmorphismOverlayProps) {
  const [currentSentence, setCurrentSentence] = useState<SentenceWithUser | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: sentences } = useQuery<SentenceWithUser[]>({
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

  // Set initial random sentence when overlay opens
  useEffect(() => {
    if (isOpen && sentences && sentences.length > 0 && !currentSentence) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      setCurrentSentence(sentences[randomIndex]);
    }
  }, [isOpen, sentences, currentSentence]);

  // Close overlay when clicking background
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-pink-100/90 via-blue-100/80 to-green-100/90 backdrop-blur-sm"
      onClick={handleBackgroundClick}
    >
      {/* Glassmorphism Container */}
      <div className="relative w-full max-w-2xl mx-auto">
        <div 
          className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-[28px] p-10 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,226,226,0.5) 30%, rgba(219,234,254,0.5) 60%, rgba(220,252,231,0.5) 100%)',
            boxShadow: '0 20px 60px -10px rgba(147, 197, 253, 0.3), 0 10px 30px -5px rgba(251, 207, 232, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.9)',
          }}
        >
          {/* Decorative gradient orbs */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-300/50 to-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-300/50 to-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-green-300/40 to-green-200/20 rounded-full blur-3xl" />
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-pink-400 hover:text-pink-500 hover:bg-pink-100/70 rounded-full transition-all duration-200 z-10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-3 tracking-wide font-display">
              오늘의 문장
            </h2>
            <p className="text-blue-400 text-sm font-light tracking-wide font-pretendard">
              마음에 울림을 주는 문장을 만나보세요
            </p>
          </div>

          {/* Sentence Content */}
          <div className="min-h-[200px] flex items-center justify-center mb-8">
            {!currentSentence ? (
              <div className="text-center text-blue-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300 mx-auto mb-4"></div>
                <p style={{ fontFamily: 'Pretendard, sans-serif' }} className="font-light">문장을 불러오는 중...</p>
              </div>
            ) : (
              <div 
                className={`text-center transition-all duration-300 ${
                  isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
                }`}
              >
                {/* Main sentence */}
                <blockquote 
                  className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 px-6 relative font-serif"
                >
                  <span className="absolute -top-4 -left-2 text-4xl text-pink-300 font-serif">“</span>
                  {currentSentence.content}
                  <span className="absolute -bottom-4 -right-2 text-4xl text-green-300 font-serif">”</span>
                </blockquote>

                {/* Sentence metadata */}
                <div className="space-y-3">
                  {/* Book info */}
                  {currentSentence.bookTitle && (
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Book className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-light font-pretendard">
                        {currentSentence.bookTitle}
                        {currentSentence.author && ` - ${currentSentence.author}`}
                        {currentSentence.pageNumber && ` (p.${currentSentence.pageNumber})`}
                      </span>
                    </div>
                  )}

                  {/* Author info */}
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-light font-pretendard">
                      {currentSentence.user?.nickname || '익명'}
                    </span>
                    {currentSentence.likes > 0 && (
                      <span className="flex items-center gap-1 ml-2">
                        <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                        <span className="text-xs text-pink-400">{currentSentence.likes}</span>
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-gray-400 text-xs font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {new Date(currentSentence.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={getRandomSentence}
              disabled={!sentences || sentences.length === 0 || isAnimating}
              className="bg-gradient-to-r from-pink-200 via-blue-200 to-green-200 hover:from-pink-300 hover:via-blue-300 hover:to-green-300 text-gray-700 border border-white/70 shadow-sm hover:shadow-md transition-all duration-200"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              <RefreshCw className={`w-4 h-4 mr-2 text-blue-500 ${isAnimating ? 'animate-spin' : ''}`} />
              <span className="font-light bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 bg-clip-text text-transparent">다른 문장 보기</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}