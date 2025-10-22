# Claude Code Instructions for Genesis Projects

## Development Workflow

### Phase 1: Project Initialization

**Commands Sequence**:
```bash
# 1. Create project
npx create-next-app@latest [project-name] --typescript --tailwind --app
cd [project-name]

# 2. Install dependencies based on project type
# For Landing Page:
npm install @supabase/supabase-js react-hook-form @hookform/resolvers/zod zod

# For SaaS App (include above plus):
npm install @supabase/auth-helpers-nextjs @copilotkit/react-core @copilotkit/react-ui @copilotkit/backend openai

# 3. Initialize git
git init
git add .
git commit -m "Initial Genesis project setup"

# 4. Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GHL_API_KEY=
OPENAI_API_KEY=
EOF
```

### Phase 2: Core Setup

**File Creation Order**:

1. **Supabase Client** (`lib/supabase.ts`)
2. **Type Definitions** (`types/index.ts`)
3. **Layout Components** (`components/layout/`)
4. **API Routes** (`app/api/`)
5. **Pages** (`app/`)

**Checkpoint 1**: Run `npm run dev` and verify app loads

### Phase 3: Feature Implementation

**For Landing Pages**:
```bash
# Create components
mkdir -p components/forms components/sections

# Create form component
# components/forms/LeadCaptureForm.tsx

# Create API route
# app/api/leads/route.ts

# Update homepage
# app/page.tsx
```

**Checkpoint 2**: Test form submission to GoHighLevel

**For SaaS Apps**:
```bash
# Set up auth
# app/login/page.tsx
# app/signup/page.tsx
# app/api/auth/callback/route.ts

# Create dashboard
mkdir -p app/dashboard
# app/dashboard/layout.tsx (protected)
# app/dashboard/page.tsx

# Set up database
# Run SQL in Supabase dashboard

# Create CRUD operations
mkdir -p lib/api
# lib/api/[resource].ts
```

**Checkpoint 3**: Test authentication flow and CRUD operations

### Phase 4: AI Features (CopilotKit)

```bash
# 1. Create providers
# app/providers.tsx

# 2. Wrap app in providers
# app/layout.tsx

# 3. Create CopilotKit API route
# app/api/copilotkit/route.ts

# 4. Add CopilotKit actions to components
# Use useCopilotAction in relevant pages
```

**Checkpoint 4**: Test AI assistant functionality

### Phase 5: Deployment

```bash
# 1. Build test
npm run build

# 2. Initialize Netlify
netlify init

# 3. Deploy
netlify deploy --prod

# 4. Set environment variables in Netlify dashboard

# 5. Verify deployment
# Test all features in production
```

**Checkpoint 5**: Production deployment successful

## Command Templates

### Quick Supabase Schema Creation

```sql
-- Template for new resource table
create table [resource_name] (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  -- Add resource-specific fields here
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table [resource_name] enable row level security;

-- Standard RLS policies
create policy "Users can CRUD own [resource_name]"
  on [resource_name] for all
  using (auth.uid() = user_id);
```

### Quick API Route Template

```typescript
// app/api/[resource]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('[table_name]')
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### Quick Component Template

```typescript
// components/[ComponentName].tsx
'use client';

import { useState } from 'react';

interface [ComponentName]Props {
  // Define props
}

export function [ComponentName]({ }: [ComponentName]Props) {
  const [state, setState] = useState();

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Best Practices for Claude Code

### 1. Always Create Checkpoints
After each major milestone, create a checkpoint:
```bash
git add .
git commit -m "Checkpoint: [Milestone description]"
```

### 2. Test Incrementally
Don't build everything before testing. Test after each feature:
```bash
npm run dev
# Manual test in browser
# Fix any issues before proceeding
```

### 3. Environment Variables First
Before implementing integrations, ensure env vars are set:
```bash
# Check env file exists
cat .env.local

# Never commit .env.local
git status  # Should not show .env.local
```

### 4. Database-First for SaaS
Create and test database schema before building UI:
```sql
-- 1. Create tables
-- 2. Enable RLS
-- 3. Create policies
-- 4. Test with SQL queries
-- Then build UI
```

### 5. Component-First for Landing Pages
Build reusable components before pages:
```bash
# 1. Create UI components (buttons, inputs)
# 2. Create form components
# 3. Create section components
# 4. Assemble into page
```

## Debugging Commands

```bash
# Check build errors
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Check linting
npm run lint

# View Netlify logs
netlify logs

# Test Supabase connection
# Add to any component:
console.log(await supabase.from('profiles').select('*').limit(1));
```

## Common Pitfalls to Avoid

1. **Don't skip RLS setup** - Always enable and test RLS policies
2. **Don't hardcode secrets** - Use environment variables
3. **Don't deploy without testing** - Run `npm run build` locally first
4. **Don't forget mobile** - Test responsive design
5. **Don't ignore TypeScript errors** - Fix types before deploying

## Thread Transition Checklist

When continuing in a new thread, provide:

```markdown
## Project Context
- Project Type: [Landing Page / SaaS App]
- Current Phase: [Initialization / Development / Deployment]
- Stack: Next.js 14, Supabase, [Other integrations]

## Completed Milestones
- [x] Checkpoint 1: Initial setup
- [x] Checkpoint 2: [Description]
- [ ] Current: [What we're working on]

## Current File Structure
```
app/
├── page.tsx
├── layout.tsx
├── api/
│   └── [routes]
components/
└── [components]
lib/
└── [utilities]
```

## Next Steps
1. [Immediate next task]
2. [Following task]
```

This helps Claude Code understand exactly where you are and what to do next.
