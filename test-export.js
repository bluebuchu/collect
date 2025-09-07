// Test script to create sample sentences for export testing
const API_BASE = 'http://localhost:5000';

async function login() {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@example.com',
      password: 'demo123'
    }),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const cookies = response.headers.get('set-cookie');
  console.log('Login successful');
  return cookies;
}

async function createSentences(cookies) {
  const sentences = [
    {
      content: "인생은 속도가 아니라 방향이다.",
      author: "괴테",
      bookTitle: "파우스트",
      pageNumber: 42,
      isPublic: 1
    },
    {
      content: "꿈을 지녀라. 그러면 어려운 현실을 이길 수 있다.",
      author: "괴테",
      bookTitle: "파우스트",
      pageNumber: 156,
      isPublic: 1
    },
    {
      content: "책은 도끼다. 우리 안의 얼어붙은 바다를 깨뜨리는.",
      author: "프란츠 카프카",
      bookTitle: "변신",
      pageNumber: 23,
      isPublic: 1
    },
    {
      content: "가장 큰 영광은 한 번도 실패하지 않음이 아니라 실패할 때마다 다시 일어서는 데 있다.",
      author: "공자",
      bookTitle: "논어",
      pageNumber: 89,
      isPublic: 1
    },
    {
      content: "행복은 습관이다. 그것을 몸에 지녀라.",
      author: "허버드",
      bookTitle: "행복론",
      pageNumber: 34,
      isPublic: 0
    }
  ];

  console.log(`Creating ${sentences.length} sample sentences...`);
  
  for (const sentence of sentences) {
    const response = await fetch(`${API_BASE}/api/sentences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify(sentence),
      credentials: 'include'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Created: "${sentence.content.substring(0, 30)}..." (ID: ${result.id})`);
    } else {
      const error = await response.text();
      console.error(`Failed to create sentence: ${response.status} - ${error}`);
    }
  }
}

async function testExport(cookies) {
  console.log('\n=== Testing Export Features ===\n');
  
  // Test 1: Get books list
  console.log('1. Getting books list...');
  const booksResponse = await fetch(`${API_BASE}/api/export/books`, {
    headers: { 'Cookie': cookies },
    credentials: 'include'
  });
  
  if (booksResponse.ok) {
    const books = await booksResponse.json();
    console.log('Available books:', books);
  } else {
    console.error('Failed to get books:', booksResponse.status);
  }
  
  // Test 2: Export by book (CSV)
  console.log('\n2. Testing export by book (CSV)...');
  const bookExportResponse = await fetch(`${API_BASE}/api/export/book/파우스트?format=csv`, {
    headers: { 'Cookie': cookies },
    credentials: 'include'
  });
  
  if (bookExportResponse.ok) {
    const csvContent = await bookExportResponse.text();
    console.log('CSV export successful. First 200 chars:');
    console.log(csvContent.substring(0, 200));
  } else {
    console.error('Failed to export book:', bookExportResponse.status);
  }
  
  // Test 3: Export by date range (TXT)
  console.log('\n3. Testing export by date range (TXT)...');
  const today = new Date().toISOString().split('T')[0];
  const dateExportResponse = await fetch(
    `${API_BASE}/api/export/date?startDate=${today}&endDate=${today}&format=txt`,
    {
      headers: { 'Cookie': cookies },
      credentials: 'include'
    }
  );
  
  if (dateExportResponse.ok) {
    const txtContent = await dateExportResponse.text();
    console.log('TXT export successful. First 300 chars:');
    console.log(txtContent.substring(0, 300));
  } else {
    console.error('Failed to export by date:', dateExportResponse.status);
  }
}

// Run tests
(async () => {
  try {
    const cookies = await login();
    await createSentences(cookies);
    await testExport(cookies);
    console.log('\n=== Export tests completed ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
})();