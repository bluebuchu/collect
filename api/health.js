module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      hasSessionSecret: !!process.env.SESSION_SECRET,
      hasSupabaseUrl: !!process.env.SUPABASE_DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
};