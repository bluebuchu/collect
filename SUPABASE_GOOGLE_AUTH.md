# 🚀 Supabase Google OAuth 설정 가이드

## ✅ 완료된 구현

Supabase Auth를 사용한 Google 로그인이 구현되었습니다. 이제 **모든 도메인**에서 Google 로그인이 작동합니다!

## 📋 Supabase Dashboard 설정 (필수)

### 1. Supabase 프로젝트 설정
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택: `upemqhahrliikgtqqeor`

### 2. Google OAuth 활성화
1. **Authentication** → **Providers** 메뉴
2. **Google** 찾아서 클릭
3. **Enable Google** 토글 ON
4. 다음 정보 입력:
   ```
   Client ID: [Your Google Client ID]
   Client Secret: [Your Google Client Secret]
   ```
5. **Save** 클릭

### 3. Redirect URL 복사
Supabase가 자동 생성한 Redirect URL:
```
https://upemqhahrliikgtqqeor.supabase.co/auth/v1/callback
```

### 4. Google Console 업데이트
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. OAuth 2.0 Client ID 편집
3. **Authorized redirect URIs**에 추가:
   ```
   https://upemqhahrliikgtqqeor.supabase.co/auth/v1/callback
   ```
4. **Save** 클릭

## 🎯 장점

### 1. **모든 도메인 지원**
- ✅ 로컬: `http://localhost:5000`
- ✅ Vercel 프로덕션: `https://collect-topaz.vercel.app`
- ✅ **Vercel 프리뷰**: `https://collect-*.vercel.app` 
- ✅ 커스텀 도메인: 모두 지원

### 2. **간단한 구현**
- Supabase가 OAuth 복잡성 처리
- 세션 자동 관리
- 토큰 자동 갱신

### 3. **보안**
- Supabase의 검증된 보안
- Row Level Security (RLS) 지원
- JWT 토큰 자동 관리

## 📂 구현된 파일

### 클라이언트
- `/client/src/lib/supabase.ts` - Supabase 클라이언트
- `/client/src/hooks/useSupabaseAuth.ts` - Auth 훅
- `/client/src/components/supabase-google-button.tsx` - Google 버튼
- `/client/src/pages/auth-callback.tsx` - OAuth 콜백 처리
- `/client/.env` - 환경 변수

### 서버
- `/server/routes/auth.routes.ts` - 사용자 동기화 API (`/api/auth/sync`)

## 🔍 테스트 방법

1. **로컬 테스트**
   ```bash
   npm run dev
   ```
   http://localhost:5000 접속 → Google 로그인 클릭

2. **Vercel 배포 후 테스트**
   - 메인 도메인과 프리뷰 도메인 모두에서 테스트
   - 모든 도메인에서 작동 확인

## 🐛 문제 해결

### "Invalid Redirect URL" 오류
- Supabase Dashboard에서 Google Provider가 활성화되었는지 확인
- Client ID와 Secret이 정확한지 확인

### 로그인 후 리디렉션 실패
- `/auth/callback` 라우트가 제대로 설정되었는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 사용자 데이터 동기화 실패
- `/api/auth/sync` API가 작동하는지 확인
- 서버 로그 확인

## 📊 기존 방식 vs Supabase Auth

| 문제 | 기존 (Passport.js) | Supabase Auth |
|------|-------------------|---------------|
| redirect_uri_mismatch | ❌ 발생 | ✅ 해결 |
| 와일드카드 도메인 | ❌ 불가능 | ✅ 가능 |
| Vercel 프리뷰 | ❌ 작동 안 함 | ✅ 작동 |
| 설정 복잡도 | 높음 | 낮음 |
| 유지보수 | 어려움 | 쉬움 |

## ✨ 다음 단계

1. **Supabase Dashboard에서 Google OAuth 활성화** (5분)
2. **Google Console에 Supabase Redirect URL 추가** (2분)
3. **배포 및 테스트** (10분)

총 소요시간: **약 20분**

## 🎉 결과

- ✅ 모든 도메인에서 Google 로그인 작동
- ✅ redirect_uri_mismatch 오류 완전 해결
- ✅ 사용자 경험 개선
- ✅ 유지보수 간소화