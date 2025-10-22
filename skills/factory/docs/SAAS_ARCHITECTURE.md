# Genesis SaaS Architecture

## Purpose
Multi-tenant SaaS applications with user authentication, subscriptions, and scalable architecture.

## Core Architecture Pattern

```
SaaS Application
├── Authentication Layer
│   ├── Sign Up
│   ├── Sign In
│   ├── Password Reset
│   └── Email Verification
├── User Dashboard
│   ├── Profile Management
│   ├── Settings
│   └── Usage Metrics
├── Core Features
│   ├── Feature 1 (tenant-isolated)
│   ├── Feature 2 (tenant-isolated)
│   └── Feature N (tenant-isolated)
├── Subscription/Billing (optional)
│   ├── Plan Selection
│   ├── Payment Processing
│   └── Usage Limits
└── Admin Panel (optional)
    ├── User Management
    ├── Analytics
    └── System Settings
```

## Multi-Tenant Database Pattern

### Schema-First Design

```sql
-- Core tenant/user tables
create table profiles (
  id uuid primary key references auth.users(id),
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Example tenant-isolated resource
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table projects enable row level security;

-- Users can only read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can only access their own projects
create policy "Users can CRUD own projects"
  on projects for all
  using (auth.uid() = user_id);
```

## Authentication Pattern

### Supabase Auth Integration

```typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
```

### Protected Route Pattern

```typescript
// app/dashboard/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return <div>{children}</div>;
}
```

## User Dashboard Pattern

### Dashboard Layout

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user's data
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id);

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <ProjectsList projects={projects} />
      <CreateProjectButton />
    </div>
  );
}
```

## State Management Pattern

### Context-Based State

```typescript
// contexts/AppContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface AppContextType {
  user: any;
  projects: any[];
  setProjects: (projects: any[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState([]);

  return (
    <AppContext.Provider value={{ projects, setProjects }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
```

## CRUD Pattern for Features

### Standard Resource CRUD

```typescript
// lib/api/projects.ts
export const createProject = async (name: string, description: string) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, description })
    .select()
    .single();

  return { data, error };
};

export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

export const updateProject = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteProject = async (id: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  return { error };
};
```

## AI Features Integration (CopilotKit)

### CopilotKit Pattern

```typescript
// app/providers.tsx
'use client';

import { CopilotKit } from '@copilotkit/react-core';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      {children}
    </CopilotKit>
  );
}

// app/api/copilotkit/route.ts
import { CopilotRuntime, OpenAIAdapter } from '@copilotkit/backend';

export async function POST(req: Request) {
  const copilotKit = new CopilotRuntime();
  return copilotKit.response(req, new OpenAIAdapter());
}
```

## Subscription/Billing Pattern (Optional)

### Stripe Integration

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (
  priceId: string,
  userId: string
) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    client_reference_id: userId,
  });

  return session;
};
```

## Deployment Architecture

### Production Setup

```
Frontend (Netlify)
├── Next.js App Router
├── Static Assets (CDN)
└── Serverless Functions

Backend Services
├── Supabase (Database + Auth)
├── Stripe (Payments)
└── OpenAI (AI Features via CopilotKit)
```

## Security Checklist

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Authentication required for protected routes
- [ ] Environment variables secured (never in client)
- [ ] CORS configured correctly
- [ ] Rate limiting on API routes
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS prevention (React default escaping)

## Performance Optimizations

- Server Components for data fetching (reduce client JS)
- Incremental Static Regeneration (ISR) for public pages
- Database indexes on frequently queried columns
- Optimistic UI updates for better UX
- React Suspense for loading states
- Image optimization (next/image)

## Testing Strategy

- Unit tests: Core business logic
- Integration tests: API routes
- E2E tests: Critical user flows (auth, CRUD)
- Manual QA: Multi-tenant isolation verification
