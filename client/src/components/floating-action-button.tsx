import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, PenTool } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
      size="icon"
    >
      <div className="relative">
        <Plus 
          className={`w-6 h-6 transition-all duration-300 ${
            isHovered ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
          }`} 
        />
        <PenTool 
          className={`w-5 h-5 absolute inset-0.5 transition-all duration-300 ${
            isHovered ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
          }`} 
        />
      </div>
    </Button>
  );
}