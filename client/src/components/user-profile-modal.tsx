import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useUpdateProfile } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, type UpdateUser } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2 } from "lucide-react";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      nickname: user?.nickname || "",
      bio: user?.bio || "",
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profileImage', file);
      // No need to send existing profile data - server will preserve it
      
      // Get JWT token from localStorage for authorization
      // Try multiple possible token keys
      const token = localStorage.getItem('auth_token') || 
                   localStorage.getItem('supabase_token') || 
                   localStorage.getItem('token');
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using JWT token for authorization');
      } else {
        console.log('No JWT token found, relying on session cookies');
      }
      
      console.log('Uploading profile image:', file.name, 'Size:', file.size);
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers,
        body: formData,
        credentials: 'include',
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        console.error('Upload error:', errorData);
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
        }
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Profile image uploaded successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sentences'] });
      toast({
        title: "성공",
        description: "프로필 이미지가 업로드되었습니다.",
      });
      setImagePreview(null);
      // Force refresh if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "이미지 업로드에 실패했습니다.",
        variant: "destructive",
      });
      setImagePreview(null);
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "오류",
          description: "이미지 파일만 업로드할 수 있습니다.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "오류",
          description: "파일 크기는 5MB 이하여야 합니다.",
          variant: "destructive",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image
      uploadImageMutation.mutate(file);
    }
  };

  const onSubmit = async (data: UpdateUser) => {
    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync(data);
      toast({
        title: "성공",
        description: "프로필이 업데이트되었습니다.",
      });
      onClose();
    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        title: "오류",
        description: "프로필 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (user && open) {
      reset({
        nickname: user.nickname,
        bio: user.bio || "",
      });
      setImagePreview(null);
    }
  }, [user, open, reset]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로필 편집</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={imagePreview || user.profileImage || undefined} />
                <AvatarFallback className="text-2xl">
                  {(user.nickname || user.email || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadImageMutation.isPending}
              >
                {uploadImageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                프로필 이미지를 변경하려면 카메라 아이콘을 클릭하세요
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG 파일, 최대 5MB
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                {...register("nickname")}
                placeholder="닉네임을 입력하세요"
              />
              {errors.nickname && (
                <p className="text-sm text-red-500 mt-1">{errors.nickname.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">소개</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="자기소개를 입력하세요 (선택사항)"
                rows={3}
              />
              {errors.bio && (
                <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}