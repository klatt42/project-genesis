---
name: genesis-supabase
description: Database schema design, RLS policies, and Supabase best practices
---

# Genesis Supabase

## When to Use This Skill

Load this skill when user mentions:
- "database" OR "db" OR "schema"
- "supabase" OR "postgres" OR "postgresql"
- "rls" OR "row level security" OR "policies"
- "migration" OR "table" OR "sql"
- "database design" OR "data model"

## Key Patterns

### Pattern 1: Schema-First Design (Multi-Tenant)

```sql
-- 1. Profiles table (linked to auth.users)
create table profiles (
  id uuid primary key references auth.users(id),
  email text unique not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Resource table (tenant-isolated)
create table [resource_name] (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Enable RLS (CRITICAL - never skip!)
alter table profiles enable row level security;
alter table [resource_name] enable row level security;

-- 4. RLS Policies
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can CRUD own [resource]"
  on [resource_name] for all
  using (auth.uid() = user_id);
```

**Rule**: Every table MUST have RLS enabled + policy

### Pattern 2: Standard RLS Policies

```sql
-- SELECT (read)
create policy "Users can select own data"
  on [table] for select
  using (auth.uid() = user_id);

-- INSERT (create)
create policy "Users can insert own data"
  on [table] for insert
  with check (auth.uid() = user_id);

-- UPDATE (edit)
create policy "Users can update own data"
  on [table] for update
  using (auth.uid() = user_id);

-- DELETE (remove)
create policy "Users can delete own data"
  on [table] for delete
  using (auth.uid() = user_id);

-- OR combine all:
create policy "Users can CRUD own data"
  on [table] for all
  using (auth.uid() = user_id);
```

### Pattern 3: Common Field Types

```sql
-- Text fields
name text not null,
description text,
email text unique not null,

-- Numbers
count integer default 0,
price numeric(10,2),  -- Money: 2 decimals
rating real,  -- Float

-- Booleans
is_active boolean default true,
is_deleted boolean default false,

-- Dates
created_at timestamptz default now(),
updated_at timestamptz default now(),
deadline date,

-- JSON
metadata jsonb default '{}'::jsonb,
settings jsonb,

-- References
user_id uuid references profiles(id) not null,
project_id uuid references projects(id) on delete cascade,

-- Arrays
tags text[] default '{}',
```

### Pattern 4: Database Client Setup

```typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// Basic CRUD
export const getItems = async () => {
  const { data } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });
  return data;
};

export const createItem = async (name: string) => {
  const { data } = await supabase
    .from('items')
    .insert({ name })
    .select()
    .single();
  return data;
};
```

**RLS automatically filters by user** - no manual WHERE needed!

### Pattern 5: Supabase CLI & Migrations

```bash
# Install Supabase CLI
brew install supabase/tap/supabase  # Mac
# OR
npm install -g supabase

# Initialize
supabase init

# Link to project
supabase link --project-ref your-project-ref

# Create migration
supabase migration new create_projects_table

# Push to database
supabase db push

# Pull from database
supabase db pull
```

## Quick Reference

| Need | SQL Pattern | RLS Policy |
|------|-------------|-----------|
| User profiles | references auth.users(id) | auth.uid() = id |
| User resources | user_id uuid references profiles(id) | auth.uid() = user_id |
| Timestamps | timestamptz default now() | N/A |
| Soft delete | is_deleted boolean default false | AND NOT is_deleted |
| JSON data | jsonb default '{}'::jsonb | N/A |

### Common Queries

```typescript
// Filter
.select('*').eq('status', 'active')

// Search
.select('*').ilike('name', '%search%')

// Range
.select('*').gte('created_at', '2024-01-01')

// Join
.select('*, projects(name)')

// Count
.select('*', { count: 'exact', head: true })

// Order + Limit
.select('*').order('created_at', { ascending: false }).limit(10)
```

## Command Templates

```bash
# Quick schema creation
supabase migration new add_projects_table
# Edit migration file with SQL
supabase db push

# Reset database (dev only!)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --project-id your-id > types/database.ts
```

## Integration with Other Skills

- Use **genesis-saas-app** for complete multi-tenant patterns
- Use **genesis-stack-setup** for Supabase client setup
- Use **genesis-deployment** for production database config
- Combine with **genesis-copilotkit** for AI-powered queries

## Security Checklist

- [ ] RLS enabled on ALL tables
- [ ] Every table has at least one policy
- [ ] Test RLS: Try accessing other user's data (should fail)
- [ ] Never use service_role key in client code
- [ ] Environment variables use NEXT_PUBLIC_ prefix (client)

## Troubleshooting

**RLS blocking my queries**:
- Check policy using clause: `auth.uid() = user_id`
- Verify user is authenticated
- Test policy in Supabase SQL editor

**Can't insert data**:
- Check INSERT policy exists (or use "for all")
- Verify required fields are provided
- Check foreign key constraints

**Performance issues**:
- Add indexes on frequently queried columns
- Use select('specific,fields') not select('*')
- Enable connection pooling (Supabase settings)

## Deep Dive

For complete Supabase patterns, reference:
- docs/STACK_SETUP.md (Supabase setup steps, configuration)
- docs/SAAS_ARCHITECTURE.md (Multi-tenant database patterns, RLS examples)
