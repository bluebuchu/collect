import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import AuthModal from "@/components/auth-modal";

const bookPages = [
  {
    title: "Chapter 1",
    subtitle: "문장의 시작",
    content: "마음에 와닿는 문장을 수집하는 여정",
    quote: "\"좋은 문장은 영혼의 양식이다\"",
    author: "- 무명"
  },
  {
    title: "Chapter 2", 
    subtitle: "기록의 가치",
    content: "잊혀질 수 있는 순간들을 영원히 간직하는 방법",
    quote: "\"기록되지 않은 삶은 살아지지 않은 삶이다\"",
    author: "- 플라톤"
  },
  {
    title: "Chapter 3",
    subtitle: "공유의 즐거움",
    content: "나의 문장이 누군가의 위로가 되는 순간",
    quote: "\"나누면 배가 되는 것이 지혜다\"",
    author: "- 소크라테스"
  }
];

export default function LandingV2() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set video playback rate to 0.7x
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  // Auto flip pages
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextPage();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const openLoginModal = () => {
    setAuthModalTab("login");
    setShowAuthModal(true);
  };

  const handleNextPage = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage((prev) => (prev + 1) % bookPages.length);
        setIsAnimating(false);
      }, 600);
    }
  };

  const handlePrevPage = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage((prev) => (prev - 1 + bookPages.length) % bookPages.length);
        setIsAnimating(false);
      }, 600);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-8 lg:px-12 lg:py-16 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Video with Heavy Blur */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-20 blur-xl"
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      {/* Login Button - Top Left */}
      <div className="absolute top-6 left-6 z-30">
        <Button
          onClick={openLoginModal}
          variant="ghost"
          className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          로그인
        </Button>
      </div>

      {/* Main Book Container */}
      <div className="relative z-20 w-full max-w-4xl">
        {/* Book Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 
            className="text-6xl lg:text-7xl font-bold text-white mb-4"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 0 40px rgba(255,255,255,0.1)'
            }}
          >
            문장수집가
          </h1>
          <p className="text-xl text-white/60" style={{ fontFamily: "'Pretendard', sans-serif" }}>
            당신의 문장을 소중히 간직합니다
          </p>
        </motion.div>

        {/* 3D Book */}
        <div className="relative mx-auto" style={{ perspective: '1200px' }}>
          <div className="relative w-full max-w-2xl mx-auto">
            {/* Book Pages */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ rotateY: -180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 180, opacity: 0 }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeInOut",
                  type: "spring",
                  stiffness: 100
                }}
                className="relative bg-gradient-to-br from-white/95 to-gray-100/95 rounded-lg shadow-2xl p-12 backdrop-blur-md"
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
                }}
              >
                {/* Page Texture */}
                <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-transparent via-gray-500 to-transparent rounded-lg"></div>
                
                {/* Page Content */}
                <div className="relative">
                  {/* Chapter Title */}
                  <h2 className="text-sm font-semibold text-gray-500 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {bookPages[currentPage].title}
                  </h2>
                  
                  {/* Subtitle */}
                  <h3 className="text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                    {bookPages[currentPage].subtitle}
                  </h3>
                  
                  {/* Content */}
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                    {bookPages[currentPage].content}
                  </p>
                  
                  {/* Quote */}
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic">
                    <p className="text-gray-700 mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                      {bookPages[currentPage].quote}
                    </p>
                    <cite className="text-sm text-gray-500">
                      {bookPages[currentPage].author}
                    </cite>
                  </blockquote>
                </div>

                {/* Page Number */}
                <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                  {currentPage + 1} / {bookPages.length}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute inset-y-0 -left-16 flex items-center">
              <Button
                onClick={handlePrevPage}
                variant="ghost"
                size="icon"
                className="text-white/60 hover:text-white hover:bg-white/10"
                disabled={isAnimating}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute inset-y-0 -right-16 flex items-center">
              <Button
                onClick={handleNextPage}
                variant="ghost"
                size="icon"
                className="text-white/60 hover:text-white hover:bg-white/10"
                disabled={isAnimating}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {bookPages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentPage 
                  ? 'bg-white w-8' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            onClick={openLoginModal}
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 px-8"
          >
            시작하기
          </Button>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}