---
name: genesis-deployment
description: Netlify deployment patterns and production hosting strategies
---

# Genesis Deployment

## When to Use This Skill

Load this skill when user mentions:
- "deploy" OR "deployment" OR "go live"
- "netlify" OR "hosting" OR "host"
- "production" OR "prod"
- "publish" OR "launch"
- "ci/cd" OR "auto deploy"

## Key Patterns

### Pattern 1: Decision - Simple vs Complex

**Use genesis-deployment (this skill)** when:
- Single Next.js application
- Standard integrations (Supabase, GHL)
- Deploy to Netlify

**Use genesis-archon instead** when:
- Multiple backend services (3+)
- Microservices architecture
- Complex orchestration needed

### Pattern 2: Netlify Deployment (3 Steps)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Initialize (first time)
netlify init

# 3. Deploy
netlify deploy --prod
```

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

### Pattern 3: Environment Variables

**Set in Netlify Dashboard**:
1. Site Settings → Environment Variables
2. Add all .env.local variables
3. NEXT_PUBLIC_ prefix for client-side vars

**Or via CLI**:
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your-url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-key"
netlify env:set GHL_API_KEY "your-key"  # Server-side (no prefix)
netlify env:set OPENAI_API_KEY "your-key"  # Server-side
```

**Critical**: Client vars need NEXT_PUBLIC_, server vars don't

### Pattern 4: Pre-Deployment Checklist

```bash
# 1. Test build locally
npm run build

# 2. Check TypeScript
npx tsc --noEmit

# 3. Test locally
npm start  # Test production build

# 4. Check environment variables
cat .env.local  # Ensure all vars documented

# 5. Deploy
netlify deploy --prod
```

### Pattern 5: Auto-Deploy Setup

**GitHub Integration** (Recommended):
1. Connect Netlify to GitHub repo
2. Push to main → auto-deploys
3. Pull requests → deploy previews
4. No manual commands needed

**netlify.toml** for branches:
```toml
[context.production]
  command = "npm run build"

[context.deploy-preview]
  command = "npm run build"

[context.branch-deploy]
  command = "npm run build"
```

## Quick Reference

| Task | Command | Notes |
|------|---------|-------|
| First deploy | `netlify init` | Links to account |
| Deploy preview | `netlify deploy` | Test first |
| Deploy production | `netlify deploy --prod` | Goes live |
| View logs | `netlify logs` | Debug errors |
| Rollback | `netlify rollback` | Undo deploy |
| List env vars | `netlify env:list` | Check config |

### Post-Deployment Verification

- [ ] Site loads at Netlify URL
- [ ] Forms work (if landing page)
- [ ] Auth works (if SaaS)
- [ ] Database queries work
- [ ] API routes functional
- [ ] Env vars loaded
- [ ] Images load

## Command Templates

```bash
# Complete deployment workflow
npm run build  # Test build
netlify deploy  # Preview
# Check preview URL, test features
netlify deploy --prod  # Production

# Quick redeploy (after git push)
git add . && git commit -m "Fix: [description]" && git push
# Auto-deploys if GitHub connected

# Rollback if issues
netlify rollback
```

## Integration with Other Skills

- Use **genesis-stack-setup** for initial Netlify CLI setup
- Use **genesis-archon** for multi-service deployments
- Use **genesis-commands** for pre-deployment checks
- Use **genesis-supabase** for database production config

## Troubleshooting

**Build fails on Netlify**:
```bash
# Check Node version in netlify.toml
[build.environment]
  NODE_VERSION = "18"

# Clear cache
netlify build --clear-cache
```

**Environment variables not working**:
- Client vars: MUST have NEXT_PUBLIC_ prefix
- Server vars: NO prefix needed
- Check spelling matches code exactly

**500 errors in production**:
```bash
# Check function logs
netlify functions:log

# Check deploy logs
netlify logs

# Test API routes directly
curl https://your-site.com/api/[route]
```

**Database connection issues**:
- Verify NEXT_PUBLIC_SUPABASE_URL is set
- Check Supabase project not paused
- Test RLS policies

## Security Checklist

- [ ] Environment variables in Netlify (not in code)
- [ ] API keys rotated for production
- [ ] HTTPS enforced (automatic on Netlify)
- [ ] Security headers configured (netlify.toml)
- [ ] RLS enabled on all Supabase tables

## Deep Dive

For complete deployment patterns, reference:
- docs/DEPLOYMENT_GUIDE.md (Full Netlify setup, troubleshooting, optimization)
- docs/ARCHON_PATTERNS.md (Multi-service deployments)
