#!/usr/bin/env node

import crypto from 'crypto';

// Generate a strong random secret
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

const secret = generateSecret();

console.log('\n🔐 Generated Strong Session Secret:\n');
console.log(secret);
console.log('\n📋 Add this to your Vercel environment variables:');
console.log(`SESSION_SECRET=${secret}`);
console.log('\n⚠️  Keep this secret safe and never commit it to git!\n');