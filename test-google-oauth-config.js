const { OAuth2Client } = require('google-auth-library');

// Load environment variables
require('dotenv').config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

console.log('\n🔍 Google OAuth Configuration Check\n');
console.log('================================');

// Check Client ID
if (!GOOGLE_CLIENT_ID) {
  console.error('❌ GOOGLE_CLIENT_ID is not set');
} else {
  console.log('✅ GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
  if (!GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
    console.warn('⚠️  Client ID format looks incorrect');
  }
}

// Check Client Secret
if (!GOOGLE_CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_SECRET is not set');
} else {
  console.log('✅ GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET.substring(0, 10) + '...');
}

// Check Redirect URI
console.log('✅ GOOGLE_REDIRECT_URI:', GOOGLE_REDIRECT_URI);

console.log('\n📋 Required Google Console Settings:');
console.log('================================');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('2. Select your OAuth 2.0 Client ID');
console.log('3. Add these Authorized redirect URIs:');
console.log('   - http://localhost:5000/api/auth/google/callback');
console.log('   - https://collect-topaz.vercel.app/api/auth/google/callback');

console.log('\n🔗 OAuth Test URL:');
console.log('================================');
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
  `response_type=code&` +
  `scope=${encodeURIComponent('profile email')}&` +
  `access_type=offline`;

console.log('Test this URL in your browser:');
console.log(authUrl);

console.log('\n📝 Current Environment:');
console.log('================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'not set');
console.log('PORT:', process.env.PORT || '5000');

// Try to create OAuth client to verify credentials
console.log('\n🔐 Verifying OAuth Client...');
console.log('================================');

try {
  const client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  console.log('✅ OAuth client created successfully');
  
  // Generate auth URL
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email']
  });
  
  console.log('\n📎 Generated Auth URL:');
  console.log(authUrl);
} catch (error) {
  console.error('❌ Failed to create OAuth client:', error.message);
}