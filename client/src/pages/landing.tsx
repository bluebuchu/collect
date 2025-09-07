import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth-modal";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set video playback rate to 0.7x
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  const openLoginModal = () => {
    setAuthModalTab("login");
    setShowAuthModal(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab("register");
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-8 lg:px-12 lg:py-16 overflow-hidden">
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 z-0" />
      
      {/* Background Video */}
      {!videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover z-5 transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadedData={() => {
            console.log("Video loaded successfully");
            setVideoLoaded(true);
          }}
          onError={(e) => {
            console.error("Video failed to load:", e);
            setVideoError(true);
          }}
        >
          <source src="/background-video.mp4" type="video/mp4" />
          <source src="./background-video.mp4" type="video/mp4" />
        </video>
      )}
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40 z-10"></div>
      
      {/* Auth Buttons - Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-30 flex flex-col gap-2 sm:gap-3">
        <div className="flex gap-2 sm:gap-3 lg:gap-4">
          <Button
            onClick={openLoginModal}
            variant="outline"
            size="sm"
            className="bg-white/90 hover:bg-white text-black border-white/20 backdrop-blur-sm text-xs sm:text-xs lg:text-sm px-2.5 py-1 sm:px-3 sm:py-1.5 lg:px-5 lg:py-2 transition-all duration-300 hover:scale-105"
            style={{ fontFamily: "'Pretendard', sans-serif", fontWeight: 400 }}
          >
            로그인
          </Button>
          <Button
            onClick={openRegisterModal}
            size="sm"
            className="bg-black/80 hover:bg-black text-white backdrop-blur-sm text-xs sm:text-xs lg:text-sm px-2.5 py-1 sm:px-3 sm:py-1.5 lg:px-5 lg:py-2 transition-all duration-300 hover:scale-105"
            style={{ fontFamily: "'Pretendard', sans-serif", fontWeight: 400 }}
          >
            회원가입
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl text-center relative z-20 px-4">
        {/* Brand Name */}
        <p 
          className="text-xs sm:text-base lg:text-lg text-white/70 mb-3 sm:mb-4 lg:mb-5 drop-shadow-md tracking-wider" 
          style={{ fontFamily: "'Pretendard', sans-serif" }}
        >
          문장수집가
        </p>

        {/* Main Title */}
        <h1 
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal text-white mb-7 sm:mb-11 lg:mb-14 drop-shadow-2xl leading-none relative" 
          style={{ 
            fontFamily: "'Playfair Display', serif", 
            letterSpacing: '-0.02em',
            textShadow: '0 0 30px rgba(255, 255, 255, 0.1)'
          }}
        >
          <span className="inline-block transform transition-transform duration-700 hover:scale-105">
            Collect
          </span>
        </h1>

        {/* Korean Subtitle */}
        <p 
          className="text-base sm:text-lg lg:text-xl text-white mb-5 sm:mb-9 lg:mb-12 leading-relaxed drop-shadow-md px-2 max-w-2xl mx-auto opacity-95"
          style={{ 
            fontFamily: "'Pretendard', sans-serif", 
            letterSpacing: '0.01em',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          마음에 담은 문장들을 모으는 공간
        </p>

        {/* Divider */}
        <div className="relative mb-5 sm:mb-9 lg:mb-11">
          <div className="w-14 sm:w-18 lg:w-22 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto"></div>
          <div className="absolute inset-0 w-14 sm:w-18 lg:w-22 h-px bg-white/20 mx-auto blur-sm"></div>
        </div>

        {/* English Subtitle */}
        <div className="mb-7 sm:mb-14 lg:mb-18 max-w-3xl mx-auto">
          <p 
            className="text-base sm:text-lg lg:text-xl text-white/90 mb-1 sm:mb-2 drop-shadow-md opacity-90"
            style={{ 
              fontFamily: "'Inter', sans-serif", 
              fontWeight: 300, 
              letterSpacing: '0.02em',
              textShadow: '0 2px 15px rgba(0, 0, 0, 0.2)'
            }}
          >
            A space for collecting
          </p>
          <p 
            className="text-base sm:text-lg lg:text-xl text-white/90 drop-shadow-md opacity-90"
            style={{ 
              fontFamily: "'Inter', sans-serif", 
              fontWeight: 300, 
              letterSpacing: '0.02em',
              textShadow: '0 2px 15px rgba(0, 0, 0, 0.2)'
            }}
          >
            meaningful sentences
          </p>
        </div>

        {/* Korean Description */}
        <div className="lg:max-w-md xl:max-w-lg mx-auto opacity-90">
          <p 
            className="text-xs sm:text-sm lg:text-base text-white/80 mb-1 sm:mb-2 drop-shadow-md"
            style={{ 
              fontFamily: "'chosunilbo', serif", 
              lineHeight: '1.6',
              textShadow: '0 1px 10px rgba(0, 0, 0, 0.3)'
            }}
          >
            아름다운 문장들을
          </p>
          <p 
            className="text-xs sm:text-sm lg:text-base text-white/80 mb-7 sm:mb-14 lg:mb-18 drop-shadow-md"
            style={{ 
              fontFamily: "'chosunilbo', serif", 
              lineHeight: '1.6',
              textShadow: '0 1px 10px rgba(0, 0, 0, 0.3)'
            }}
          >
            발견하고 저장하는 소유의 공간
          </p>
        </div>
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