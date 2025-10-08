import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Lock, User, Edit } from "lucide-react";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ForgotPasswordModal from "@/components/forgot-password-modal";
import FindEmailModal from "@/components/find-email-modal";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { SupabaseGoogleButton } from "@/components/supabase-google-button";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export default function AuthModal({ open, onClose, defaultTab = "login" }: AuthModalProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    nickname: "", 
    bio: "" 
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showFindEmail, setShowFindEmail] = useState(false);
  
  const { toast } = useToast();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await loginMutation.mutateAsync(loginData);
      console.log("Login successful:", result);
      
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
      
      // 로그인 성공 후 쿼리 캐시 무효화 및 새로고침
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      onClose();
      
      // 약간의 지연 후 페이지 새로고침으로 완전한 상태 초기화
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "로그인 실패",
        description: error.message || "로그인에 실패했습니다.",
        variant: "destructive",
      });
      setShowFindEmail(false);
      setShowForgotPassword(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await registerMutation.mutateAsync(registerData);
      console.log("Register successful:", result);
      
      toast({
        title: "회원가입 성공",
        description: "계정이 생성되었습니다. 환영합니다!",
      });
      
      // 회원가입 성공 후 쿼리 캐시 무효화 및 새로고침
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      onClose();
      
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error: any) {
      console.error("Register error:", error);
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-medium" style={{ fontFamily: "'Pretendard', sans-serif" }}>
              문장수집가
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="register">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="이메일 주소"
                    className="pl-10 py-3"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="비밀번호"
                    className="pl-10 py-3"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-black text-white hover:bg-gray-800 py-3"
                  style={{ fontFamily: "'Pretendard', sans-serif" }}
                >
                  {loginMutation.isPending ? "로그인 중..." : "로그인"}
                </Button>

                {/* 구분선 */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                      또는
                    </span>
                  </div>
                </div>

                {/* Supabase Google 로그인 버튼 (모든 도메인 지원) */}
                <SupabaseGoogleButton className="w-full" />

                {/* 아이디/비밀번호 찾기 링크 */}
                <div className="flex justify-center gap-4 text-sm mt-4">
                  <button
                    type="button"
                    onClick={() => setShowFindEmail(true)}
                    className="text-gray-600 hover:text-gray-800 underline transition-colors"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                  >
                    이메일 찾기
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-gray-600 hover:text-gray-800 underline transition-colors"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                  >
                    비밀번호 찾기
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="이메일 주소"
                    className="pl-10 py-3"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="비밀번호 (최소 6자)"
                    className="pl-10 py-3"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                    required
                    minLength={6}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={registerData.nickname}
                    onChange={(e) => setRegisterData({ ...registerData, nickname: e.target.value })}
                    placeholder="닉네임 (최소 2자)"
                    className="pl-10 py-3"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>
                <div className="relative">
                  <Edit className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Textarea
                    value={registerData.bio}
                    onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                    placeholder="간단한 소개 (선택사항, 최대 200자)"
                    className="pl-10 py-3 min-h-[80px] resize-none"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                    maxLength={200}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-black text-white hover:bg-gray-800 py-3"
                  style={{ fontFamily: "'Pretendard', sans-serif" }}
                >
                  {registerMutation.isPending ? "가입 중..." : "회원가입"}
                </Button>

                {/* 구분선 */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                      또는
                    </span>
                  </div>
                </div>

                {/* Google 회원가입 버튼 */}
                <GoogleAuthButton className="w-full" />
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 모달들 */}
      <ForgotPasswordModal 
        open={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
      <FindEmailModal 
        open={showFindEmail} 
        onClose={() => setShowFindEmail(false)} 
      />
    </>
  );
}