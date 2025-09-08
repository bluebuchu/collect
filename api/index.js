// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Dynamic import to avoid build issues
    const { default: app } = await import('../dist/index.js');
    
    // Ensure response is JSON for errors
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data) {
      // If sending non-JSON error, convert to JSON
      if (res.statusCode >= 400 && typeof data === 'string') {
        res.setHeader('Content-Type', 'application/json');
        return originalJson.call(this, { error: data });
      }
      return originalSend.call(this, data);
    };
    
    // Handle the request with Express app
    return new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          console.error('Express app error:', err);
          if (!res.headersSent) {
            res.status(500).json({ 
              error: 'Internal server error',
              message: err.message 
            });
          }
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Server initialization failed',
        message: error.message 
      });
    }
  }
}