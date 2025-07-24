# Deployment Guide

This guide covers deploying ChatBuddy to various platforms, with detailed instructions for Netlify (recommended) and other popular hosting services.

## 🚀 Netlify Deployment (Recommended)

ChatBuddy is optimized for Netlify deployment with automatic configuration via `netlify.toml`.

### Prerequisites
- GitHub/GitLab repository with your ChatBuddy code
- Netlify account
- Supabase project set up (see [SUPABASE_SETUP.md](../SUPABASE_SETUP.md))

### Step-by-Step Deployment

#### 1. Connect Repository
1. Log in to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose your Git provider (GitHub/GitLab)
4. Select your ChatBuddy repository
5. Netlify will auto-detect the build settings from `netlify.toml`

#### 2. Configure Environment Variables
In Netlify dashboard → Site settings → Environment variables, add:

```env
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional - Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
NETLIFY=true
```

#### 3. Deploy
1. Click "Deploy site"
2. Wait for build to complete (5-10 minutes)
3. Your site will be available at `https://your-site-name.netlify.app`

### Netlify Configuration Details

The included `netlify.toml` provides:
- **Build command**: Optimized for Next.js static export
- **Node version**: 18 (required)
- **Redirects**: Proper SPA routing
- **Functions**: Edge functions for auth callbacks
- **Performance**: Optimized build settings

### Custom Domain Setup
1. In Netlify dashboard → Domain settings
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

---

## 🌐 Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository

### Deployment Steps

#### 1. Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your ChatBuddy repository

#### 2. Configure Build Settings
```bash
# Build Command
npm run build

# Output Directory
out

# Install Command
npm install
```

#### 3. Environment Variables
Add the same environment variables as Netlify section above.

#### 4. Deployment Configuration
Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

---

## 🐳 Docker Deployment

### Dockerfile
Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NETLIFY true

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/out ./out
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npx", "serve", "out", "-p", "3000"]
```

### Docker Compose
Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  chatbuddy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
    restart: unless-stopped
```

### Build and Run
```bash
# Build the image
docker build -t chatbuddy .

# Run with environment file
docker run -p 3000:3000 --env-file .env.local chatbuddy

# Or use docker-compose
docker-compose up -d
```

---

## ☁️ AWS Amplify Deployment

### Prerequisites
- AWS account
- GitHub repository

### Deployment Steps

#### 1. Create Amplify App
1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your repository

#### 2. Build Settings
Amplify will auto-detect Next.js. Customize if needed:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### 3. Environment Variables
Add the same environment variables as previous sections.

---

## 🔧 Self-Hosted Deployment

### Using PM2 (Process Manager)

#### 1. Install PM2
```bash
npm install -g pm2
```

#### 2. Build Application
```bash
npm run build
```

#### 3. Create PM2 Configuration
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'chatbuddy',
    script: 'npx',
    args: 'serve out -p 3000',
    cwd: '/path/to/your/chatbuddy',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_anon_key',
      SUPABASE_SERVICE_ROLE_KEY: 'your_service_role_key'
    }
  }]
}
```

#### 4. Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Using Nginx (Reverse Proxy)

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Security Considerations

### Environment Variables
- **Never commit** `.env.local` to version control
- **Use platform-specific** environment variable systems
- **Rotate keys** regularly
- **Use different keys** for different environments

### HTTPS Configuration
- **Always use HTTPS** in production
- **Configure SSL certificates** properly
- **Enable HSTS** headers
- **Use secure cookies** for authentication

### Content Security Policy
Add to your deployment configuration:

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 📊 Performance Optimization

### Build Optimization
- **Enable compression** in your hosting platform
- **Use CDN** for static assets
- **Configure caching** headers
- **Monitor bundle size** with webpack-bundle-analyzer

### Database Optimization
- **Use connection pooling** for Supabase
- **Enable RLS policies** for security
- **Index frequently queried** columns
- **Monitor query performance**

### Monitoring Setup
- **Set up error tracking** (Sentry, LogRocket)
- **Monitor performance** (Vercel Analytics, Google Analytics)
- **Track API usage** and costs
- **Set up uptime monitoring**

---

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

#### Environment Variable Issues
- **Check variable names** (exact case)
- **Verify values** are correct
- **Ensure no trailing spaces**
- **Check platform-specific syntax**

#### Supabase Connection Issues
- **Verify URLs** and keys
- **Check network connectivity**
- **Validate RLS policies**
- **Test with Supabase CLI**

### Performance Issues
- **Check bundle size**: Use `npm run analyze`
- **Monitor memory usage**: Check hosting platform metrics
- **Database queries**: Review Supabase dashboard
- **API response times**: Monitor provider dashboards

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod --dir=out
      env:
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

**Note**: Always test deployments in a staging environment before deploying to production.