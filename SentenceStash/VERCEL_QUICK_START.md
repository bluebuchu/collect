# 🚀 Vercel 빠른 배포 가이드

## 5분 안에 배포하기

### 1️⃣ 자동 배포 스크립트 실행
```bash
./vercel-deploy.sh
```

### 2️⃣ 수동 배포 (대안)

#### Step 1: SESSION_SECRET 생성
```bash
node generate-secret.js
# 출력된 시크릿을 복사해두세요
```

#### Step 2: Vercel 배포
```bash
npm i -g vercel  # CLI 설치
vercel           # 배포 시작
```

#### Step 3: 환경 변수 설정
[Vercel Dashboard](https://vercel.com/dashboard)에서:

| 변수명 | 값 | 필수 |
|--------|-----|------|
| SESSION_SECRET | `generate-secret.js`로 생성한 값 | ✅ |
| SUPABASE_URL | https://upemqhahrliikgtqqeor.supabase.co | ✅ |
| SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | ✅ |
| SUPABASE_DATABASE_URL | postgresql://postgres... | ✅ |
| GOOGLE_CLIENT_ID | Google OAuth Client ID | ⭕ |
| GOOGLE_CLIENT_SECRET | Google OAuth Secret | ⭕ |
| GOOGLE_REDIRECT_URI | https://your-app.vercel.app/api/auth/google/callback | ⭕ |

#### Step 4: 프로덕션 배포
```bash
vercel --prod
```

## ✅ 배포 확인

1. **사이트 접속**: `https://your-app.vercel.app`
2. **기능 테스트**:
   - 회원가입/로그인
   - 문장 생성/조회/수정/삭제
   - Google OAuth (설정한 경우)

## 🔧 문제 해결

### 환경 변수 오류
- Vercel Dashboard > Settings > Environment Variables 확인
- 모든 필수 변수가 설정되어 있는지 확인

### 빌드 실패
```bash
npm run build  # 로컬에서 빌드 테스트
npm install    # 의존성 재설치
```

### 데이터베이스 연결 실패
- Supabase Dashboard에서 Database URL 확인
- Connection Pooling 활성화 확인

## 📝 중요 체크리스트

- [ ] SESSION_SECRET 생성 및 설정
- [ ] Supabase 환경 변수 설정
- [ ] Google OAuth URI 업데이트 (사용하는 경우)
- [ ] 프로덕션 배포 완료
- [ ] 배포된 사이트 테스트

## 🎉 완료!

배포가 완료되었습니다! 문제가 있다면 `DEPLOYMENT.md`를 참조하세요.