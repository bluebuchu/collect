import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

console.log('🌐 API 엔드포인트 테스트 시작...\n');

async function testAPI() {
  try {
    // 1. 문장 목록 조회
    console.log('1️⃣ GET /api/sentences - 문장 목록 조회');
    const sentencesRes = await fetch(`${BASE_URL}/sentences`);
    const sentences = await sentencesRes.json();
    console.log(`✅ 문장 ${sentences.length}개 조회 성공`);
    if (sentences.length > 0) {
      console.log('   첫 번째 문장:', sentences[0].content.substring(0, 50) + '...');
    }
    console.log('');

    // 2. 사용자 회원가입 테스트
    console.log('2️⃣ POST /api/auth/register - 회원가입');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `apitest${Date.now()}@test.com`,
        password: 'Test123!@#',
        nickname: 'API테스터'
      })
    });
    const registerData = await registerRes.json();
    console.log(`✅ 회원가입 응답:`, registerData.success ? '성공' : registerData.error);
    console.log('');

    // 3. 로그인 테스트
    console.log('3️⃣ POST /api/auth/login - 로그인');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123'
      })
    });
    const loginData = await loginRes.json();
    console.log(`✅ 로그인 응답:`, loginData.user ? `성공 (사용자: ${loginData.user.nickname})` : '실패');
    console.log('');

    // 4. 책 검색 테스트
    console.log('4️⃣ GET /api/books/search - 책 검색');
    const booksRes = await fetch(`${BASE_URL}/books/search?query=테스트`);
    const books = await booksRes.json();
    console.log(`✅ 책 검색 결과:`, Array.isArray(books) ? `${books.length}개 발견` : '검색 실패');
    console.log('');

    // 5. 커뮤니티 목록 조회
    console.log('5️⃣ GET /api/communities - 커뮤니티 목록');
    const communitiesRes = await fetch(`${BASE_URL}/communities`);
    const communities = await communitiesRes.json();
    console.log(`✅ 커뮤니티 ${communities.length}개 조회 성공`);
    console.log('');

    // 6. 통계 조회
    console.log('6️⃣ GET /api/sentences/stats - 통계 조회');
    const statsRes = await fetch(`${BASE_URL}/sentences/stats`);
    const stats = await statsRes.json();
    console.log(`✅ 통계 조회 성공:`, stats);
    console.log('');

    console.log('🎉 모든 API 테스트 완료!');
    console.log('\n💡 브라우저에서 http://localhost:5000 으로 접속하여 UI를 테스트해보세요.');

  } catch (error) {
    console.error('❌ API 테스트 실패:', error.message);
    console.log('\n⚠️  서버가 실행 중인지 확인하세요 (npm run dev)');
  }
}

// node-fetch 설치 확인
import { exec } from 'child_process';
exec('npm list node-fetch', (error, stdout) => {
  if (error || !stdout.includes('node-fetch')) {
    console.log('📦 node-fetch 설치 중...');
    exec('npm install node-fetch', (err) => {
      if (err) {
        console.error('❌ node-fetch 설치 실패');
        process.exit(1);
      }
      testAPI();
    });
  } else {
    testAPI();
  }
});