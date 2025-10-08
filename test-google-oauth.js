#!/usr/bin/env node

const fetch = require('node-fetch');

async function testGoogleOAuth() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🔍 Google OAuth 테스트 시작...\n');
  
  // 1. Google OAuth 상태 확인
  console.log('1. Google OAuth 상태 확인');
  try {
    const statusResponse = await fetch(`${baseUrl}/api/auth/google/status`, {
      headers: {
        'Cookie': 'sessionId=test'
      }
    });
    const statusData = await statusResponse.json();
    console.log('✅ 상태 확인 성공:', statusData);
  } catch (error) {
    console.log('❌ 상태 확인 실패:', error.message);
  }
  
  // 2. Google OAuth 리디렉션 확인
  console.log('\n2. Google OAuth 리디렉션 확인');
  try {
    const oauthResponse = await fetch(`${baseUrl}/api/auth/google`, {
      redirect: 'manual'
    });
    
    if (oauthResponse.status === 302 || oauthResponse.status === 303) {
      const redirectUrl = oauthResponse.headers.get('location');
      console.log('✅ OAuth 리디렉션 성공');
      console.log('   리디렉션 URL:', redirectUrl);
      
      // Google OAuth URL 검증
      if (redirectUrl && redirectUrl.includes('accounts.google.com')) {
        console.log('✅ Google OAuth URL 확인됨');
      } else {
        console.log('⚠️ Google OAuth URL이 예상과 다름');
      }
    } else {
      console.log('❌ OAuth 리디렉션 실패. 상태 코드:', oauthResponse.status);
    }
  } catch (error) {
    console.log('❌ OAuth 리디렉션 테스트 실패:', error.message);
  }
  
  // 3. 환경 변수 확인
  console.log('\n3. 환경 변수 확인');
  const envVars = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ 설정됨' : '❌ 미설정',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ 설정됨' : '❌ 미설정',
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
  };
  
  console.log('   GOOGLE_CLIENT_ID:', envVars.GOOGLE_CLIENT_ID);
  console.log('   GOOGLE_CLIENT_SECRET:', envVars.GOOGLE_CLIENT_SECRET);
  console.log('   GOOGLE_REDIRECT_URI:', envVars.GOOGLE_REDIRECT_URI);
  
  console.log('\n✨ Google OAuth 테스트 완료!\n');
  console.log('📝 다음 단계:');
  console.log('1. Google Cloud Console에서 OAuth 2.0 클라이언트 설정 확인');
  console.log('2. 승인된 리디렉션 URI에 다음 주소 추가:');
  console.log('   - http://localhost:5000/api/auth/google/callback');
  console.log('   - https://your-vercel-domain.vercel.app/api/auth/google/callback');
  console.log('3. 브라우저에서 http://localhost:5000 접속하여 Google 로그인 테스트');
}

testGoogleOAuth().catch(console.error);