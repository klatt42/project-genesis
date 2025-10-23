---
name: genesis-troubleshooting
description: Systematic debugging patterns for Genesis projects including common errors and integration issues
---

# Genesis Troubleshooting

## When to Use This Skill

Load this skill when user mentions:
- "error" OR "not working" OR "broken"
- "debug" OR "debugging" OR "troubleshoot"
- "fix" OR "issue" OR "problem"
- "connection failed" OR "can't connect"
- "build failed" OR "deployment failed"
- "cors" OR "401" OR "403" OR "500"

## Key Patterns

### Pattern 1: Supabase Connection Issues

**Error: "Invalid API key"**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Common fixes:
# 1. Restart dev server
pkill -f next-dev
npm run dev

# 2. Verify .env.local format
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 3. Check Supabase dashboard
# Project Settings → API → URL and anon key match
```

**Error: "No API key found"**
```typescript
// Check client initialization
// ❌ Wrong:
const supabase = createClient(undefined, undefined);

// ✅ Correct:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Or use helper:
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient();
```

**Error: "Row Level Security policy violation"**
```sql
-- Debug RLS issues

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 2. View existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- 3. Test policy as user
SET request.jwt.claims = '{"sub":"user-id-here"}';
SELECT * FROM your_table;

-- 4. Fix: Add missing policy
CREATE POLICY "Users can view own data"
  ON your_table FOR SELECT
  USING (auth.uid() = user_id);
```

### Pattern 2: GoHighLevel Integration Issues

**Error: "GHL_API_KEY is not defined"**
```bash
# Check environment variables
cat .env.local | grep GHL

# Should see:
# GHL_API_KEY=your-key-here
# GHL_LOCATION_ID=your-location-id

# Fix: Add missing variables
echo "GHL_API_KEY=your-key" >> .env.local
echo "GHL_LOCATION_ID=your-id" >> .env.local

# Restart server
npm run dev
```

**Error: "401 Unauthorized" from GHL**
```typescript
// Check API key format
// app/api/leads/route.ts

// ❌ Wrong:
headers: {
  'Authorization': `${process.env.GHL_API_KEY}`,  // Missing Bearer
}

// ✅ Correct:
headers: {
  'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
  'Content-Type': 'application/json',
}
```

**Error: "Contact not created in GHL"**
```typescript
// Debug GHL API call
export async function POST(request: Request) {
  const data = await request.json();

  console.log('Sending to GHL:', data);  // Debug payload

  const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: data.name,
      email: data.email,
      phone: data.phone,
      tags: ['website-lead'],
    }),
  });

  const result = await response.json();
  console.log('GHL response:', result);  // Debug response

  if (!response.ok) {
    console.error('GHL error:', result);
    return Response.json({ error: result }, { status: response.status });
  }

  return Response.json({ success: true, data: result });
}
```

### Pattern 3: CopilotKit Integration Issues

**Error: "CopilotKit context not found"**
```typescript
// Check provider setup
// ❌ Missing provider:
export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}

// ✅ With provider:
import { CopilotKit } from '@copilotkit/react-core';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit">
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

**Error: "Runtime endpoint not responding"**
```bash
# Check API route exists
ls app/api/copilotkit/route.ts

# If missing, create:
# app/api/copilotkit/route.ts
```

```typescript
import { CopilotRuntime, OpenAIAdapter } from '@copilotkit/runtime';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const copilotKit = new CopilotRuntime();

  return copilotKit.response(req, new OpenAIAdapter({
    apiKey: process.env.OPENAI_API_KEY,
  }));
}
```

### Pattern 4: Build & Deployment Errors

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build

# Check imports
# ❌ Wrong:
import { supabase } from '@/lib/supabase';  // Missing file

# ✅ Correct:
import { supabase } from '@/lib/supabase';  // File exists at lib/supabase.ts
```

**Error: "Environment variables undefined in production"**
```bash
# Netlify: Set in dashboard
# Site Settings → Environment Variables → Add:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# GHL_API_KEY
# GHL_LOCATION_ID

# Or via CLI:
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your-url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-key"
netlify env:set GHL_API_KEY "your-key"

# Redeploy
netlify deploy --prod
```

**Error: "Build exceeded maximum duration"**
```bash
# Optimize build

# 1. Check build logs
netlify logs

# 2. Reduce build time
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPX_VERSION = "latest"

# 3. Enable caching
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Pattern 5: CORS Errors

**Error: "CORS policy blocked"**
```typescript
// Add CORS headers to API routes
// app/api/your-route/route.ts

export async function POST(request: Request) {
  const origin = request.headers.get('origin');

  // Your API logic here
  const response = Response.json({ success: true });

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', origin || '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}

// Handle OPTIONS preflight
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');

  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

## Quick Reference

| Error Type | Common Cause | Quick Fix |
|------------|--------------|-----------|
| Supabase 401 | Wrong API key | Check .env.local, restart dev |
| GHL 401 | Missing Bearer | Add "Bearer " prefix |
| RLS violation | Missing policy | Add SELECT/INSERT policy |
| Module not found | Cache issue | `rm -rf .next && npm install` |
| CORS error | Missing headers | Add CORS headers to API route |
| Build timeout | Large dependencies | Optimize imports, enable cache |

### Debug Workflow

```bash
# 1. Identify error category
# - Connection (Supabase, GHL, API)
# - Build/Deploy
# - Runtime
# - Authentication

# 2. Check logs
npm run dev  # Development
netlify logs  # Production

# 3. Verify environment
echo $NEXT_PUBLIC_SUPABASE_URL
cat .env.local

# 4. Test in isolation
curl http://localhost:3000/api/test

# 5. Check external services
# Supabase Dashboard → Logs
# GHL → API Logs
```

## Command Templates

```bash
# Troubleshooting commands

# Reset local development
rm -rf .next node_modules
npm install
npm run dev

# Check API route
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'

# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('$NEXT_PUBLIC_SUPABASE_URL', '$NEXT_PUBLIC_SUPABASE_ANON_KEY');
supabase.from('profiles').select('*').limit(1).then(console.log);
"

# Check build locally
npm run build
npm start

# View production logs (Netlify)
netlify logs --function=your-function

# Check environment variables
netlify env:list
```

## Integration with Other Skills

- Use **genesis-stack-setup** to verify correct initial setup
- Use **genesis-supabase** for database-specific issues
- Use **genesis-deployment** for production debugging
- Use **genesis-testing** to prevent issues before deployment
- Reference **genesis-core** for project structure issues

## Common Error Patterns

### Type Errors

```typescript
// Error: Type 'null' is not assignable to type 'string'
// Fix: Add null check
const value = data?.field ?? '';  // Provide default

// Error: Property 'user' does not exist
// Fix: Type your Supabase queries
import { Database } from '@/types/supabase';
const supabase = createClient<Database>(...);
```

### Authentication Errors

```typescript
// Error: No user found
// Debug:
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// If null, user not logged in
if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Database Errors

```sql
-- Error: column "user_id" does not exist
-- Fix: Check table schema
\d your_table  -- In Supabase SQL Editor

-- Add missing column
ALTER TABLE your_table ADD COLUMN user_id uuid REFERENCES auth.users(id);
```

## Debugging Checklist

**Before troubleshooting:**
- [ ] Read the complete error message
- [ ] Check browser console
- [ ] Check terminal/server logs
- [ ] Verify recent code changes

**Environment check:**
- [ ] .env.local exists with all variables
- [ ] Variables have correct format (no quotes, spaces)
- [ ] Dev server restarted after .env changes
- [ ] Correct Node version (18+)

**Code check:**
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Imports resolve correctly
- [ ] API routes exist and export correct methods

**External services:**
- [ ] Supabase project active (not paused)
- [ ] GHL API key valid
- [ ] Network connectivity
- [ ] Third-party service status

## Emergency Fixes

**Site down in production:**
```bash
# 1. Check latest deployment status
netlify status

# 2. View deploy logs
netlify logs

# 3. Rollback if needed
netlify rollback

# 4. Fix locally, redeploy
git revert HEAD  # If last commit broke it
npm run build  # Test locally
netlify deploy --prod
```

**Database queries failing:**
```sql
-- 1. Disable RLS temporarily (debug only)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;

-- 2. Test query
SELECT * FROM your_table;

-- 3. Re-enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- 4. Fix policy
CREATE POLICY "temp_allow_all" ON your_table FOR ALL USING (true);
```

**API route timing out:**
```typescript
// Add timeout and better error handling
export async function POST(request: Request) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);  // 10s timeout

    const response = await fetch(externalApi, {
      signal: controller.signal,
      // ...
    });

    clearTimeout(timeout);
    return Response.json(await response.json());
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Request failed', details: error.message },
      { status: 500 }
    );
  }
}
```

## Best Practices

1. **Error logging** - Always log errors with context
2. **Graceful degradation** - Handle failures gracefully
3. **Environment checks** - Verify config before operations
4. **Type safety** - Use TypeScript to catch errors early
5. **Testing** - Test each integration in isolation
6. **Monitoring** - Set up error tracking (Sentry, etc.)
7. **Documentation** - Document known issues and fixes

## Deep Dive

For specific integration debugging:
- Supabase debugging: https://supabase.com/docs/guides/platform/logs
- Next.js debugging: https://nextjs.org/docs/app/building-your-application/configuring/debugging
- Netlify debugging: https://docs.netlify.com/monitor-sites/logs/
