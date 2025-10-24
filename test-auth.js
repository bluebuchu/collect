// 인증 테스트 스크립트

const API_BASE = 'http://localhost:5000';

async function testAuth() {
  console.log('=== 인증 테스트 시작 ===\n');
  
  // 0. 먼저 회원가입 시도
  console.log('0. 회원가입 시도...');
  const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@test.com',
      password: 'Test1234!',
      nickname: '테스트유저'
    }),
    credentials: 'include'
  });
  
  if (!registerResponse.ok) {
    console.log('회원가입 실패 (이미 존재할 수 있음):', await registerResponse.text());
  } else {
    const registerData = await registerResponse.json();
    console.log('회원가입 성공!');
  }
  
  // 1. 로그인 테스트
  console.log('\n1. 로그인 시도...');
  const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@test.com',
      password: 'Test1234!'
    }),
    credentials: 'include'
  });
  
  if (!loginResponse.ok) {
    console.error('로그인 실패:', await loginResponse.text());
    return;
  }
  
  const loginData = await loginResponse.json();
  console.log('로그인 성공! 토큰:', loginData.token ? '있음' : '없음');
  console.log('사용자:', loginData.user);
  
  if (!loginData.token) {
    console.error('토큰이 반환되지 않았습니다!');
    return;
  }
  
  // 2. JWT 토큰으로 문장 등록 테스트
  console.log('\n2. JWT 토큰으로 문장 등록 시도...');
  const sentenceResponse = await fetch(`${API_BASE}/api/sentences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginData.token}`
    },
    body: JSON.stringify({
      content: '테스트 문장입니다. ' + new Date().toISOString(),
      bookTitle: '테스트 책',
      author: '테스트 저자',
      isPublic: 0
    }),
    credentials: 'include'
  });
  
  if (!sentenceResponse.ok) {
    console.error('문장 등록 실패:', sentenceResponse.status, await sentenceResponse.text());
    return;
  }
  
  const sentenceData = await sentenceResponse.json();
  console.log('문장 등록 성공!', sentenceData);
  
  // 3. 세션만으로 문장 등록 테스트 
  console.log('\n3. 세션만으로 문장 등록 시도 (토큰 없이)...');
  const sessionResponse = await fetch(`${API_BASE}/api/sentences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: '세션 테스트 문장입니다. ' + new Date().toISOString(),
      bookTitle: '테스트 책',
      author: '테스트 저자',
      isPublic: 0
    }),
    credentials: 'include'
  });
  
  if (!sessionResponse.ok) {
    console.error('세션 인증 실패:', sessionResponse.status, await sessionResponse.text());
  } else {
    const sessionData = await sessionResponse.json();
    console.log('세션 인증 성공!', sessionData);
  }
  
  console.log('\n=== 테스트 완료 ===');
}

testAuth().catch(console.error);