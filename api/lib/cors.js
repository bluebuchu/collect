export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  // Allow Vercel domains and localhost
  const isAllowedOrigin = origin && (
    origin.includes('.vercel.app') || 
    origin.includes('.vercel.sh') ||
    origin.includes('localhost')
  );
  
  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
}