# 🚀 Vercel Deployment Guide

This guide provides step-by-step instructions for deploying ChatBuddy to Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- GitHub repository with ChatBuddy code
- Supabase project configured (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))

## 🎯 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/chatbuddy&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Required%20environment%20variables%20for%20Supabase%20integration&envLink=https://github.com/your-username/chatbuddy/blob/main/SUPABASE_SETUP.md)

## 📋 Manual Deployment Steps

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your ChatBuddy repository from GitHub
4. Vercel will auto-detect it as a Next.js project

### 2. Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

#### Required Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Optional Variables
```env
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_TELEMETRY_DISABLED=1

# AI Provider API Keys (add as needed)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
COHERE_API_KEY=your_cohere_key
GROQ_API_KEY=your_groq_key
```

### 3. Build Configuration

Vercel will automatically use the `vercel.json` configuration file included in the project:

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 4. Deploy

1. Click **"Deploy"** in Vercel dashboard
2. Vercel will build and deploy your application
3. You'll get a preview URL immediately
4. Production deployments happen on pushes to main/master branch

## 🔧 Advanced Configuration

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

### Environment-Specific Variables

Set different values for **Production**, **Preview**, and **Development**:

- **Production**: Used for main branch deployments
- **Preview**: Used for pull request deployments  
- **Development**: Used for local development

### Function Configuration

API routes are automatically configured as serverless functions. The `vercel.json` ensures they use Node.js 18.x runtime.

## 🚀 Automatic Deployments

### GitHub Integration

Vercel automatically deploys:
- **Production**: Pushes to main/master branch
- **Preview**: Pull requests and other branches

### Manual Deployments

Using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🔄 CI/CD with GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/vercel-deploy.yml`) for advanced CI/CD.

### Required GitHub Secrets

Add these secrets in your GitHub repository settings:

```env
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

### Getting Vercel Tokens

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token
3. Get your Org ID and Project ID from project settings

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable analytics in your Vercel dashboard:
1. Go to **Analytics** tab
2. Enable Web Analytics
3. Add the analytics script to your app (optional - Vercel can inject automatically)

### Performance Monitoring

- **Core Web Vitals**: Automatically tracked
- **Function Logs**: Available in dashboard
- **Build Logs**: Detailed build information

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs in Vercel dashboard
# Common fixes:
npm run build  # Test locally first
```

#### Environment Variables Not Working
- Ensure variables are set for correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Check variable names match exactly

#### API Routes Not Working
- Verify `vercel.json` configuration
- Check function logs in Vercel dashboard
- Ensure environment variables are available to functions

#### Supabase Connection Issues
```bash
# Test connection locally
npm run verify-supabase
```

### Performance Optimization

#### Bundle Size
```bash
# Analyze bundle size
npm run build
```

#### Edge Functions
Consider using Vercel Edge Functions for better performance:
```typescript
// app/api/edge-example/route.ts
export const runtime = 'edge';
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **CORS**: Configured automatically via `vercel.json`
3. **HTTPS**: Automatic SSL certificates
4. **Headers**: Security headers configured

## 📈 Scaling

### Serverless Functions
- Automatic scaling
- Pay per execution
- 10-second timeout limit

### Static Assets
- Global CDN distribution
- Automatic optimization
- Edge caching

## 🆚 Vercel vs Netlify

| Feature | Vercel | Netlify |
|---------|--------|---------|
| **Next.js Support** | ⭐⭐⭐⭐⭐ Native | ⭐⭐⭐⭐ Good |
| **Build Speed** | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐ Good |
| **Edge Functions** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **Analytics** | ⭐⭐⭐⭐ Built-in | ⭐⭐⭐ Available |
| **Pricing** | ⭐⭐⭐⭐ Generous free tier | ⭐⭐⭐⭐ Good free tier |

## 📞 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Documentation](https://nextjs.org/docs)

---

**🎉 Your ChatBuddy app is now deployed on Vercel!**

Visit your deployment URL to start using your AI-powered chat application.