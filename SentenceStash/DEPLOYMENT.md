# 배포 가이드

## 배포 준비 체크리스트

### ✅ 완료된 항목
1. **Supabase 연결 설정** ✅
   - 데이터베이스 연결 정상 작동
   - 모든 CRUD 작업 테스트 완료
   
2. **데이터베이스 스키마** ✅
   - 모든 테이블 생성 완료
   - 마이그레이션 적용 완료

3. **빌드 시스템** ✅
   - 프로덕션 빌드 성공
   - 클라이언트 및 서버 번들링 완료

### ⚠️ 배포 전 필수 설정

1. **환경 변수 설정**
   ```bash
   # .env 파일을 .env.example을 참고하여 생성
   cp .env.example .env
   ```
   
   필수 환경 변수:
   - `SESSION_SECRET`: 강력한 무작위 문자열로 변경 필요
   - `NODE_ENV`: `production`으로 설정
   - `GOOGLE_REDIRECT_URI`: 실제 도메인으로 변경

2. **보안 설정**
   - `.env` 파일이 `.gitignore`에 포함되어 있음 ✅
   - 민감한 정보는 환경 변수로 관리 중 ✅

## 배포 방법

### 옵션 1: Vercel 배포 (추천) 🚀

#### 사전 준비
1. **SESSION_SECRET 생성**
   ```bash
   node generate-secret.js
   # 생성된 시크릿을 안전하게 보관하세요
   ```

2. **Google OAuth 설정 업데이트** (선택사항)
   - [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
   - OAuth 2.0 클라이언트 ID 수정
   - Authorized redirect URIs에 추가:
     - `https://your-app.vercel.app/api/auth/google/callback`
     - `https://your-custom-domain.com/api/auth/google/callback`

#### Vercel 배포 단계

1. **Vercel CLI 설치 및 로그인**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **프로젝트 배포**
   ```bash
   vercel
   # 프롬프트에 따라 설정:
   # - Set up and deploy? Yes
   # - Which scope? Your account
   # - Link to existing project? No (첫 배포시)
   # - Project name? sentence-stash (원하는 이름)
   # - Directory? ./ (현재 디렉토리)
   # - Override settings? No
   ```

3. **환경 변수 설정**
   
   방법 1: Vercel 대시보드에서 설정 (권장)
   - [Vercel Dashboard](https://vercel.com/dashboard) 접속
   - 프로젝트 선택 > Settings > Environment Variables
   - 다음 변수들 추가:
   
   ```env
   # 필수 변수
   SESSION_SECRET=생성한_시크릿_값
   SUPABASE_URL=https://upemqhahrliikgtqqeor.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_DATABASE_URL=postgresql://...
   
   # 선택 변수 (Google OAuth)
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/google/callback
   ```
   
   방법 2: CLI로 설정
   ```bash
   vercel env add SESSION_SECRET production
   vercel env add SUPABASE_URL production
   # ... 각 변수에 대해 반복
   ```

4. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

#### 배포 완료 후 확인
- 배포 URL: `https://your-app.vercel.app`
- 환경 변수 확인: Vercel Dashboard > Settings
- 로그 확인: Vercel Dashboard > Functions > Logs

### 옵션 2: 일반 VPS 배포
```bash
# 1. 코드 클론
git clone [your-repo-url]
cd SentenceStash

# 2. 의존성 설치
npm install

# 3. 프로덕션 빌드
npm run build

# 4. PM2로 실행 (선택사항)
npm install -g pm2
pm2 start dist/index.js --name sentence-stash

# 5. Nginx 리버스 프록시 설정 (선택사항)
```

### 옵션 3: Docker 배포
```dockerfile
# Dockerfile 생성 필요
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

## 배포 후 확인사항

1. **데이터베이스 연결 테스트**
   ```bash
   npx tsx test-supabase-connection.js
   ```

2. **CRUD 작업 테스트**
   ```bash
   npx tsx test-supabase-crud.js
   ```

3. **애플리케이션 헬스체크**
   - `/api/health` 엔드포인트 확인
   - 로그인/회원가입 기능 테스트
   - 문장 CRUD 기능 테스트

## 주의사항

- **Node.js 버전**: 20.x 이상 권장 (현재 18.x는 deprecated 경고)
- **SSL 인증서**: 프로덕션 환경에서는 HTTPS 필수
- **백업**: 정기적인 데이터베이스 백업 설정 권장

## 문제 해결

### 데이터베이스 연결 실패
- Supabase 대시보드에서 Database URL 확인
- 네트워크 방화벽 설정 확인

### 빌드 실패
- Node.js 버전 확인
- 의존성 재설치: `rm -rf node_modules && npm install`

### 런타임 에러
- 환경 변수 설정 확인
- 로그 확인: `pm2 logs` 또는 배포 플랫폼 로그