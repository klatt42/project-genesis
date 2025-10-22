# Genesis Project Kickoff Checklist

## Project Type Decision Tree

### Step 1: Identify Project Type

**Landing Page** - Choose when:
- Primary goal: Lead generation
- Need: Lead capture forms
- Integration: GoHighLevel CRM
- Timeline: Quick launch (days)
- Complexity: Single page, focused conversion

**SaaS Application** - Choose when:
- Primary goal: User management & subscriptions
- Need: Multi-tenant architecture
- Integration: User authentication, payments
- Timeline: Iterative development (weeks)
- Complexity: Full application, multiple features

### Step 2: Stack Selection

**Core Stack (Both Types)**:
- Frontend: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Deployment: Netlify
- Database: Supabase (PostgreSQL)

**Landing Page Additions**:
- Forms: React Hook Form + Zod validation
- CRM: GoHighLevel API integration
- Analytics: Conversion tracking
- SEO: next-seo package

**SaaS Application Additions**:
- Auth: Supabase Auth
- AI: CopilotKit for AI features
- State: React Context/Zustand
- Payments: Stripe (optional)

### Step 3: Initial Setup Commands

```bash
# 1. Create project
npx create-next-app@latest [project-name] --typescript --tailwind --app

# 2. Install dependencies
npm install @supabase/supabase-js

# 3. Initialize git
git init
git add .
git commit -m "Initial Genesis project setup"

# 4. Create Supabase project
# (via supabase.com dashboard)

# 5. Configure environment
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Step 4: Project Structure

```
project/
├── app/
│   ├── layout.tsx
│   ├── page.tsx           # Landing or Dashboard
│   └── api/               # API routes
├── components/
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utilities
└── public/               # Static assets
```

### Step 5: First Milestone Checkpoints

**Landing Page**:
- [ ] Hero section with value proposition
- [ ] Lead capture form (name, email, phone)
- [ ] GoHighLevel integration working
- [ ] Deployed to Netlify
- [ ] SEO meta tags configured

**SaaS Application**:
- [ ] Authentication flow complete
- [ ] User dashboard created
- [ ] Database schema designed
- [ ] First core feature implemented
- [ ] Deployed to Netlify

## Quick Reference

### When to Use What

| Need | Tool | Genesis Pattern |
|------|------|----------------|
| Lead capture | GHL Forms | Landing Page Template |
| User login | Supabase Auth | SaaS Architecture |
| AI features | CopilotKit | AI Integration Pattern |
| Multi-service | Archon | Orchestration Pattern |
| Database | Supabase | Schema-First Design |

### Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Deploy (Netlify)
netlify deploy --prod

# Database migrations (Supabase)
supabase db push
```

## Next Steps

After project type selection:
1. Reference appropriate template (LANDING_PAGE_TEMPLATE.md or SAAS_ARCHITECTURE.md)
2. Follow STACK_SETUP.md for integrations
3. Use CLAUDE_CODE_INSTRUCTIONS.md for development workflow
4. Check DEPLOYMENT_GUIDE.md before going live
