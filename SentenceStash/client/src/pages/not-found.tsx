import { Link } from "wouter";
import { Home, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="text-9xl font-bold text-muted-foreground/20 select-none">
            404
          </div>
          <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-muted-foreground/40" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-muted-foreground text-lg">
            찾으시는 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              홈으로 돌아가기
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            이전 페이지로
          </Button>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            문제가 계속되면 관리자에게 문의해주세요
          </p>
        </div>
      </div>
    </div>
  );
}
