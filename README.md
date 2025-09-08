# Sentence Collection App

A web application for collecting and sharing memorable sentences from books.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbluebuchu%2Fcollect&env=SESSION_SECRET,SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_DATABASE_URL,NODE_ENV&envDescription=Required%20environment%20variables%20for%20the%20app&envLink=https%3A%2F%2Fgithub.com%2Fbluebuchu%2Fcollect%2Fblob%2Fmain%2FVERCEL_DEPLOYMENT_GUIDE.md&project-name=sentence-collection&repository-name=sentence-collection)

Click the button above to deploy directly to Vercel!

## 📋 Environment Variables

When deploying, you'll need to set these environment variables:

```env
SESSION_SECRET=your-secret-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DATABASE_URL=your-database-url
NODE_ENV=production
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📚 Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📖 Documentation

- [Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- [Environment Setup](./VERCEL_ENV_SETUP.md)
- [Quick Start](./VERCEL_QUICK_START.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT