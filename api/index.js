// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    console.log('API handler called:', req.method, req.url);
    
    // Dynamic import the serverless-optimized Express app
    const { default: app } = await import('../dist/serverless.js');
    
    // Create a promise to handle the Express app
    return new Promise((resolve, reject) => {
      // Add error handling for response
      const originalEnd = res.end;
      res.end = function(...args) {
        resolve();
        return originalEnd.apply(this, args);
      };
      
      // Handle the request with Express app
      app(req, res, (err) => {
        if (err) {
          console.error('Express handler error:', err);
          if (!res.headersSent) {
            res.status(500).json({ 
              error: 'Internal server error',
              message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
            });
          }
          reject(err);
        }
      });
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (!res.headersSent) {
          console.error('Request timeout');
          res.status(504).json({ error: 'Gateway timeout' });
          reject(new Error('Request timeout'));
        }
      }, 29000); // Vercel has 30s limit
    });
  } catch (error) {
    console.error('Handler initialization error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Server initialization failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to initialize server',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}