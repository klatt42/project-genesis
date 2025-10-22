# Genesis Deployment Guide

## Deployment Strategy Decision Tree

### Simple Deployment (Most Genesis Projects)
**Use**: genesis-deployment patterns
**When**: Single Next.js app, standard integrations
**Platform**: Netlify

### Complex Deployment (Advanced Projects)
**Use**: genesis-archon patterns
**When**: Multiple services, microservices, complex orchestration
**Platform**: Archon orchestration layer

---

## Simple Deployment (Netlify)

### Prerequisites
- GitHub repository
- Netlify account
- Environment variables ready

### Step 1: Prepare Project

**1.1 Install Netlify Plugin**
```bash
npm install -D @netlify/plugin-nextjs
```

**1.2 Create netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"

# Redirect rules for Next.js
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**1.3 Verify Build Locally**
```bash
npm run build
# Should complete without errors
```

### Step 2: Deploy to Netlify

**Option A: Netlify CLI (Recommended)**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

**Option B: GitHub Integration**
1. Go to netlify.com
2. Click "Add new site"
3. Choose "Import from Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy site"

### Step 3: Configure Environment Variables

**In Netlify Dashboard**:
1. Site Settings → Environment Variables
2. Add variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   GHL_API_KEY=your-key (if landing page)
   OPENAI_API_KEY=your-key (if using CopilotKit)
   ```

**Or via CLI**:
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your-url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-key"
```

### Step 4: Configure Custom Domain (Optional)

**Via Netlify Dashboard**:
1. Site Settings → Domain Management
2. Add custom domain
3. Follow DNS configuration instructions

**DNS Configuration**:
```
# Add these records to your DNS provider:
A record:    @    →  75.2.60.5
CNAME:       www  →  your-site.netlify.app
```

### Step 5: Verify Deployment

**Checklist**:
- [ ] Site loads at Netlify URL
- [ ] Forms submit successfully (if landing page)
- [ ] Authentication works (if SaaS app)
- [ ] Database queries work
- [ ] API routes functional
- [ ] Environment variables loaded
- [ ] Images load correctly
- [ ] SEO meta tags present

**Test Commands**:
```bash
# Check build logs
netlify logs

# Test functions
netlify functions:list

# View site
netlify open
```

### Step 6: Enable Auto-Deploy

**GitHub Integration**:
1. Netlify automatically deploys on push to main
2. Branch deploys for pull requests
3. Deploy previews for review

**Configuration**:
```toml
# netlify.toml
[context.production]
  command = "npm run build"

[context.deploy-preview]
  command = "npm run build"

[context.branch-deploy]
  command = "npm run build"
```

---

## Advanced Deployment (Archon)

See [ARCHON_PATTERNS.md](./ARCHON_PATTERNS.md) for full details.

### When to Use Archon
- Multiple backend services (3+)
- Microservices architecture
- Service-to-service communication
- Complex orchestration needs
- Background job processing
- Event-driven architecture

### Quick Archon Setup
```bash
# Install Archon CLI
npm install -g @archon/cli

# Initialize Archon project
archon init

# Create archon.yaml configuration
# (See ARCHON_PATTERNS.md for examples)

# Deploy all services
archon deploy --env production
```

---

## Database Deployment (Supabase)

### Production Setup

**1. Upgrade Project (if on free tier)**
- Go to supabase.com dashboard
- Project Settings → Billing
- Upgrade to Pro ($25/month) for production

**2. Configure Production Database**
```sql
-- Run in SQL Editor

-- 1. Backup data (if existing)
-- Use Supabase dashboard backup feature

-- 2. Enable point-in-time recovery
-- Settings → Database → Enable PITR

-- 3. Set up connection pooling
-- Settings → Database → Enable pooling mode
```

**3. Environment Variables**
```bash
# Production values (different from dev)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-only
```

**4. Database Migrations**
```bash
# Using Supabase CLI
supabase init
supabase link --project-ref your-project-ref
supabase db push
```

---

## GoHighLevel Setup (Landing Pages)

### Production Configuration

**1. Get Production API Key**
1. GoHighLevel Settings → API
2. Create production API key
3. Note Location ID

**2. Configure Webhook URLs** (if using webhooks)
```
Webhook URL: https://your-netlify-site.com/api/ghl-webhook
```

**3. Test Integration**
```bash
# Test API connectivity
curl -X POST https://your-site.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890"}'
```

---

## SSL/HTTPS Configuration

### Netlify (Automatic)
- Netlify provides free SSL via Let's Encrypt
- Automatically enabled for all sites
- Auto-renewal handled by Netlify

### Custom Domain
1. Add domain in Netlify
2. Configure DNS
3. SSL certificate issued automatically
4. Force HTTPS (enabled by default)

---

## Performance Optimization

### Next.js Optimizations

**1. Image Optimization**
```typescript
// Use next/image for all images
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // For above-fold images
/>
```

**2. Font Optimization**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
```

**3. Code Splitting**
```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

### Netlify Optimizations

**netlify.toml**:
```toml
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true
```

---

## Monitoring & Analytics

### Netlify Analytics
```toml
# netlify.toml
[analytics]
  provider = "netlify"
```

### Supabase Monitoring
1. Dashboard → Database → Performance
2. Monitor query performance
3. Set up alerts for slow queries

### Error Tracking (Optional)
```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

---

## Rollback Strategy

### Netlify Rollback
```bash
# View deployments
netlify sites:list

# Rollback to previous deployment
netlify rollback
```

### Database Rollback
```bash
# Supabase point-in-time recovery
# Dashboard → Database → Restore from backup
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Build completes successfully
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] API integrations tested
- [ ] Security review complete

### Deployment
- [ ] Create production branch
- [ ] Deploy to staging first (if available)
- [ ] Test staging environment
- [ ] Deploy to production
- [ ] Verify production deployment

### Post-Deployment
- [ ] Monitor error logs (first hour)
- [ ] Check analytics (first day)
- [ ] Verify integrations working
- [ ] Test critical user flows
- [ ] Notify stakeholders

---

## Troubleshooting

### Build Failures

**Issue**: Build fails on Netlify
```bash
# Check Node version
# netlify.toml
[build.environment]
  NODE_VERSION = "18"

# Clear cache and rebuild
netlify build --clear-cache
```

**Issue**: Environment variables not loading
```bash
# Verify variables are set
netlify env:list

# Check variable names match code
# NEXT_PUBLIC_ prefix required for client-side
```

### Runtime Errors

**Issue**: 500 errors in production
```bash
# Check function logs
netlify functions:list
netlify functions:log [function-name]

# Check Netlify deploy logs
netlify logs
```

**Issue**: API routes failing
- Verify environment variables in Netlify
- Check API route code for server-side only code
- Test API routes directly: https://your-site.com/api/[route]

### Database Connection Issues

**Issue**: Can't connect to Supabase
- Verify NEXT_PUBLIC_SUPABASE_URL
- Check Supabase project is not paused
- Verify RLS policies allow operation
- Check network/firewall settings

---

## Security Checklist

### Pre-Deployment Security
- [ ] Environment variables secured (not in code)
- [ ] API keys rotated for production
- [ ] RLS enabled on all Supabase tables
- [ ] Input validation on all forms
- [ ] CORS configured correctly
- [ ] Rate limiting on API routes
- [ ] HTTPS enforced
- [ ] Security headers configured

### Netlify Security Headers
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
```

---

## Cost Optimization

### Netlify
- **Free Tier**: 100GB bandwidth, 300 build minutes/month
- **Pro**: $19/month for more bandwidth and features
- Optimize: Minimize build frequency, use caching

### Supabase
- **Free Tier**: 500MB database, 50GB bandwidth
- **Pro**: $25/month for production features
- Optimize: Index queries, enable connection pooling

### General
- Use CDN for static assets
- Optimize images (next/image)
- Enable caching headers
- Minimize API calls (batch requests)
