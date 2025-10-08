# 🔧 Google OAuth redirect_uri_mismatch 해결 완료

## ✅ 구현된 해결책

### 1. **도메인별 OAuth 지원 제한**
- ✅ **로컬 개발**: `http://localhost:5000`
- ✅ **Vercel 프로덕션**: `https://collect-topaz.vercel.app`  
- ❌ **Vercel 프리뷰**: 지원하지 않음 (Google이 와일드카드 도메인 허용 안 함)

### 2. **조건부 Google 로그인 버튼**
- 허용된 도메인에서만 Google 로그인 버튼 표시
- 프리뷰 환경에서는 안내 메시지 표시
- 일반 이메일/비밀번호 로그인은 모든 환경에서 가능

### 3. **자동 도메인 감지**
```typescript
// server/auth.ts
const ALLOWED_OAUTH_DOMAINS = [
  'localhost:5000',
  'collect-topaz.vercel.app',
];
```

## 📝 Google Cloud Console 설정

### 필수 설정 (한 번만)
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. OAuth 2.0 Client ID 편집
3. **Authorized redirect URIs**에 정확히 다음 추가:
   ```
   http://localhost:5000/api/auth/google/callback
   https://collect-topaz.vercel.app/api/auth/google/callback
   ```
   ⚠️ **주의**: URL이 정확히 일치해야 함 (슬래시 포함)

## 🚀 Vercel 배포 설정

### 환경 변수 (Vercel Dashboard)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_REDIRECT_URI는 설정하지 마세요 (자동 감지됨)
```

## 🎯 작동 방식

### 지원되는 환경
| 환경 | URL | Google OAuth | 일반 로그인 |
|------|-----|--------------|------------|
| 로컬 개발 | http://localhost:5000 | ✅ | ✅ |
| Vercel 프로덕션 | https://collect-topaz.vercel.app | ✅ | ✅ |
| Vercel 프리뷰 | https://collect-xxxxx.vercel.app | ❌ | ✅ |
| 커스텀 도메인 | https://your-domain.com | ⚠️ 설정 필요 | ✅ |

### 프리뷰 환경 메시지
프리뷰 환경에서는 다음과 같은 메시지가 표시됩니다:
```
Google 로그인 사용 불가
Vercel 프리뷰 환경에서는 Google 로그인을 사용할 수 없습니다.
메인 도메인에서 사용하거나 일반 로그인을 이용해주세요.
```

## 🐛 문제 해결

### "redirect_uri_mismatch" 오류
✅ **해결됨**: 프리뷰 환경에서는 Google OAuth 버튼이 표시되지 않음

### 커스텀 도메인 추가하기
1. Google Console에 새 redirect URI 추가
2. `server/auth.ts`의 `ALLOWED_OAUTH_DOMAINS` 배열에 도메인 추가
3. 재배포

## 📊 기술적 세부사항

### 서버 측 변경사항
- `isGoogleOAuthAllowed()`: 도메인 검증 함수
- 동적 redirect URI 생성 로직
- Vercel 환경 변수 자동 감지

### 클라이언트 측 변경사항  
- `useGoogleAuth`: OAuth 가능 여부 확인
- `GoogleAuthButton`: 조건부 렌더링
- 사용자 친화적 오류 메시지

## ✨ 장점

1. **보안**: 승인된 도메인만 OAuth 사용 가능
2. **사용자 경험**: 명확한 안내 메시지
3. **유연성**: 새 도메인 쉽게 추가 가능
4. **안정성**: 프리뷰 환경 오류 방지

## 🔮 향후 개선 사항

- 프리뷰 환경을 위한 대체 인증 방법 고려
- 중앙 인증 서버 구축 (선택사항)
- 다른 OAuth 제공자 추가 (GitHub, Naver 등)