// Test Vercel deployment database connection
const https = require('https');

const testEndpoints = [
  { path: '/api/health', method: 'GET', description: 'Health check' },
  { path: '/api/sentences', method: 'GET', description: 'Get sentences' },
  { path: '/api/books', method: 'GET', description: 'Get books' },
];

const baseUrl = 'collect-topaz.vercel.app';

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n${endpoint.description} (${endpoint.path}):`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log('Response:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('Response:', data.substring(0, 200));
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`Error with ${endpoint.path}:`, e.message);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing Vercel deployment endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    await makeRequest(endpoint);
  }
  
  // Test database connection with POST
  console.log('\n\nTesting user registration (POST):');
  const postData = JSON.stringify({
    email: 'test' + Date.now() + '@example.com',
    password: 'TestPassword123',
    nickname: 'TestUser'
  });
  
  const options = {
    hostname: baseUrl,
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      try {
        const parsed = JSON.parse(data);
        console.log('Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e.message);
  });

  req.write(postData);
  req.end();
}

runTests();