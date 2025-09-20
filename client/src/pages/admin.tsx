import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Users, FileText, LogOut, Shield } from "lucide-react";

interface User {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
  sentenceCount?: number;
}

interface Sentence {
  id: number;
  content: string;
  userId: number | null;
  userNickname?: string;
  bookTitle?: string;
  createdAt: string;
  likes: number;
}

interface AdminData {
  users: User[];
  sentences: Sentence[];
  stats: {
    totalUsers: number;
    totalSentences: number;
    totalLikes: number;
  };
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if already authenticated
  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth) {
      const authData = JSON.parse(auth);
      if (new Date().getTime() - authData.time < 30 * 60 * 1000) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("adminAuth");
      }
    }
  }, []);

  // Fetch admin data
  const { data, isLoading, error, refetch } = useQuery<AdminData>({
    queryKey: ["/api/admin/data"],
    queryFn: async () => {
      const response = await fetch("/api/admin/data", {
        headers: {
          "X-Admin-Auth": localStorage.getItem("adminAuth") || "",
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem("adminAuth");
        }
        throw new Error("Failed to fetch admin data");
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        throw new Error("Invalid password");
      }
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("adminAuth", JSON.stringify({
        token: data.token,
        time: new Date().getTime(),
      }));
      setIsAuthenticated(true);
      toast({
        title: "로그인 성공",
        description: "관리자 페이지에 접속했습니다.",
      });
    },
    onError: () => {
      toast({
        title: "로그인 실패",
        description: "비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "user" | "sentence"; id: number }) => {
      const response = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Auth": localStorage.getItem("adminAuth") || "",
        },
        body: JSON.stringify({ type, id }),
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "삭제 완료",
        description: `${variables.type === "user" ? "사용자" : "문장"}이 삭제되었습니다.`,
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(password);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    setPassword("");
    toast({
      title: "로그아웃",
      description: "관리자 페이지에서 로그아웃했습니다.",
    });
  };

  const handleDelete = (type: "user" | "sentence", id: number) => {
    if (window.confirm(`정말로 이 ${type === "user" ? "사용자를" : "문장을"} 삭제하시겠습니까?`)) {
      deleteMutation.mutate({ type, id });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              관리자 로그인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="관리자 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="mt-2">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Alert variant="destructive">
          <AlertDescription>데이터를 불러오는 중 오류가 발생했습니다.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              관리자 페이지
            </h1>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 사용자</p>
                  <p className="text-2xl font-bold">{data.stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 문장</p>
                  <p className="text-2xl font-bold">{data.stats.totalSentences}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 좋아요</p>
                  <p className="text-2xl font-bold">{data.stats.totalLikes}</p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  ❤️ {data.stats.totalLikes}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="sentences">문장 관리</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>사용자 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>닉네임</TableHead>
                        <TableHead>문장 수</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.nickname}</TableCell>
                          <TableCell>{user.sentenceCount || 0}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleDelete("user", user.id)}
                              variant="destructive"
                              size="sm"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sentences Tab */}
          <TabsContent value="sentences">
            <Card>
              <CardHeader>
                <CardTitle>문장 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead className="min-w-[200px]">내용</TableHead>
                        <TableHead>작성자</TableHead>
                        <TableHead>책 제목</TableHead>
                        <TableHead>좋아요</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.sentences.map((sentence) => (
                        <TableRow key={sentence.id}>
                          <TableCell>{sentence.id}</TableCell>
                          <TableCell className="max-w-xs truncate">{sentence.content}</TableCell>
                          <TableCell>{sentence.userNickname || "익명"}</TableCell>
                          <TableCell>{sentence.bookTitle || "-"}</TableCell>
                          <TableCell>{sentence.likes}</TableCell>
                          <TableCell>{new Date(sentence.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleDelete("sentence", sentence.id)}
                              variant="destructive"
                              size="sm"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}