#!/bin/bash

echo "🚀 Vercel 배포 준비 스크립트"
echo "================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI가 설치되어 있지 않습니다."
    echo "설치하시겠습니까? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        npm i -g vercel
    else
        echo "Vercel CLI 설치 후 다시 실행해주세요."
        exit 1
    fi
fi

# Generate SESSION_SECRET if needed
echo ""
echo "1️⃣  SESSION_SECRET 생성"
echo "------------------------"
echo "새로운 SESSION_SECRET을 생성하시겠습니까? (y/n)"
read -r response
if [[ "$response" == "y" ]]; then
    node generate-secret.js
    echo ""
    echo "⚠️  위의 SECRET을 Vercel 환경 변수에 추가하는 것을 잊지 마세요!"
fi

# Build check
echo ""
echo "2️⃣  빌드 테스트"
echo "------------------------"
echo "프로덕션 빌드를 테스트하시겠습니까? (y/n)"
read -r response
if [[ "$response" == "y" ]]; then
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ 빌드 성공!"
    else
        echo "❌ 빌드 실패. 오류를 수정한 후 다시 시도하세요."
        exit 1
    fi
fi

# Deploy to Vercel
echo ""
echo "3️⃣  Vercel 배포"
echo "------------------------"
echo "Vercel에 배포하시겠습니까? (y/n)"
read -r response
if [[ "$response" == "y" ]]; then
    echo ""
    echo "📋 환경 변수 체크리스트:"
    echo "  □ SESSION_SECRET (필수)"
    echo "  □ SUPABASE_URL (필수)"
    echo "  □ SUPABASE_ANON_KEY (필수)"
    echo "  □ SUPABASE_DATABASE_URL (필수)"
    echo "  □ GOOGLE_CLIENT_ID (선택)"
    echo "  □ GOOGLE_CLIENT_SECRET (선택)"
    echo "  □ GOOGLE_REDIRECT_URI (선택)"
    echo ""
    echo "위 환경 변수를 Vercel Dashboard에서 설정하셨나요? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        echo ""
        echo "프로덕션 배포를 진행합니다..."
        vercel --prod
    else
        echo ""
        echo "개발 환경 배포를 진행합니다..."
        vercel
        echo ""
        echo "✅ 개발 배포 완료!"
        echo "환경 변수 설정 후 'vercel --prod'로 프로덕션 배포를 진행하세요."
    fi
fi

echo ""
echo "🎉 완료!"
echo ""
echo "📚 다음 단계:"
echo "1. Vercel Dashboard에서 환경 변수 설정"
echo "2. Google OAuth redirect URI 업데이트"
echo "3. 배포된 사이트 테스트"