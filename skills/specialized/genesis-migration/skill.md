---
name: genesis-migration
description: Patterns for integrating Genesis structure into existing projects and migrating partial implementations
---

# Genesis Migration

## When to Use This Skill

Load this skill when user mentions:
- "migrate" OR "migration" OR "convert to genesis"
- "existing project" OR "partial project" OR "partially built"
- "integrate genesis" OR "adopt genesis"
- "refactor to genesis" OR "modernize"
- "legacy code" OR "existing codebase"
- "incrementally" OR "step by step migration"

## Key Patterns

### Pattern 1: Migration Assessment

**Step 1: Inventory existing code**
```bash
# Analyze current project structure
cd your-project/
tree -L 3 -I 'node_modules|.next'

# Check what's already built
- [ ] Next.js version: ____
- [ ] Pages vs App Router: ____
- [ ] CSS framework: ____
- [ ] Database: ____
- [ ] Authentication: ____
- [ ] API routes: ____
- [ ] Environment variables: ____
```

**Step 2: Map to Genesis patterns**
```typescript
// Mapping Guide
const mapping = {
  // Existing → Genesis equivalent
  'pages/*': 'app/* (App Router)',
  'styles/globals.css': 'app/globals.css + Tailwind',
  '/api/auth/[...nextauth]': 'lib/supabase.ts (Supabase Auth)',
  'prisma/schema.prisma': 'Supabase schema (SQL)',
  'components/': 'components/ (keep structure)',
  '.env.local': '.env.local (add Genesis vars)',
};
```

**Step 3: Determine migration strategy**

**Option A: Incremental (Recommended)**
- Preserve existing functionality
- Add Genesis patterns alongside
- Migrate piece by piece
- Test each phase

**Option B: Rebuild**
- Start fresh with Genesis template
- Port over custom components
- Faster but riskier

**Option C: Hybrid**
- Keep existing pages
- New features use Genesis patterns
- Gradual replacement

### Pattern 2: Incremental Migration Strategy

**Phase 1: Foundation (Day 1)**
```bash
# 1. Install Genesis dependencies
npm install @supabase/supabase-js  # If not using
npm install @supabase/auth-helpers-nextjs
npm install -D tailwindcss postcss autoprefixer  # If not using

# 2. Set up Tailwind (if missing)
npx tailwindcss init -p

# 3. Add Genesis environment variables
cat >> .env.local << 'EOF'
# Genesis - Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Genesis - GoHighLevel (if needed)
GHL_API_KEY=your-ghl-key
GHL_LOCATION_ID=your-location-id
EOF

# 4. Create lib/ directory for Genesis utilities
mkdir -p lib
```

**Phase 2: Coexistence Setup (Day 1-2)**
```typescript
// lib/supabase.ts - Add Genesis Supabase client
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Keep existing database client if different
// Import from lib/supabase.ts for new features
// Use existing client for legacy features
```

**Phase 3: Migrate One Feature (Day 2-3)**
```bash
# Choose low-risk feature to migrate first
# Example: Contact form

# Before (existing):
pages/contact.tsx → Uses existing form handling

# After (Genesis pattern):
app/contact/page.tsx → Uses genesis-forms pattern
components/forms/ContactForm.tsx → React Hook Form + Zod
app/api/leads/route.ts → GHL integration

# Keep old page until new one tested
# Switch over when ready
```

### Pattern 3: Database Migration

**Existing Prisma → Supabase**

**Step 1: Export schema**
```bash
# Convert Prisma schema to SQL
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql
```

**Step 2: Adapt to Supabase**
```sql
-- migration.sql (adapted for Supabase)

-- Create tables
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

-- Enable RLS (Genesis pattern)
alter table users enable row level security;

-- Create policies
create policy "Users can view own data"
  on users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on users for update
  using (auth.uid() = id);
```

**Step 3: Run in Supabase**
```bash
# Via Supabase Dashboard:
# Project → SQL Editor → New Query → Paste migration.sql → Run

# Or via CLI:
npx supabase db push
```

**Step 4: Dual-write period**
```typescript
// During migration, write to both databases
async function createUser(data) {
  // Write to Supabase (Genesis)
  const { data: supabaseUser } = await supabase
    .from('users')
    .insert(data)
    .select()
    .single();

  // Write to old database (keep in sync)
  const prismaUser = await prisma.user.create({ data });

  return supabaseUser;
}

// After migration complete, remove Prisma writes
```

### Pattern 4: Authentication Migration

**Existing NextAuth → Supabase Auth**

**Step 1: Set up Supabase Auth**
```typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();
```

**Step 2: Create parallel auth routes**
```typescript
// app/auth/callback/route.ts (Supabase)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(requestUrl.origin);
}
```

**Step 3: Gradual user migration**
```typescript
// During login, migrate user to Supabase
async function login(email: string, password: string) {
  // Check if user in Supabase
  const { data: supabaseUser } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (supabaseUser) {
    return supabaseUser;  // Already migrated
  }

  // If not, check old auth
  const nextAuthUser = await signIn('credentials', { email, password });

  if (nextAuthUser) {
    // Migrate to Supabase
    await supabase.auth.signUp({
      email,
      password,  // Or generate new temp password
    });

    // Mark as migrated
    await markUserMigrated(email);
  }
}
```

### Pattern 5: Environment Variable Migration

**Consolidate variables**:
```bash
# Before (scattered)
DATABASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
GOOGLE_CLIENT_ID=...
STRIPE_SECRET_KEY=...

# After (Genesis organized)
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# GoHighLevel
GHL_API_KEY=...
GHL_LOCATION_ID=...

# Optional (keep if still used)
STRIPE_SECRET_KEY=...

# Remove (if migrated to Supabase Auth)
# NEXTAUTH_SECRET
# NEXTAUTH_URL
# GOOGLE_CLIENT_ID (use Supabase OAuth instead)
```

## Quick Reference

| Migration Task | Strategy | Timeline |
|----------------|----------|----------|
| Assessment | Inventory existing code | 1-2 hours |
| Database | Export schema, migrate to Supabase | 1 day |
| Auth | Parallel systems, gradual migration | 2-3 days |
| Single feature | Incremental replacement | 1 day per feature |
| Full migration | Complete Genesis structure | 1-2 weeks |

### Migration Checklist

**Pre-Migration:**
- [ ] Backup existing project
- [ ] Document current functionality
- [ ] Identify dependencies
- [ ] Plan rollback strategy

**During Migration:**
- [ ] Maintain existing functionality
- [ ] Test each phase
- [ ] Monitor for errors
- [ ] Keep dual systems in sync

**Post-Migration:**
- [ ] Remove old code
- [ ] Update documentation
- [ ] Train team on Genesis patterns
- [ ] Clean up environment variables

## Command Templates

```bash
# Migration workflow

# 1. Create feature branch
git checkout -b genesis-migration

# 2. Install Genesis dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# 3. Set up coexistence
mkdir -p lib app/api
# Copy Genesis utilities to lib/

# 4. Migrate one feature at a time
# Test thoroughly
# Commit each phase
git add .
git commit -m "Migrate [feature] to Genesis patterns"

# 5. Deploy to staging
# Test in production-like environment

# 6. Merge to main when stable
git checkout main
git merge genesis-migration
```

## Integration with Other Skills

- Use **genesis-core** to choose target architecture
- Use **genesis-saas-app** for target patterns (if SaaS)
- Use **genesis-landing-page** for target patterns (if landing page)
- Use **genesis-supabase** for database migration
- Use **genesis-testing** to validate each phase
- Use **genesis-troubleshooting** for migration issues

## Migration Strategies by Project Type

### Pages Router → App Router + Genesis

```bash
# Incremental approach
# Keep pages/ and app/ coexisting

# New routes in app/
app/
├── page.tsx (new homepage)
├── dashboard/
│   └── page.tsx (new Genesis pattern)

# Old routes in pages/ (until migrated)
pages/
├── index.tsx (old homepage, redirect to app/)
├── about.tsx (keep until rewritten)
```

### No Database → Supabase

```bash
# Start fresh with Supabase
# 1. Create Supabase project
# 2. Define schema in SQL Editor
# 3. Set up RLS policies
# 4. Integrate with app/api routes

# No migration needed - greenfield setup
```

### Existing Database → Supabase

```bash
# 1. Export data
pg_dump old_database > backup.sql

# 2. Import to Supabase
# Via Dashboard: Database → SQL Editor → Import

# 3. Add RLS policies
# 4. Dual-write during transition
# 5. Switch read traffic
# 6. Deprecate old database
```

## Troubleshooting Migration Issues

**Dependency conflicts**:
```bash
# Check for conflicting packages
npm ls [package-name]

# Remove conflicts
npm uninstall [conflicting-package]

# Install compatible version
npm install [package]@compatible-version
```

**Type errors after migration**:
```typescript
// Update TypeScript types
npm install -D @types/node@latest

// Regenerate Supabase types
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

**Environment variable issues**:
```bash
# Verify all variables set
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Restart dev server after .env changes
pkill -f next-dev
npm run dev
```

## Best Practices

1. **Incremental migration** - Don't rewrite everything at once
2. **Feature flags** - Use flags to toggle between old/new implementations
3. **Dual systems** - Run old and new in parallel during transition
4. **Thorough testing** - Test each migrated feature completely
5. **Rollback plan** - Always have a way to revert
6. **User communication** - Inform users of changes
7. **Data preservation** - Never lose user data during migration

## Deep Dive

For complete migration patterns, reference:
- Next.js App Router Migration: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration
- Supabase Migration Guide: https://supabase.com/docs/guides/database/migrating-to-supabase
- Genesis setup patterns: docs/STACK_SETUP.md
