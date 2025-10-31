# 🔧 DB 연결 문제 해결 가이드

## 문제 증상
- 로컬 환경에서는 정상 작동
- Vercel 배포 환경에서 `"Connection terminated due to connection timeout"` 에러 발생
- 문장 등록 시 401 에러 후 타임아웃

## 원인
Supabase Pooler 모드 사용 시 포트 번호 설정 오류

## 해결 방법

### ❌ 잘못된 설정 (포트 5432)
```
postgresql://postgres.fbvhaeqfylrdhvvdcwzh:패스워드@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### ✅ 올바른 설정 (포트 6543)
```
postgresql://postgres.fbvhaeqfylrdhvvdcwzh:패스워드@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
```

## Supabase 연결 모드별 포트

| 연결 모드 | 호스트 | 포트 |
|---------|--------|------|
| Direct | db.프로젝트ID.supabase.co | 5432 |
| Pooler (Transaction) | aws-리전.pooler.supabase.com | **6543** |
| Pooler (Session) | aws-리전.pooler.supabase.com | **5432** |

## Vercel 환경변수 설정

1. [Vercel Dashboard](https://vercel.com) 접속
2. 프로젝트 → Settings → Environment Variables
3. `SUPABASE_DATABASE_URL` 수정
4. 포트를 **6543**으로 변경
5. 재배포

## 디버깅 도구

`test-auth-debug.html` 파일을 사용하여 인증 및 API 호출 테스트 가능:

```bash
# 테스트 서버 실행
python3 -m http.server 8080

# 브라우저에서 접속
http://localhost:8080/test-auth-debug.html
```

## 주의사항

- Vercel은 Serverless 환경이므로 Connection Pooling 사용 권장
- Transaction 모드 사용 시 반드시 포트 6543 사용
- 로컬 개발 환경에서는 Direct 연결도 가능하나, 프로덕션에서는 Pooler 권장

## 참고 문서
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)