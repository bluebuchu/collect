# 📋 Vercel 환경 변수 설정 가이드

## 🔴 필수 환경 변수 (반드시 설정해야 함)

Vercel Dashboard > Settings > Environment Variables에서 다음 변수들을 추가하세요:

### 1. SESSION_SECRET
```
SESSION_SECRET=0d200bf0d81bccab18b17dd71611ed94f8108112e7ab05214129f32c2fa7c499c325c82ae954d7933c6937afbe16c13537f29d028b53786e97be1cda7bceae5e
```
✅ 위 값을 그대로 복사해서 사용하세요

### 2. SUPABASE_URL
```
SUPABASE_URL=https://upemqhahrliikgtqqeor.supabase.co
```
✅ 위 값을 그대로 복사해서 사용하세요

### 3. SUPABASE_ANON_KEY
```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW1xaGFocmxpaWtndHFxZW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMwMTk0ODMsImV4cCI6MjAzODU5NTQ4M30.IShp6CoAiEO4O5DuVrAx00kxpGeDamdlO-vXIFXnQqU
```
⚠️ 이 값은 예시입니다. Supabase Dashboard에서 실제 값을 확인하세요:
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Settings > API
4. "anon public" 키 복사

### 4. SUPABASE_DATABASE_URL
```
SUPABASE_DATABASE_URL=postgresql://postgres.upemqhahrliikgtqqeor:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
```
⚠️ [YOUR-PASSWORD]를 실제 비밀번호로 교체하세요:
1. Supabase Dashboard > Settings > Database
2. "Connection string" 섹션
3. "URI" 탭 선택
4. 전체 URL 복사

### 5. NODE_ENV
```
NODE_ENV=production
```
✅ 위 값을 그대로 복사해서 사용하세요

---

## 🟡 선택적 환경 변수 (필요시 설정)

### Google OAuth (로그인 기능 사용시)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://[your-vercel-app].vercel.app/api/auth/google/callback
```

### CORS 설정 (특정 도메인만 허용시)
```
ALLOWED_ORIGINS=https://[your-vercel-app].vercel.app
```

---

## 🚀 Vercel에서 환경 변수 추가하는 방법

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - `collect` 프로젝트 클릭

3. **Settings 탭 이동**
   - 상단 메뉴에서 "Settings" 클릭

4. **Environment Variables 섹션**
   - 왼쪽 메뉴에서 "Environment Variables" 클릭

5. **변수 추가**
   - Key: 변수명 (예: SESSION_SECRET)
   - Value: 변수값 (위에서 제공한 값)
   - Environment: Production, Preview, Development 모두 체크
   - "Add" 버튼 클릭

6. **모든 필수 변수 추가 후**
   - 페이지 상단의 "Redeploy" 버튼 클릭
   - 최신 commit 선택 후 재배포

---

## ✅ 체크리스트

- [ ] SESSION_SECRET 추가
- [ ] SUPABASE_URL 추가
- [ ] SUPABASE_ANON_KEY 추가 (실제 값으로)
- [ ] SUPABASE_DATABASE_URL 추가 (실제 값으로)
- [ ] NODE_ENV=production 추가
- [ ] 재배포 실행

---

## 🆘 문제 해결

### Supabase 키를 모르겠어요
1. https://supabase.com/dashboard 로그인
2. 프로젝트가 없다면 새로 생성
3. Settings > API에서 키 확인

### 배포 후에도 오류가 발생해요
1. Vercel Dashboard > Functions 탭
2. 로그 확인
3. 환경 변수가 모두 설정되었는지 확인

### 데이터베이스 연결 오류
1. Supabase Dashboard > Settings > Database
2. Connection Pooling 활성화 확인
3. DATABASE_URL의 비밀번호 확인