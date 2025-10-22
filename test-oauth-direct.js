const axios = require('axios');

async function testGoogleOAuth() {
  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = {
    client_id: '664057699342-li9tfqb5u8ndvbgpdam9o6k6nq5sqbig.apps.googleusercontent.com',
    redirect_uri: 'http://localhost:5000/api/auth/google/callback',
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline'
  };

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${authUrl}?${queryString}`;

  console.log('\n🔍 Testing Google OAuth Configuration\n');
  console.log('=' .repeat(50));
  console.log('Testing URL:', fullUrl);
  console.log('=' .repeat(50));

  try {
    // Try to access the URL (will redirect to Google)
    const response = await axios.get(fullUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status < 400
    });

    console.log('\n✅ OAuth URL is accessible');
    console.log('Status:', response.status);
    console.log('Location:', response.headers.location || 'No redirect');
  } catch (error) {
    if (error.response) {
      console.log('\n⚠️  Response from Google:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
      
      // Check if it's a redirect_uri_mismatch error
      if (error.response.data && error.response.data.includes('redirect_uri_mismatch')) {
        console.log('\n❌ ERROR: redirect_uri_mismatch');
        console.log('The redirect URI in the request does not match the authorized redirect URIs in Google Console.');
        console.log('\n📋 To fix this:');
        console.log('1. Go to https://console.cloud.google.com/apis/credentials');
        console.log('2. Click on your OAuth 2.0 Client ID');
        console.log('3. Add this exact URI to "Authorized redirect URIs":');
        console.log('   http://localhost:5000/api/auth/google/callback');
      }
    } else {
      console.log('\n❌ Error:', error.message);
    }
  }
}

testGoogleOAuth();