# Genesis Stack Setup Guide

## Core Stack Components

### 1. Next.js 14 (App Router)

**Installation**:
```bash
npx create-next-app@latest [project-name] --typescript --tailwind --app
cd [project-name]
```

**Key Configuration**:
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['yourdomain.com'],
  },
  experimental: {
    serverActions: true,
  },
};
```

### 2. Supabase Setup

**Step 1: Create Project**
1. Go to supabase.com
2. Create new project
3. Note: Project URL and anon key

**Step 2: Install Client**
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

**Step 3: Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Step 4: Initialize Client**
```typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();
```

**Step 5: Database Schema**
```sql
-- Run in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid primary key references auth.users(id),
  email text unique not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- RLS Policy
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
```

### 3. GoHighLevel Integration (Landing Pages)

**Step 1: Get API Key**
1. Login to GoHighLevel
2. Settings → API
3. Generate API key

**Step 2: Environment Variable**
```bash
# .env.local
GHL_API_KEY=your-ghl-api-key
GHL_LOCATION_ID=your-location-id
```

**Step 3: API Route**
```typescript
// app/api/leads/route.ts
export async function POST(request: Request) {
  const data = await request.json();

  const response = await fetch(
    `https://rest.gohighlevel.com/v1/contacts`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        tags: ['website-lead'],
      }),
    }
  );

  return Response.json({ success: true });
}
```

### 4. CopilotKit Setup (AI Features)

**Step 1: Install**
```bash
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/backend
npm install openai  # Peer dependency
```

**Step 2: Environment Variable**
```bash
# .env.local
OPENAI_API_KEY=your-openai-key
```

**Step 3: Provider Setup**
```typescript
// app/providers.tsx
'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar>
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}
```

**Step 4: Runtime API Route**
```typescript
// app/api/copilotkit/route.ts
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/backend';

const runtime = new CopilotRuntime();

export const POST = async (req: Request) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new OpenAIAdapter(),
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
```

**Step 5: Define Actions**
```typescript
// app/dashboard/page.tsx
'use client';

import { useCopilotAction } from '@copilotkit/react-core';

export default function Dashboard() {
  useCopilotAction({
    name: 'createProject',
    description: 'Create a new project',
    parameters: [
      {
        name: 'projectName',
        type: 'string',
        description: 'The name of the project',
        required: true,
      },
    ],
    handler: async ({ projectName }) => {
      // Create project logic
      const result = await createProject(projectName);
      return `Project "${projectName}" created successfully!`;
    },
  });

  return <div>Dashboard with AI Assistant</div>;
}
```

### 5. Netlify Deployment

**Step 1: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Step 2: Initialize**
```bash
netlify init
# Follow prompts to link to your Netlify account
```

**Step 3: Configuration**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Step 4: Environment Variables**
1. Go to Netlify dashboard
2. Site Settings → Environment Variables
3. Add all .env.local variables

**Step 5: Deploy**
```bash
# Manual deploy
netlify deploy --prod

# Auto deploy via Git
git push origin main  # Auto-deploys if connected
```

### 6. Tailwind CSS (Pre-installed)

**Custom Configuration**:
```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        secondary: '#7928ca',
      },
    },
  },
  plugins: [],
};

export default config;
```

## Integration Sequence

### Minimal Landing Page
1. Next.js + Tailwind ✓
2. GoHighLevel API
3. Deploy to Netlify

### Full SaaS Application
1. Next.js + Tailwind ✓
2. Supabase (Database + Auth)
3. CopilotKit (AI features)
4. Deploy to Netlify

## Quick Start Commands

```bash
# 1. Create project
npx create-next-app@latest my-genesis-project --typescript --tailwind --app
cd my-genesis-project

# 2. Install core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# 3. Install optional dependencies
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/backend openai
npm install react-hook-form @hookform/resolvers/zod zod

# 4. Create environment file
cp .env.example .env.local
# Add your keys

# 5. Run development server
npm run dev

# 6. Deploy to Netlify
netlify init
netlify deploy --prod
```

## Troubleshooting

### Supabase Connection Issues
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check project is not paused (free tier)
- Ensure RLS policies allow operation

### GoHighLevel API Errors
- Verify API key is active
- Check location ID is correct
- Ensure required fields match GHL custom fields

### CopilotKit Not Loading
- Verify OPENAI_API_KEY is set
- Check /api/copilotkit route is accessible
- Ensure CopilotKit provider wraps components

### Netlify Build Failures
- Check build command: `npm run build`
- Verify all environment variables are set in Netlify
- Review build logs for specific errors
- Ensure Next.js version compatibility

## Security Best Practices

1. **Never commit .env.local to git**
   ```bash
   # .gitignore should include:
   .env*.local
   ```

2. **Use environment variables for all secrets**
   - API keys
   - Database URLs
   - Auth secrets

3. **Enable RLS on all Supabase tables**
   ```sql
   alter table [table_name] enable row level security;
   ```

4. **Validate input on both client and server**
   - Use Zod for validation
   - Sanitize user input

5. **Use HTTPS everywhere**
   - Netlify provides SSL by default
   - Ensure API calls use https://
