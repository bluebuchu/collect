# ✅ Vercel 환경 변수 설정 체크리스트

## 📋 필수 환경 변수

### 1. Supabase Auth (필수)
```env
VITE_SUPABASE_URL=https://fbvhaeqfylrdhvvdcwzh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidmhhZXFmeWxyZGh2dmRjd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTA0OTcsImV4cCI6MjA3Njg2NjQ5N30.VOY-V-BG-9OS3n-R-S95kWxIeAGfnPzdPM_62lUJThE
```

### 2. 기존 환경 변수 (유지)
```env
SUPABASE_URL=https://fbvhaeqfylrdhvvdcwzh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidmhhZXFmeWxyZGh2dmRjd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTA0OTcsImV4cCI6MjA3Njg2NjQ5N30.VOY-V-BG-9OS3n-R-S95kWxIeAGfnPzdPM_62lUJThE
SUPABASE_DATABASE_URL=postgresql://postgres:s3DrvDjukytv2AEB@db.fbvhaeqfylrdhvvdcwzh.supabase.co:5432/postgres
SESSION_SECRET=generate-secure-random-string-here
NODE_ENV=production
```

## 🚫 제거할 환경 변수

다음 변수들은 **삭제**하세요 (Supabase Auth 사용으로 불필요):
- ❌ `GOOGLE_CLIENT_ID`
- ❌ `GOOGLE_CLIENT_SECRET`  
- ❌ `GOOGLE_REDIRECT_URI`

## 📝 Vercel Dashboard 설정 방법

1. **Vercel Dashboard 접속**
   https://vercel.com/dashboard

2. **프로젝트 선택**
   `collect` 또는 해당 프로젝트 클릭

3. **Settings → Environment Variables**

4. **변수 추가**
   - Key: `VITE_SUPABASE_URL`
   - Value: 위의 URL 복사/붙여넣기
   - Environment: ✅ Production, ✅ Preview, ✅ Development

5. **Save 클릭**

6. **재배포**
   - Deployments 탭 → 최신 배포 → Redeploy

## 🔍 Supabase Dashboard 확인

1. **[Supabase Dashboard](https://app.supabase.com) 접속**

2. **Authentication → URL Configuration**
   
3. **Site URL 설정**
   ```
   https://collect-topaz.vercel.app
   ```

4. **Redirect URLs 추가**
   ```
   https://collect-topaz.vercel.app/**
   https://*.vercel.app/**
   http://localhost:5000/**
   http://localhost:5173/**
   ```

## ✅ 최종 체크리스트

- [ ] Vercel 환경 변수 추가 완료
- [ ] 구 Google OAuth 변수 제거
- [ ] Supabase Site URL 설정
- [ ] Supabase Redirect URLs 추가
- [ ] Vercel 재배포
- [ ] 프로덕션 테스트

## 🎯 예상 결과

배포 후 다음 모든 도메인에서 Google 로그인 가능:
- ✅ https://collect-topaz.vercel.app (프로덕션)
- ✅ https://collect-*.vercel.app (프리뷰)
- ✅ 커스텀 도메인 (설정 시)

## 🐛 문제 해결

**"Invalid Redirect URL" 오류**
- Supabase URL Configuration 확인
- Site URL이 정확한지 확인

**로그인 후 리디렉션 안 됨**
- `/auth/callback` 라우트 확인
- 브라우저 콘솔 에러 확인

**환경 변수 인식 안 됨**
- Vercel 재배포 필요
- 변수 이름이 `VITE_`로 시작하는지 확인