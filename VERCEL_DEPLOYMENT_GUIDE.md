# Vercel 배포 가이드

## 🚀 빠른 배포 방법

### 방법 1: Vercel 대시보드에서 Import (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. **"Add New..." → "Project"** 클릭
3. **"Import Git Repository"** 섹션에서 GitHub 연결
4. `bluebuchu/collect` 저장소 선택
5. 아래 환경 변수 추가:

```env
SESSION_SECRET=503fa2334e9f8ace551ba8de2854b3e48b9c067f183c219d97857a33a228a37d7a9d72d2efd87498d8d30d0826bfabc378d09f553fc15cecf773f5fe3c70009c
SUPABASE_URL=https://upemqhahrliikgtqqeor.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW1xaGFocmxpaWtndHFxZW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjMwODUsImV4cCI6MjA3MjE5OTA4NX0.d64QdZZnEcgAg0ncVh2SpiFUBERcRU6_NQrUeLT817s
SUPABASE_DATABASE_URL=postgresql://postgres.upemqhahrliikgtqqeor:pjJ5KwimsTmWqb6B@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
NODE_ENV=production
```

6. **"Deploy"** 클릭

### 방법 2: Vercel CLI 사용

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 연결 및 배포
vercel

# 4. 프로덕션 배포
vercel --prod
```

### 방법 3: GitHub Actions 자동 배포

1. Vercel 대시보드에서 프로젝트 생성 (방법 1의 1-4단계)
2. **Settings → General** 에서:
   - `VERCEL_ORG_ID` 복사
   - `VERCEL_PROJECT_ID` 복사
3. **Settings → Tokens** 에서 새 토큰 생성
4. GitHub 저장소 Settings → Secrets에 추가:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

이후 main 브랜치에 푸시하면 자동 배포됩니다.

## 🔧 배포 설정

### Build 설정
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### Node.js 버전
- package.json의 engines 필드에서 자동 감지: `20.x`

## 📝 배포 후 확인사항

1. **배포 URL 확인**
   - 기본: `https://collect.vercel.app`
   - 프리뷰: `https://collect-[branch-name].vercel.app`

2. **환경 변수 확인**
   - Vercel Dashboard → Settings → Environment Variables

3. **빌드 로그 확인**
   - 오류 발생 시 Functions 탭에서 로그 확인

## 🐛 문제 해결

### "Function Runtimes must have a valid version" 오류
- ✅ 해결됨: package.json에 engines 필드 추가

### JSON 파싱 오류
- ✅ 해결됨: API 에러 핸들링 개선

### 자동 배포가 안 되는 경우
1. GitHub Integration 확인:
   - Vercel Dashboard → Settings → Git
   - GitHub 저장소 권한 확인
2. Deploy Hooks 활성화 확인
3. Production Branch가 `main`으로 설정되어 있는지 확인

## 📞 지원

문제가 지속되면:
1. [Vercel Status](https://www.vercel-status.com/) 확인
2. [Vercel Support](https://vercel.com/support) 문의
3. GitHub Issues에 문제 보고