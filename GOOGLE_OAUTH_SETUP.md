# Google OAuth 설정 가이드

## ✅ 구현 완료

Google OAuth 로그인 기능이 완전히 구현되었습니다. 서버 측 OAuth 2.0을 사용하여 안전하게 인증을 처리합니다.

## 🚀 로컬 테스트

현재 로컬 환경(http://localhost:5000)에서 Google OAuth가 정상 작동 중입니다.

```bash
# 서버 실행
npm run dev

# 브라우저에서 접속
http://localhost:5000
```

## 📝 Google Cloud Console 설정

### 1. OAuth 2.0 클라이언트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. "APIs & Services" > "Credentials" 이동
3. "Create Credentials" > "OAuth client ID" 선택
4. Application type: "Web application" 선택

### 2. 승인된 리디렉션 URI 추가
다음 URI들을 모두 추가해주세요:

```
# 로컬 개발
http://localhost:5000/api/auth/google/callback

# Vercel 배포 (프로덕션)
https://collect-topaz.vercel.app/api/auth/google/callback
https://your-custom-domain.com/api/auth/google/callback
```

### 3. 클라이언트 ID와 Secret 복사
생성된 OAuth 2.0 클라이언트에서:
- Client ID 복사
- Client Secret 복사

## 🔧 Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 추가하세요:

```env
# Google OAuth (필수)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 선택 사항 (자동 설정됨)
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/auth/google/callback
```

### Vercel에서 환경 변수 추가 방법:
1. Vercel 대시보드 > 프로젝트 선택
2. "Settings" 탭
3. "Environment Variables" 섹션
4. 변수 추가 후 "Save"
5. 재배포 필요 (자동 또는 수동)

## 🎯 기능 특징

### 서버 측 OAuth 2.0
- Passport.js와 Google OAuth 2.0 전략 사용
- 서버에서 안전하게 토큰 처리
- 세션 기반 인증 관리

### 사용자 경험
- 원클릭 Google 로그인
- 자동 프로필 정보 가져오기
- 기존 계정과 자동 연동
- 다크 모드 지원

### 보안
- Client Secret은 서버에서만 사용
- HTTPS 리디렉션 URI 강제
- 세션 기반 상태 관리

## 🐛 문제 해결

### "redirect_uri_mismatch" 오류
- Google Console에서 리디렉션 URI가 정확히 일치하는지 확인
- 프로토콜(http/https), 도메인, 포트, 경로 모두 확인

### 로그인 후 리디렉션 실패
- 세션 쿠키 설정 확인
- CORS 설정 확인
- 브라우저 쿠키 설정 확인

### Vercel 배포 시 작동 안 함
- 환경 변수가 올바르게 설정되었는지 확인
- 재배포 필요할 수 있음
- Google Console에 Vercel 도메인 추가 확인

## 📊 테스트 결과

✅ 로컬 환경 테스트: **성공**
- OAuth 리디렉션: 정상
- 세션 생성: 정상
- 사용자 정보 저장: 정상

## 🔍 다음 단계

1. Vercel에 배포
2. 프로덕션 도메인으로 Google Console 업데이트
3. 실제 사용자 테스트
4. 모니터링 및 로그 확인