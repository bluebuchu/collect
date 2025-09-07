import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, BookOpen, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SentenceWithUser } from "@shared/schema";

interface CommunityCardProps {
  user: {
    id: number;
    nickname: string;
    profileImage: string | null;
    sentenceCount: number;
    totalLikes: number;
  };
  sentences: SentenceWithUser[];
}

export default function CommunityCard({ user, sentences }: CommunityCardProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const userSentences = sentences.filter(s => s.userId === user.id);
  
  // Auto-rotate sentences every 5 seconds
  useEffect(() => {
    if (userSentences.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSentenceIndex((prev) => (prev + 1) % userSentences.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [userSentences.length]);

  const currentSentence = userSentences[currentSentenceIndex];

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.profileImage || undefined} />
          <AvatarFallback>
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{user.nickname}</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {user.sentenceCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {user.totalLikes}
            </span>
          </div>
        </div>
      </div>

      {/* Popular Sentence Display */}
      {currentSentence && (
        <div className="relative h-24 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSentenceIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <p className="text-xs text-muted-foreground line-clamp-3">
                "{currentSentence.content}"
              </p>
              {currentSentence.bookTitle && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  - {currentSentence.bookTitle}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Dots Indicator */}
      {userSentences.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {userSentences.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentSentenceIndex
                  ? "bg-primary"
                  : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}