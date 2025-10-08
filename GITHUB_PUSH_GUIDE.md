# 🔧 GitHub 푸시 설정 가이드

## 방법 1: GitHub Personal Access Token 사용 (권장)

### 1단계: GitHub에서 Personal Access Token 생성

1. **GitHub.com 접속** → 로그인
2. **Settings** (프로필 사진 클릭 → Settings)
3. **Developer settings** (왼쪽 하단)
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token** → **Generate new token (classic)**
6. 설정:
   - **Note**: `collect-app-push`
   - **Expiration**: 90 days (또는 원하는 기간)
   - **Select scopes**:
     - ✅ `repo` (전체 선택)
     - ✅ `workflow` (GitHub Actions 사용 시)
7. **Generate token** 클릭
8. **토큰 복사** (한 번만 보임!)

### 2단계: Git에 토큰 설정

터미널에서 실행:
```bash
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/bluebuchu/collect.git
```

예시:
```bash
git remote set-url origin https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/bluebuchu/collect.git
```

### 3단계: 푸시
```bash
git push origin main
```

---

## 방법 2: VS Code 내장 GitHub 인증 사용

### 1단계: VS Code에서 GitHub 로그인
1. VS Code 열기
2. 왼쪽 사이드바 → **Source Control** (Ctrl+Shift+G)
3. **...** 메뉴 → **Remote** → **Add Remote**
4. GitHub 로그인 프롬프트가 나타나면 로그인

### 2단계: VS Code에서 푸시
1. **Source Control** 패널
2. **...** 메뉴 → **Push**
3. 또는 상태바의 동기화 버튼 클릭

---

## 방법 3: GitHub Desktop 사용

### 1단계: GitHub Desktop 설치
https://desktop.github.com/ 에서 다운로드

### 2단계: 리포지토리 추가
1. File → Add Local Repository
2. `/home/julyw/collect` 폴더 선택

### 3단계: 푸시
1. **Push origin** 버튼 클릭

---

## 방법 4: SSH 키 사용

### 1단계: SSH 키 생성
```bash
ssh-keygen -t ed25519 -C "bluebuchu@github.com"
```

### 2단계: GitHub에 SSH 키 추가
1. 공개키 복사: `cat ~/.ssh/id_ed25519.pub`
2. GitHub → Settings → SSH and GPG keys → New SSH key

### 3단계: Remote URL 변경
```bash
git remote set-url origin git@github.com:bluebuchu/collect.git
```

### 4단계: 푸시
```bash
git push origin main
```

---

## 🚀 빠른 해결책

임시로 토큰을 직접 입력:
```bash
git push https://YOUR_TOKEN@github.com/bluebuchu/collect.git main
```

---

## ✅ 추천 방법

**Personal Access Token (방법 1)**이 가장 안전하고 간편합니다.

1. GitHub에서 토큰 생성
2. 아래 명령 실행:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/bluebuchu/collect.git
git push origin main
```

완료!