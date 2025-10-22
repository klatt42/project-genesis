---
name: genesis-commands
description: Command templates and development workflow sequences for Genesis projects
---

# Genesis Commands

## When to Use This Skill

Load this skill when user mentions:
- "commands" OR "command sequence" OR "what commands"
- "how to run" OR "how to start"
- "setup commands" OR "init commands"
- "checkpoint" OR "git commit"
- "workflow" OR "development workflow"

## Key Patterns

### Pattern 1: Project Initialization Sequence

```bash
# Complete project setup (copy-paste ready)
npx create-next-app@latest my-project --typescript --tailwind --app
cd my-project

# Landing Page
npm install @supabase/supabase-js react-hook-form @hookform/resolvers/zod zod

# OR SaaS App
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Initialize git
git init && git add . && git commit -m "Initial Genesis setup"

# Create env file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GHL_API_KEY=
OPENAI_API_KEY=
EOF

# Start dev server
npm run dev
```

### Pattern 2: Checkpoint Workflow

```bash
# After completing milestone
git add .
git commit -m "Checkpoint: [milestone name]"

# Examples:
git commit -m "Checkpoint: Auth flow complete"
git commit -m "Checkpoint: Lead form with GHL integration"
git commit -m "Checkpoint: Dashboard CRUD operations"
```

**Checkpoint after**:
- Auth flow complete
- Form + API integration working
- CRUD operations tested
- Each major feature complete
- Before deployment

### Pattern 3: Directory Creation Sequences

```bash
# Landing Page structure
mkdir -p components/{forms,sections,ui} app/api/leads lib public

# SaaS App structure
mkdir -p app/{dashboard,\(auth\)/{login,signup},api/{auth,copilotkit}} lib/{api,contexts} components/{forms,ui} types

# API routes
mkdir -p app/api/{leads,projects,users}

# Component organization
mkdir -p components/{layout,forms,ui,features}
```

### Pattern 4: Development Phase Commands

**Phase 1 - Setup**:
```bash
npm run dev                    # Start dev server
npm run build                  # Test build
npx tsc --noEmit              # Check TypeScript
npm run lint                   # Check linting
```

**Phase 2 - Testing**:
```bash
# Test form submission
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"1234567890"}'

# Test build before deploy
npm run build && npm start
```

**Phase 3 - Deployment**:
```bash
netlify init                   # First time setup
netlify deploy                 # Preview deploy
netlify deploy --prod          # Production deploy
netlify logs                   # View logs
```

## Quick Reference

| Phase | Command | Purpose |
|-------|---------|---------|
| Init | `npx create-next-app` | Create project |
| Setup | `npm install [packages]` | Add dependencies |
| Dev | `npm run dev` | Local development |
| Check | `npm run build` | Test build |
| Checkpoint | `git add . && git commit` | Save milestone |
| Deploy | `netlify deploy --prod` | Production |

### Common Command Combinations

**Quick start any Genesis project**:
```bash
npx create-next-app@latest my-project --typescript --tailwind --app && \
cd my-project && \
npm install @supabase/supabase-js && \
git init && git add . && git commit -m "Initial setup"
```

**Pre-deployment checklist**:
```bash
npm run build && \
npx tsc --noEmit && \
npm run lint && \
echo "✅ Ready to deploy"
```

**Checkpoint + Push**:
```bash
git add . && \
git commit -m "Checkpoint: [milestone]" && \
git push origin main
```

## Command Templates

### Template 1: New Resource Scaffold

```bash
# Create new resource (e.g., "projects")
RESOURCE="projects"

# Create directories
mkdir -p app/api/$RESOURCE lib/api components/$RESOURCE

# Run SQL for table (in Supabase dashboard)
# Create API route: app/api/$RESOURCE/route.ts
# Create API helper: lib/api/$RESOURCE.ts
# Create components: components/$RESOURCE/
```

### Template 2: Environment Setup

```bash
# Copy from example
cp .env.example .env.local

# Or create fresh
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GHL_API_KEY=
GHL_LOCATION_ID=
OPENAI_API_KEY=
EOF

# Never commit
echo ".env*.local" >> .gitignore
```

### Template 3: Debug & Troubleshoot

```bash
# Check what's running
lsof -i :3000                  # Check port 3000

# Kill process if needed
kill -9 $(lsof -t -i:3000)

# Clear Next.js cache
rm -rf .next

# Fresh install
rm -rf node_modules package-lock.json && npm install

# Check env vars loaded
cat .env.local | grep -v "^#"
```

## Integration with Other Skills

- Use **genesis-core** to determine which command sequences to run
- Use **genesis-stack-setup** for integration-specific commands
- Use **genesis-deployment** for deployment commands
- Use **genesis-thread-transition** for checkpoint best practices

## Best Practices

1. **Test incrementally**: Run `npm run dev` after each change
2. **Checkpoint often**: Git commit after each working feature
3. **Build before deploy**: Always run `npm run build` locally first
4. **Environment first**: Set up .env.local before integrations
5. **Never commit secrets**: Keep .env.local in .gitignore

## Deep Dive

For complete workflow details, reference:
- docs/CLAUDE_CODE_INSTRUCTIONS.md (full development workflow and templates)
