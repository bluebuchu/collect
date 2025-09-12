import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Book {
  title: string;
  author: string;
  cover?: string | null;
  totalSentences?: number;
  totalLikes?: number;
  topSentence?: string;
}

interface BookCoverCarouselProps {
  onBookSelect?: (bookTitle: string) => void;
  className?: string;
  mode?: 'popular' | 'my-books'; // Add mode prop
}

// 책 장르별 색상 테마
const getBookTheme = (title: string): string => {
  const themes = [
    "from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20",
    "from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
    "from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
    "from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
    "from-rose-100 to-red-100 dark:from-rose-900/20 dark:to-red-900/20",
  ];
  
  // 간단한 해시 함수로 책 제목에 따라 일관된 색상 선택
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return themes[Math.abs(hash) % themes.length];
};

export default function BookCoverCarousel({ onBookSelect, className, mode = 'my-books' }: BookCoverCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Fetch books based on mode
  const endpoint = mode === 'popular' ? '/api/books/popular' : '/api/books/my-books';
  
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await fetch(`${endpoint}?limit=10`, { 
        credentials: "include" 
      });
      if (!response.ok) throw new Error("Failed to fetch books");
      const booksData = await response.json();
      
      // 각 책의 인기 문장 가져오기 (임시로 하드코딩)
      const booksWithSentences = booksData.map((book: Book) => ({
        ...book,
        topSentence: getTopSentenceForBook(book.title)
      }));
      
      return booksWithSentences;
    },
  });

  // 임시 인기 문장 데이터
  const getTopSentenceForBook = (title: string): string => {
    const sentences: Record<string, string> = {
      "노르웨이의 숲": "완벽한 문장이란 없다. 완벽한 절망이 없는 것처럼.",
      "코스모스": "우리는 모두 별에서 온 먼지다.",
      "어린 왕자": "가장 중요한 것은 눈에 보이지 않아.",
      "데미안": "새는 알을 깨고 나온다.",
      "1984": "전쟁은 평화다. 자유는 예속이다.",
    };
    return sentences[title] || "아름다운 문장을 발견하세요.";
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Auto-play carousel
  useEffect(() => {
    if (!api || !books || books.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api, books]);

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-center h-24">
          <div className="animate-pulse flex space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-64 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {mode === 'popular' ? '인기 책들' : '내가 읽고 있는 책들'}
        </h3>
        {count > 1 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === current - 1 
                    ? "bg-primary w-6" 
                    : "bg-gray-300 dark:bg-gray-600"
                )}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {books.map((book, index) => (
            <CarouselItem 
              key={`${book.title}-${index}`} 
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <Card 
                className={cn(
                  "border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group overflow-hidden",
                  "bg-gradient-to-br",
                  getBookTheme(book.title)
                )}
                onClick={() => onBookSelect?.(book.title)}
              >
                <div className="p-4 h-24 flex gap-3 items-center">
                  {/* 책 표지 - 작고 선명하게 */}
                  <div className="flex-shrink-0">
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={`${book.title} 표지`}
                        className="w-14 h-20 object-cover rounded shadow-sm group-hover:shadow-md transition-shadow"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = parent.querySelector('.book-icon-placeholder');
                            if (placeholder) {
                              (placeholder as HTMLElement).style.display = 'flex';
                            }
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={cn(
                        "book-icon-placeholder w-14 h-20 rounded shadow-sm",
                        "flex items-center justify-center",
                        "bg-white/50 dark:bg-gray-800/50",
                        book.cover ? "hidden" : "flex"
                      )}
                    >
                      <BookOpen className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                  
                  {/* 책 정보 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm line-clamp-1 text-gray-900 dark:text-gray-100">
                      {book.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                      {book.author}
                    </p>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {books.length > 3 && (
          <>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </>
        )}
      </Carousel>
    </div>
  );
}