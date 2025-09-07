// Test script to create a community sentence
async function createTestSentence() {
  const response = await fetch('http://localhost:3000/api/sentences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'sessionId=test-session' // You'll need to get a valid session
    },
    body: JSON.stringify({
      content: '테스트 커뮤니티 문장입니다. 이 문장은 모든 사용자에게 공유됩니다.',
      bookTitle: '테스트 책',
      author: '테스트 저자',
      pageNumber: 100,
      isPublic: 1
    })
  });

  const data = await response.json();
  console.log('Created sentence:', data);

  // Now fetch community sentences to verify
  const communityResponse = await fetch('http://localhost:3000/api/sentences/community');
  const communityData = await communityResponse.json();
  console.log('Community sentences:', communityData);
}

createTestSentence().catch(console.error);