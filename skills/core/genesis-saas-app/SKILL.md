---
name: genesis-saas-app
description: Multi-tenant SaaS architecture with authentication and database patterns
---

# Genesis SaaS Application

## When to Use This Skill

Load this skill when user mentions:
- "saas" OR "saas app" OR "saas application"
- "multi-tenant" OR "multi tenant" OR "multitenancy"
- "user authentication" OR "user login" OR "sign up"
- "dashboard" OR "user dashboard"
- "subscription" OR "billing" OR "payments"

## Key Patterns

### Pattern 1: Multi-Tenant Database (Schema-First)

```sql
-- 1. Profiles table (linked to Supabase Auth)
create table profiles (
  id uuid primary key references auth.users(id),
  email text unique not null,
  full_name text,
  created_at timestamptz default now()
);

-- 2. Tenant-isolated resources
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  name text not null,
  created_at timestamptz default now()
);

-- 3. Row Level Security (RLS) - CRITICAL
alter table projects enable row level security;

create policy "Users can CRUD own projects"
  on projects for all
  using (auth.uid() = user_id);
```

**Rule**: Every resource table has `user_id` + RLS policy

### Pattern 2: Authentication Flow

```typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};
```

**Protected routes**:
```typescript
// app/dashboard/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  return <div>{children}</div>;
}
```

### Pattern 3: CRUD Operations

```typescript
// lib/api/projects.ts
export const createProject = async (name: string) => {
  const { data } = await supabase
    .from('projects')
    .insert({ name })
    .select()
    .single();
  return data;
};

export const getProjects = async () => {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  return data;
};

export const updateProject = async (id: string, updates: any) => {
  const { data } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return data;
};

export const deleteProject = async (id: string) => {
  await supabase.from('projects').delete().eq('id', id);
};
```

**RLS automatically isolates by user** - no manual filtering needed!

### Pattern 4: Dashboard Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── auth/callback/route.ts
├── dashboard/
│   ├── layout.tsx          # Protected wrapper
│   ├── page.tsx            # Main dashboard
│   ├── projects/page.tsx   # Feature pages
│   └── settings/page.tsx   # User settings
└── api/
    └── [resources]/route.ts
```

### Pattern 5: AI Features (Optional with CopilotKit)

```typescript
// app/providers.tsx
import { CopilotKit } from '@copilotkit/react-core';

export function Providers({ children }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      {children}
    </CopilotKit>
  );
}

// Use genesis-copilotkit skill for detailed patterns
```

## Quick Reference

| Need | Pattern | File Location |
|------|---------|---------------|
| Auth | Supabase Auth | lib/supabase.ts |
| Protected Routes | Server Component | app/dashboard/layout.tsx |
| CRUD | RLS + Supabase Client | lib/api/*.ts |
| Multi-tenant | RLS Policies | Supabase SQL |
| State | Context/Zustand | contexts/ |

### Security Checklist

- [ ] RLS enabled on ALL tables
- [ ] Auth required for protected routes
- [ ] Environment variables secured
- [ ] User isolation tested (try accessing other user's data)

## Command Templates

```bash
# Install SaaS dependencies
npm install @supabase/auth-helpers-nextjs

# Optional: AI features
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/backend openai

# Optional: Payments
npm install stripe

# Create directories
mkdir -p app/\(auth\)/login app/dashboard lib/api contexts
```

## Integration with Other Skills

- Use **genesis-stack-setup** for Supabase configuration
- Use **genesis-copilotkit** for AI features integration
- Use **genesis-deployment** for production deployment
- Use **genesis-testing** for validation patterns
- For landing page (lead gen before SaaS), use **genesis-landing-page** first

## Deep Dive

For complete patterns, reference:
- docs/SAAS_ARCHITECTURE.md (full multi-tenant patterns, auth flows, CRUD examples)
