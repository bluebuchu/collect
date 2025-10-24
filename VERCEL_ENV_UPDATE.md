# 🚀 Vercel 환경 변수 업데이트 가이드

## ✅ 완료된 작업
1. Supabase 프로젝트 변경 완료 (fbvhaeqfylrdhvvdcwzh)
2. 올바른 Pooler 연결 문자열 찾음 (aws-1 서버 사용)
3. 로컬 환경에서 데이터베이스 연결 성공
4. 테이블 마이그레이션 완료

## 🔧 Vercel Dashboard에 업데이트할 환경 변수

### 1. Supabase 설정 (필수)
```env
SUPABASE_URL=https://fbvhaeqfylrdhvvdcwzh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidmhhZXFmeWxyZGh2dmRjd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTA0OTcsImV4cCI6MjA3Njg2NjQ5N30.VOY-V-BG-9OS3n-R-S95kWxIeAGfnPzdPM_62lUJThE
SUPABASE_DATABASE_URL=postgresql://postgres.fbvhaeqfylrdhvvdcwzh:s3DrvDjukytv2AEB@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### 2. Vite용 환경 변수 (클라이언트용)
```env
VITE_SUPABASE_URL=https://fbvhaeqfylrdhvvdcwzh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidmhhZXFmeWxyZGh2dmRjd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTA0OTcsImV4cCI6MjA3Njg2NjQ5N30.VOY-V-BG-9OS3n-R-S95kWxIeAGfnPzdPM_62lUJThE
```

## 📝 Vercel Dashboard 업데이트 방법

1. **[Vercel Dashboard](https://vercel.com/dashboard)** 접속
2. **collect 프로젝트** 선택
3. **Settings** → **Environment Variables**
4. 각 변수를 찾아서 **Edit** 클릭
5. 새 값으로 업데이트
6. **Save** 클릭
7. **모든 환경 (Production, Preview, Development)** 에 적용

## 🔄 재배포

환경 변수 업데이트 후:
1. **Deployments** 탭으로 이동
2. 최신 배포 찾기
3. **⋮** 메뉴 클릭 → **Redeploy**
4. **Redeploy** 확인

## ✅ 확인 사항

- 현재 프로덕션 사이트는 정상 동작 중 (https://collect-topaz.vercel.app)
- 데이터베이스 연결 성공
- 테이블 생성 완료:
  - book_club_members
  - book_club_milestones
  - book_club_sentences
  - book_clubs
  - books
  - communities
  - community_members
  - community_sentences
  - password_reset_tokens
  - sentence_likes
  - sentences
  - user_books
  - users

## 🎯 중요 사항

- **aws-1-ap-northeast-2** 서버를 사용해야 함 (aws-0 아님)
- Session mode (포트 5432) 사용 중
- SSL 필수 설정됨
- 사용자명 형식: `postgres.fbvhaeqfylrdhvvdcwzh`

## 🚨 문제 해결

만약 연결 실패 시:
1. Supabase Dashboard에서 Connection String 확인
2. Pooler 활성화 여부 확인
3. 프로젝트 ID 확인: fbvhaeqfylrdhvvdcwzh
4. 비밀번호 확인: s3DrvDjukytv2AEB