# 🔐 관리자 페이지 접속 가이드

## 관리자 페이지 URL
- **로컬**: http://localhost:5173/admin
- **프로덕션**: https://collect-topaz.vercel.app/admin

## 비밀번호
다음 비밀번호 중 하나를 사용할 수 있습니다:
- `Collect@Admin#2024!` (권장)
- `admin123` (호환성용)

## Vercel 환경변수 설정

프로덕션에서 커스텀 비밀번호를 사용하려면:

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. `collect` 프로젝트 선택
3. Settings → Environment Variables
4. 다음 변수 추가/수정:
   ```
   ADMIN_PASSWORD=원하는비밀번호
   ```
5. 재배포

## 문제 해결

### "비밀번호가 올바르지 않습니다" 오류
1. 비밀번호 복사/붙여넣기 시 앞뒤 공백 제거
2. 대소문자 구분 확인
3. 특수문자 정확히 입력

### 프로덕션에서만 안 되는 경우
- Vercel 환경변수 확인
- 환경변수가 없으면 기본값 `Collect@Admin#2024!` 사용됨

## 보안 주의사항
- 관리자 비밀번호는 정기적으로 변경 권장
- 프로덕션에서는 강력한 비밀번호 사용
- 비밀번호를 코드에 하드코딩하지 말고 환경변수 사용