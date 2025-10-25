---
name: genesis-core
description: Master decision tree for Genesis project type selection and initialization
---

# Genesis Core

## When to Use This Skill

Load this skill when user mentions:
- "new project" OR "start project" OR "create project"
- "genesis project" OR "genesis template" OR "use genesis"
- "which template" OR "which boilerplate"
- "landing page or saas" OR "should I use landing page"
- "best practices" OR "genesis patterns"

## Key Patterns

### Pattern 1: Project Type Decision

**Landing Page** → Choose when:
- Goal: Lead generation / conversion
- Timeline: Days to 1 week
- User flow: Single-page or simple multi-page
- Need: Forms + CRM integration (GHL)
- Examples: Service landing page, product launch, event registration

**SaaS Application** → Choose when:
- Goal: User management / ongoing usage
- Timeline: Weeks (iterative development)
- User flow: Protected dashboard + features
- Need: Authentication + multi-tenant + subscriptions
- Examples: Project management tool, analytics platform, collaboration app

**Hybrid (Landing + SaaS)** → Start with Landing Page:
- Build landing page first for lead capture
- Add SaaS features after user acquisition
- Use genesis-landing-page → then genesis-saas-app

### Pattern 2: Core Stack (Always)

```bash
# Standard Genesis setup
npx create-next-app@latest [name] --typescript --tailwind --app
npm install @supabase/supabase-js
```

Stack: Next.js 14 + Tailwind + Supabase + Netlify

### Pattern 3: Type-Specific Additions

**Landing Page**:
```bash
npm install react-hook-form @hookform/resolvers/zod zod
```
Then: **genesis-landing-page** skill

**SaaS App**:
```bash
npm install @supabase/auth-helpers-nextjs
```
Then: **genesis-saas-app** skill

## Quick Reference

| Project Type | Timeline | Key Need | Next Skill |
|--------------|----------|----------|------------|
| Landing Page | Days | Lead capture | genesis-landing-page |
| SaaS App | Weeks | User auth | genesis-saas-app |

### First Milestones

**Landing Page**:
- [ ] Hero + lead form
- [ ] GHL integration
- [ ] Deploy to Netlify

**SaaS App**:
- [ ] Auth flow complete
- [ ] Dashboard created
- [ ] Database schema

## Pattern 4: Restart Workflow Setup (v1.2.0)

Every Genesis project includes automatic PC reboot recovery from day one:

### Step 1: Generate restart-project.sh
```bash
# After project creation, generate restart script
~/projects/project-genesis/templates/generate-restart-script.sh [PROJECT_NAME] "[PROJECT_TYPE]"
# PROJECT_TYPE: "SaaS Application" or "Landing Page"
```

### Step 2: Copy Context Recovery Templates
```bash
# Copy all v1.1.0+ templates to project
~/projects/project-genesis/update-existing-project.sh ~/projects/[PROJECT_NAME]
```

This copies:
- `GENESIS_QUICK_START.md` - Project overview & recovery workflow
- `PROJECT_STATUS.md` - Current state tracking
- `PROJECT_RESTART.md` - PC reboot terminal guide
- `.github/CLAUDE_CODE_REMINDER.md` - Automatic context reminder
- `README.md` template - Context recovery section

### Step 3: Customize Templates
Fill in project-specific details:
- **PROJECT_STATUS.md**: Initial project state, current phase, database status
- **GENESIS_QUICK_START.md**: Project details, environment variables, quick tasks
- **README.md**: Add context recovery section to existing README

### Step 4: Verify Restart Workflow
```bash
cd ~/projects/[PROJECT_NAME] && ./restart-project.sh
```

Should display:
- Project info and type
- Git status and current branch
- Tab 1 (WSL) instructions
- Tab 2 (Claude Code) context recovery prompt

**Result**: Project ready for PC reboot recovery. 2-minute recovery after any restart.

## Command Templates

```bash
# Quick start any Genesis project (with restart workflow)
npx create-next-app@latest my-project --typescript --tailwind --app
cd my-project
npm install @supabase/supabase-js
git init && git add . && git commit -m "Initial Genesis setup"

# Add restart workflow (v1.2.0+)
~/projects/project-genesis/templates/generate-restart-script.sh my-project "SaaS Application"
~/projects/project-genesis/update-existing-project.sh ~/projects/my-project
# Customize PROJECT_STATUS.md and GENESIS_QUICK_START.md
```

## Integration with Other Skills

After project type is selected:
- Use **genesis-stack-setup** for detailed integration setup
- Use **genesis-landing-page** for landing page patterns
- Use **genesis-saas-app** for SaaS architecture
- Use **genesis-commands** for complete command workflows

## Deep Dive

For complete project kickoff guide, reference:
- docs/PROJECT_KICKOFF_CHECKLIST.md (full decision trees and setup steps)
