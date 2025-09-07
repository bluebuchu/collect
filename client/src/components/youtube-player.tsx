import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Music } from "lucide-react";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
}

const YES24_PLAYLIST: YouTubeVideo[] = [
  {
    id: "PggT2sFOsVg",
    title: "𝒑𝒍𝒂𝒚𝒍𝒊𝒔𝒕 | 책 한 권과 함께 듣기 좋은 Laufey",
    thumbnail: "https://img.youtube.com/vi/PggT2sFOsVg/mqdefault.jpg"
  },
  {
    id: "NdkPDqdq-Cs",
    title: "𝒑𝒍𝒂𝒚𝒍𝒊𝒔𝒕 | 늦은 밤, 책 읽을 때 들으려고 모은 잔잔한 인디음악",
    thumbnail: "https://img.youtube.com/vi/NdkPDqdq-Cs/mqdefault.jpg"
  },
  {
    id: "Smq_1CswzpA",
    title: "𝒑𝒍𝒂𝒚𝒍𝒊𝒔𝒕 | 내가 SF소설 읽을 때 찾아 듣는 Beach House",
    thumbnail: "https://img.youtube.com/vi/Smq_1CswzpA/mqdefault.jpg"
  },
  {
    id: "3wF_joPdPY0",
    title: "𝒑𝒍𝒂𝒚𝒍𝒊𝒔𝒕 | 내가 책 읽을 때 듣는 가사 없는 재즈 힙합",
    thumbnail: "https://img.youtube.com/vi/3wF_joPdPY0/mqdefault.jpg"
  }
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubePlayer() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      if (containerRef.current) {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: YES24_PLAYLIST[0].id,
          playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'origin': window.location.origin
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
    };

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const onPlayerReady = () => {
    setIsLoading(false);
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      // Play next video in playlist
      const nextIndex = (currentVideoIndex + 1) % YES24_PLAYLIST.length;
      playVideo(nextIndex);
    }
  };

  const playVideo = (index: number) => {
    setCurrentVideoIndex(index);
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(YES24_PLAYLIST[index].id);
      playerRef.current.playVideo();
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5" />
          <h3 className="font-semibold text-sm">YES24 음악</h3>
        </div>

        {/* Hidden YouTube Player */}
        <div id="youtube-player" ref={containerRef} style={{ display: 'none' }}></div>

        {/* Video Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {YES24_PLAYLIST.map((video, index) => (
            <div
              key={video.id}
              onClick={() => playVideo(index)}
              className={`relative cursor-pointer rounded overflow-hidden group transition-all ${
                currentVideoIndex === index ? 'ring-2 ring-primary' : ''
              }`}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-20 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                {currentVideoIndex === index && isPlaying ? (
                  <div className="bg-white/90 rounded-full p-1">
                    <Pause className="w-6 h-6 text-gray-900" />
                  </div>
                ) : (
                  <div className="bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-gray-900" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                일시정지
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                재생
              </>
            )}
          </Button>
        </div>

        {/* Current Playing Info */}
        {!isLoading && (
          <div className="mt-3 px-2">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">재생 중:</div>
              <div className="text-xs line-clamp-2">{YES24_PLAYLIST[currentVideoIndex].title}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}