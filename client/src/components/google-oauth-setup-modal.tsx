import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoogleOAuthSetupModalProps {
  open: boolean;
  onClose: () => void;
  currentDomain: string;
}

export function GoogleOAuthSetupModal({ open, onClose, currentDomain }: GoogleOAuthSetupModalProps) {
  const { toast } = useToast();
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(false);

  const handleCopyDomain = async () => {
    try {
      await navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      toast({
        title: "복사 완료",
        description: "현재 도메인이 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setCopiedDomain(false), 2000);
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "수동으로 복사해주세요: " + currentDomain,
        variant: "destructive",
      });
    }
  };

  const handleCopyClientId = async () => {
    const clientId = '664057699342-61far8pr8f65ptf6u8q6qq627kjt6nkn.apps.googleusercontent.com';
    try {
      await navigator.clipboard.writeText(clientId);
      setCopiedClientId(true);
      toast({
        title: "복사 완료",
        description: "클라이언트 ID가 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setCopiedClientId(false), 2000);
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "수동으로 복사해주세요.",
        variant: "destructive",
      });
    }
  };

  const openGoogleConsole = () => {
    window.open('https://console.cloud.google.com/apis/credentials', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Google OAuth 2.0 도메인 설정 필요</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ 도메인 인증 필요
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Google 로그인을 사용하려면 현재 Replit 도메인을 Google Cloud Console에 등록해야 합니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">설정 단계</h3>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <h4 className="font-medium">Google Cloud Console 열기</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Google Cloud Console의 API 및 서비스 {`>`} 사용자 인증 정보 페이지로 이동하세요.
                </p>
                <Button onClick={openGoogleConsole} variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Google Console 열기
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <h4 className="font-medium">클라이언트 ID 찾기</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  다음 클라이언트 ID를 찾아서 편집하세요:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 flex items-center justify-between">
                  <code className="text-sm break-all">664057699342-61far8pr8f65ptf6u8q6qq627kjt6nkn.apps.googleusercontent.com</code>
                  <Button
                    onClick={handleCopyClientId}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 ml-2"
                  >
                    {copiedClientId ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <h4 className="font-medium">승인된 JavaScript 출처 추가</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  클라이언트 ID를 편집하고 "승인된 JavaScript 출처"에 다음 도메인을 추가하세요:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 flex items-center justify-between">
                  <code className="text-sm break-all">{currentDomain}</code>
                  <Button
                    onClick={handleCopyDomain}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 ml-2"
                  >
                    {copiedDomain ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                  <h4 className="font-medium">설정 저장 및 테스트</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  변경사항을 저장하고 잠시 기다린 후(약 5분) Google 로그인 버튼을 다시 시도하세요.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💡 참고사항
            </h3>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>• Replit은 동적 도메인을 사용하므로 배포할 때마다 새 도메인이 생성될 수 있습니다.</li>
              <li>• 프로덕션 환경에서는 고정 도메인을 사용하는 것을 권장합니다.</li>
              <li>• 설정 변경 후 적용까지 몇 분 정도 소요될 수 있습니다.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={onClose} variant="outline">
              닫기
            </Button>
            <Button onClick={openGoogleConsole}>
              Google Console로 이동
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}