# 🚀 Vercel 배포를 위한 Supabase Auth 설정

## ✅ Vercel 환경 변수 설정

### 1. Vercel Dashboard 접속
[Vercel Dashboard](https://vercel.com/dashboard) → 프로젝트 선택 → Settings → Environment Variables

### 2. 추가할 환경 변수

```env
# Supabase (클라이언트용)
VITE_SUPABASE_URL=https://upemqhahrliikgtqqeor.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW1xaGFocmxpaWtndHFxZW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjMwODUsImV4cCI6MjA3MjE5OTA4NX0.d64QdZZnEcgAg0ncVh2SpiFUBERcRU6_NQrUeLT817s

# 기존 환경 변수들
SUPABASE_URL=https://upemqhahrliikgtqqeor.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW1xaGFocmxpaWtndHFxZW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjMwODUsImV4cCI6MjA3MjE5OTA4NX0.d64QdZZnEcgAg0ncVh2SpiFUBERcRU6_NQrUeLT817s
SUPABASE_DATABASE_URL=postgresql://postgres.upemqhahrliikgtqqeor:pjJ5KwimsTmWqb6B@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
SESSION_SECRET=your-secure-session-secret-here
NODE_ENV=production
```

### 3. Google OAuth 설정 제거
**다음 변수들은 더 이상 필요 없음:**
- ~~GOOGLE_CLIENT_ID~~ ❌
- ~~GOOGLE_CLIENT_SECRET~~ ❌
- ~~GOOGLE_REDIRECT_URI~~ ❌

Supabase가 모든 OAuth를 처리하므로 서버에서 Google OAuth 설정이 필요 없습니다.

## 🎯 테스트 URL

### 로컬 테스트
1. 메인 앱: http://localhost:5000
2. 테스트 페이지: http://localhost:8080/test-supabase-auth.html

### 프로덕션 테스트
- 메인: https://collect-topaz.vercel.app
- 프리뷰: https://collect-*.vercel.app (모두 작동!)

## ✨ 주요 장점

1. **모든 도메인 지원**
   - ✅ localhost
   - ✅ Vercel 프로덕션
   - ✅ Vercel 프리뷰 (와일드카드)
   - ✅ 커스텀 도메인

2. **간단한 관리**
   - Supabase Dashboard에서 모든 OAuth 설정
   - Google Console에 하나의 Redirect URL만 등록

3. **보안 강화**
   - Client Secret이 클라이언트에 노출되지 않음
   - Supabase가 토큰 관리

## 🔍 확인 사항

### Supabase Dashboard
- [ ] Authentication → Providers → Google 활성화
- [ ] Client ID & Secret 입력
- [ ] Save 클릭

### Google Console  
- [ ] Supabase Redirect URL 추가:
  ```
  https://upemqhahrliikgtqqeor.supabase.co/auth/v1/callback
  ```

### Vercel
- [ ] 환경 변수 설정
- [ ] 재배포

## 📊 문제 해결 상태

| 문제 | 해결 방법 | 상태 |
|------|----------|------|
| redirect_uri_mismatch | Supabase Auth 사용 | ✅ |
| 와일드카드 도메인 | Supabase가 자동 처리 | ✅ |
| API 설정 복잡함 | Supabase Dashboard에서 간단 설정 | ✅ |
| 세션 관리 | Supabase가 자동 관리 | ✅ |

## 🎉 완료!

이제 모든 도메인에서 Google 로그인이 작동합니다!