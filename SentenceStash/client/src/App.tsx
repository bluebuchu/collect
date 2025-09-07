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
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

function Router() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const { user: googleUser, isAuthenticated: isGoogleAuthenticated } = useGoogleAuth();

  console.log("Router - Auth state:", { user, isAuthenticated, isLoading, error, googleUser, isGoogleAuthenticated });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // 기존 사용자나 Google 사용자 중 하나라도 인증되어 있으면 홈으로 이동
  const hasAnyAuth = isAuthenticated || isGoogleAuthenticated;

  return (
    <Switch>
      {!hasAnyAuth ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/communities" component={CommunitiesHub} />
          <Route path="/community" component={CommunitiesHub} />
          <Route path="/community/:id" component={CommunityDetail} />
          <Route path="/books" component={BooksPage} />
          <Route path="/books/:bookTitle" component={BookDetailPage} />
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
