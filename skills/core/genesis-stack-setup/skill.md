---
name: genesis-stack-setup
description: Quick integration setup for Supabase, GoHighLevel, CopilotKit, and Netlify
---

# Genesis Stack Setup

## When to Use This Skill

Load this skill when user mentions:
- "setup" OR "configure" OR "integration"
- "supabase" OR "database setup"
- "gohighlevel" OR "ghl" OR "crm"
- "copilotkit" OR "ai features"
- "netlify" OR "deployment"

## Key Patterns

### Pattern 1: Supabase Setup (5 Steps)

```bash
# 1. Install client
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# 2. Environment variables
echo "NEXT_PUBLIC_SUPABASE_URL=your-url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local

# 3. Create client
# lib/supabase.ts
```

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
export const supabase = createClientComponentClient();
```

**Then in Supabase dashboard**: Run SQL for schema (see genesis-saas-app)

### Pattern 2: GoHighLevel Setup (3 Steps)

```bash
# 1. Get API key from GHL Settings → API

# 2. Environment variables
echo "GHL_API_KEY=your-key" >> .env.local
echo "GHL_LOCATION_ID=your-location" >> .env.local

# 3. Create API route
# app/api/leads/route.ts
```

```typescript
export async function POST(request: Request) {
  const data = await request.json();

  await fetch('https://rest.gohighlevel.com/v1/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: data.name.split(' ')[0],
      email: data.email,
      phone: data.phone,
      tags: ['website-lead'],
    }),
  });

  return Response.json({ success: true });
}
```

### Pattern 3: CopilotKit Setup (4 Steps)

```bash
# 1. Install
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/backend openai

# 2. Environment variable
echo "OPENAI_API_KEY=your-key" >> .env.local

# 3. Create providers file
# app/providers.tsx
```

```typescript
'use client';
import { CopilotKit } from '@copilotkit/react-core';

export function Providers({ children }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      {children}
    </CopilotKit>
  );
}
```

```bash
# 4. Create API route
# app/api/copilotkit/route.ts
```

Use **genesis-copilotkit** skill for action patterns

### Pattern 4: Netlify Deployment (3 Steps)

```bash
# 1. Install CLI
npm install -g netlify-cli

# 2. Initialize
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
```

**Set env vars in Netlify dashboard** → Site Settings → Environment Variables

## Quick Reference

| Integration | Install | Env Vars | File |
|-------------|---------|----------|------|
| Supabase | @supabase/supabase-js | NEXT_PUBLIC_SUPABASE_* | lib/supabase.ts |
| GHL | (none) | GHL_API_KEY | app/api/leads/ |
| CopilotKit | @copilotkit/* | OPENAI_API_KEY | app/providers.tsx |
| Netlify | netlify-cli | (in dashboard) | netlify.toml |

### Integration Sequences

**Landing Page**:
1. Next.js + Tailwind (done at project creation)
2. GoHighLevel API (Pattern 2)
3. Netlify (Pattern 4)

**SaaS Application**:
1. Next.js + Tailwind (done at project creation)
2. Supabase (Pattern 1)
3. CopilotKit (Pattern 3) - optional
4. Netlify (Pattern 4)

## Command Templates

```bash
# Full landing page setup
npm install react-hook-form @hookform/resolvers/zod zod
echo "GHL_API_KEY=your-key" >> .env.local
echo "GHL_LOCATION_ID=your-location" >> .env.local

# Full SaaS setup
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
echo "NEXT_PUBLIC_SUPABASE_URL=your-url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local

# Add AI features
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/backend openai
echo "OPENAI_API_KEY=your-key" >> .env.local
```

## Integration with Other Skills

- Use **genesis-landing-page** for GHL form integration details
- Use **genesis-saas-app** for Supabase schema and RLS
- Use **genesis-copilotkit** for AI action patterns
- Use **genesis-deployment** for deployment troubleshooting

## Troubleshooting

**Supabase not connecting**:
- Check NEXT_PUBLIC_ prefix (required for client)
- Verify project is not paused (free tier)
- Test RLS policies

**GHL API errors**:
- Verify API key is active
- Check location ID matches
- Ensure required fields are provided

**CopilotKit not loading**:
- Verify OPENAI_API_KEY is set
- Check /api/copilotkit route exists
- Ensure provider wraps components

**Netlify build fails**:
- Run `npm run build` locally first
- Check all env vars are set in Netlify
- Review build logs for errors

## Deep Dive

For complete setup guides, reference:
- docs/STACK_SETUP.md (step-by-step integration instructions)
