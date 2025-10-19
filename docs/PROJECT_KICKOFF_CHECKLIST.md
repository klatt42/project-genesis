# Project Genesis - Kickoff Checklist

**Version**: 2.0
**Last Updated**: October 19, 2025
**Purpose**: Complete checklist for starting a new Genesis project

---

## Pre-Kickoff Preparation

### 1. Requirements Gathering

- [ ] Project idea/requirements documented
- [ ] Target users identified
- [ ] Key features prioritized (MVP vs nice-to-have)
- [ ] Timeline and budget estimated
- [ ] Success metrics defined

### 2. Account Setup

- [ ] Supabase account created
- [ ] GitHub account ready
- [ ] Netlify/Vercel account ready (deployment)
- [ ] Domain purchased (if needed)
- [ ] API keys secured (Anthropic, GoHighLevel, etc.)

---

## Database Setup

### 3. Supabase Configuration

- [ ] Create Supabase project
- [ ] Save project credentials (URL, anon key, service key)
- [ ] Save database password
- [ ] **Get Project Reference ID** (for type generation)
- [ ] Deploy initial schema to Supabase
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Create RLS policies for auth

### 4. TypeScript Type Generation ⭐ NEW

**Genesis Standard**: Auto-generate types from schema, never write manually

- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Add type generation script to package.json:
  ```json
  {
    "scripts": {
      "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > lib/types/database.ts"
    }
  }
  ```
- [ ] Set SUPABASE_PROJECT_ID in .env.local
- [ ] Create lib/types directory: `mkdir -p lib/types`
- [ ] **Generate initial types**: `npm run db:types`
- [ ] Commit generated types to git
- [ ] **RULE**: Regenerate types after every schema change

**Why This Matters**: Prevents 85% of database-related type errors. Saves 40 min/project in debugging.

**Reference**: [Schema-to-TypeScript Sync Pattern](./patterns/STACK_SETUP.md#schema-to-typescript-sync-pattern-auto-generate-types)

---

## Project Setup

### 5. Initialize Next.js Project

- [ ] Create Next.js app: `npx create-next-app@latest --typescript --tailwind --app`
- [ ] Install Supabase client: `npm install @supabase/supabase-js @supabase/ssr`
- [ ] Configure environment variables (.env.local)
- [ ] Create Supabase client (browser & server)
- [ ] Add generated types to Supabase client:
  ```typescript
  import type { Database } from '@/lib/types/database'
  createClient<Database>(url, key)
  ```
- [ ] Set up authentication middleware
- [ ] Configure Tailwind CSS

### 6. Authentication Implementation

- [ ] Create signup page/component
- [ ] Create login page/component
- [ ] Implement server actions for auth
- [ ] Create profile auto-creation (if needed)
- [ ] Test signup → login flow
- [ ] Verify session persistence

---

## Development Workflow

### 7. Git Setup

- [ ] Initialize git repository
- [ ] Create .gitignore (exclude .env.local, node_modules)
- [ ] Create GitHub repository
- [ ] Push initial commit
- [ ] Set up branch protection (main/master)
- [ ] Configure PR requirements

### 8. CI/CD Pipeline

- [ ] Connect repository to Netlify/Vercel
- [ ] Configure build settings
- [ ] Add environment variables to hosting platform
- [ ] Test deployment with sample changes
- [ ] Set up preview deployments for PRs

---

## Feature Development

### 9. Core Features Implementation

For each feature:

- [ ] Create database tables/columns
- [ ] **Regenerate types**: `npm run db:types` ⭐
- [ ] Verify type changes: `git diff lib/types/database.ts`
- [ ] Create API routes (use generated types)
- [ ] Create UI components
- [ ] Test CRUD operations
- [ ] Add error handling
- [ ] Commit changes (schema + types together)

**Type Generation Workflow**:
```bash
# After schema changes
npm run db:types
git diff lib/types/database.ts  # Verify
git add lib/types/database.ts schema.sql
git commit -m "feat: Add [feature] with type updates"
```

### 10. External API Integration (if needed)

- [ ] Obtain API keys
- [ ] Add to environment variables
- [ ] Create API client/wrapper
- [ ] Implement error handling
- [ ] Add response validation
- [ ] Test API calls
- [ ] Document rate limits/costs

---

## Quality Assurance

### 11. Testing

- [ ] Test all features end-to-end
- [ ] Test authentication flow
- [ ] Test database operations
- [ ] Verify RLS policies work correctly
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Check browser compatibility
- [ ] Test loading states and errors

### 12. Code Quality

- [ ] TypeScript strict mode enabled
- [ ] No TypeScript errors
- [ ] ESLint configured and passing
- [ ] Prettier configured
- [ ] **All database queries use generated types** ⭐
- [ ] Code reviewed
- [ ] Security audit completed

---

## Pre-Launch

### 13. Documentation

- [ ] README.md updated
- [ ] API documentation created
- [ ] Environment variables documented
- [ ] Deployment instructions written
- [ ] Database schema documented

### 14. Performance Optimization

- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] Bundle size analyzed
- [ ] Lighthouse score > 90

### 15. Security Review

- [ ] Environment variables secured
- [ ] RLS policies tested
- [ ] API keys rotated (if testing keys used)
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting implemented (if needed)

---

## Deployment

### 16. Production Deployment

- [ ] Merge to main branch
- [ ] Monitor deployment
- [ ] Verify production build
- [ ] Test production URL
- [ ] Check database connections
- [ ] Verify authentication works

### 17. Post-Deployment

- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (PostHog, GA)
- [ ] Set up uptime monitoring
- [ ] Create backup strategy
- [ ] Document rollback procedure

---

## Maintenance

### 18. Ongoing Tasks

- [ ] Monitor error logs daily
- [ ] Review analytics weekly
- [ ] Update dependencies monthly
- [ ] **Regenerate types after schema changes** ⭐
- [ ] Back up database regularly
- [ ] Review and optimize performance

---

## Genesis-Specific Checklist

### 19. Genesis Pattern Compliance

- [ ] Using Supabase + Next.js + TypeScript stack
- [ ] **Types auto-generated from schema** ⭐
- [ ] Following Scout → Plan → Build workflow
- [ ] Using Genesis patterns for integrations
- [ ] Documentation follows Genesis standards
- [ ] Quality score ≥ 8.0/10

### 20. Agent Coordination (if using Genesis Agents)

- [ ] Scout Agent completed requirements analysis
- [ ] Planner Agent generated task graph
- [ ] Builder Agents assigned features
- [ ] Deployment Agent configured
- [ ] Monitoring Agents set up

---

## Common Pitfalls to Avoid

**Database & Types**:
- ❌ Writing manual TypeScript types for database tables
- ✅ Always use `npm run db:types` after schema changes
- ❌ Deploying without regenerating types
- ✅ Commit schema.sql and database.ts together

**Authentication**:
- ❌ Manual profile creation in signup (causes RLS violations)
- ✅ Use SECURITY DEFINER database function
- ❌ Storing sensitive data in auth.users table
- ✅ Use separate profiles table with foreign key

**Development**:
- ❌ Committing .env.local to git
- ✅ Add to .gitignore and use .env.example template
- ❌ Using same API keys for dev and production
- ✅ Rotate keys before launch

---

## Success Metrics

### Project is Ready When:

- ✅ All features working as expected
- ✅ Zero TypeScript errors
- ✅ **All database queries type-safe with generated types**
- ✅ Authentication flow tested
- ✅ Mobile responsive
- ✅ Performance score > 90
- ✅ Security review passed
- ✅ Deployed to production
- ✅ Monitoring configured

---

## Quick Reference: Type Generation

**Initial Setup**:
```bash
npm install -g supabase
npm install @supabase/supabase-js @supabase/ssr
mkdir -p lib/types
```

**Add to package.json**:
```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > lib/types/database.ts"
  }
}
```

**Add to .env.local**:
```bash
SUPABASE_PROJECT_ID=your-project-ref-id
```

**Workflow**:
```bash
# After every schema change:
npm run db:types
git diff lib/types/database.ts
git add lib/types/database.ts schema.sql
git commit -m "feat: Update schema and regenerate types"
```

**Reference**: [Complete Type Generation Guide](./patterns/STACK_SETUP.md#schema-to-typescript-sync-pattern-auto-generate-types)

---

## Resources

- [Genesis Kernel](../GENESIS_KERNEL.md) - Core patterns and commands
- [Stack Setup Guide](./patterns/STACK_SETUP.md) - Complete tech stack setup
- [Claude Code Integration](../CLAUDE_CODE_INTEGRATION.md) - AI-powered development
- [Genesis MCP Server](../agents/genesis-mcp/README.md) - Pattern access

---

**Last Updated**: October 19, 2025
**Pattern Additions**: Schema-to-TypeScript Sync (PastorAid Project)
**Status**: ✅ Production-Ready
