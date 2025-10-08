import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
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
import { useAuth } from "@/hooks/useAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

function Router() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const { user: googleUser, isAuthenticated: isGoogleAuthenticated } = useGoogleAuth();
  const { isAuthenticated: isSupabaseAuthenticated, isLoading: isSupabaseLoading } = useSupabaseAuth();

  console.log("Router - Auth state:", { user, isAuthenticated, isLoading, error, googleUser, isGoogleAuthenticated, isSupabaseAuthenticated });

  // 모든 인증 시스템이 로딩 중일 때만 로딩 표시
  if (isLoading || isSupabaseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // 기존 사용자, Google 사용자, Supabase 사용자 중 하나라도 인증되어 있으면 홈으로 이동
  const hasAnyAuth = isAuthenticated || isGoogleAuthenticated || isSupabaseAuthenticated;

  return (
    <Switch>
      {/* Auth callback for OAuth */}
      <Route path="/auth/callback" component={AuthCallback} />
      
      {/* Password reset page is accessible to everyone */}
      <Route path="/reset-password" component={ResetPasswordPage} />
      
      {!hasAnyAuth ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/communities" component={CommunitiesHub} />
          <Route path="/community" component={CommunitiesHub} />
          <Route path="/community/:id" component={CommunityDetail} />
          <Route path="/books" component={BooksPage} />
          <Route path="/books/:bookTitle" component={BookDetailPage} />
          <Route path="/admin" component={AdminPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/my-sentences" component={MySentences} />
          <Route path="/communities" component={CommunitiesHub} />
          <Route path="/community" component={CommunitiesHub} />
          <Route path="/community/:id" component={CommunityDetail} />
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
