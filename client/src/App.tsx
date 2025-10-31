import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Component, ErrorInfo, ReactNode } from "react";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import MySentences from "@/pages/my-sentences";
import CommunitiesHub from "@/pages/communities-hub";
import CommunityDetail from "@/pages/community-detail";
import BooksPage from "@/pages/books";
import BookDetailPage from "@/pages/book-detail";
import AdminPage from "@/pages/admin";
import ResetPasswordPage from "@/pages/reset-password";
import AuthCallback from "@/pages/auth-callback";
import NotFound from "@/pages/not-found";
import BookClubsList from "@/pages/book-clubs/book-clubs-list";
import BookClubDetail from "@/pages/book-clubs/book-club-detail";
import { useAuth } from "@/hooks/useAuth";
import { useActivityTracker } from "@/hooks/useActivityTracker";

// Error Boundary 컴포넌트 추가
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    console.error("[ErrorBoundary] Caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Error details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // 사용자 활동 추적 및 자동 토큰 갱신
  useActivityTracker();
  
  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Auth callback for OAuth */}
      <Route path="/auth/callback" component={AuthCallback} />
      
      {/* Password reset page is accessible to everyone */}
      <Route path="/reset-password" component={ResetPasswordPage} />
      
      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/my-sentences" component={MySentences} />
          <Route path="/communities" component={CommunitiesHub} />
          <Route path="/community" component={CommunitiesHub} />
          <Route path="/community/:id" component={CommunityDetail} />
          <Route path="/communities/:communityId/book-clubs" component={BookClubsList} />
          <Route path="/book-clubs/:id" component={BookClubDetail} />
          <Route path="/books" component={BooksPage} />
          <Route path="/books/:bookTitle" component={BookDetailPage} />
          <Route path="/admin" component={AdminPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/communities" component={CommunitiesHub} />
          <Route path="/community" component={CommunitiesHub} />
          <Route path="/community/:id" component={CommunityDetail} />
          <Route path="/communities/:communityId/book-clubs" component={BookClubsList} />
          <Route path="/book-clubs/:id" component={BookClubDetail} />
          <Route path="/books" component={BooksPage} />
          <Route path="/books/:bookTitle" component={BookDetailPage} />
          <Route path="/admin" component={AdminPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
