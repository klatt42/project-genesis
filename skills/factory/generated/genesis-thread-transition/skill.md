---
name: genesis-thread-transition
description: Context preservation and thread handoff patterns for seamless continuation
---

# Genesis Thread Transition

## When to Use This Skill

Load this skill when user mentions:
- "transition" OR "new thread" OR "continue in new thread"
- "handoff" OR "hand off" OR "context handoff"
- "context preservation" OR "save context"
- "thread limit" OR "context window"
- "summarize progress" OR "where we are"

## Key Patterns

### Pattern 1: When to Transition

**Transition when**:
- Approaching context window limit (50+ messages)
- Major milestone completed
- Switching development phases
- Need to share progress with team
- After day's work (daily checkpoint)

**Don't transition when**:
- In middle of debugging
- Partial implementation
- Tests failing
- Unstable state

**Rule**: Only transition from stable, working state

### Pattern 2: Quick Context Template

```markdown
# Genesis Project Context Handoff

## Project Overview
- **Project**: [Name]
- **Type**: [Landing Page / SaaS App]
- **Phase**: [Development / Testing / Deployment]
- **Stack**: Next.js 14, Tailwind, Supabase, [other]

## Completed Milestones
- [x] Initial setup
- [x] [Milestone 2]
- [x] [Milestone 3]

## Current State
Working on: [Current task]
Status: [What's done, what's left]
Blockers: [Any issues or "None"]

## Key Files
```
app/
├── page.tsx
├── dashboard/
├── api/
components/
lib/
```

## Next Steps
1. [Immediate next task]
2. [Following task]

## Environment
- Dev server running: Yes/No
- Database: [Configured / In Progress]
- Deployment: [Not started / Deployed]

**Resume with**: "[Specific instruction to start]"
```

### Pattern 3: Checkpoint Before Transition

```bash
# Create stable checkpoint
git add .
git commit -m "Checkpoint: [Current state]"

# Examples:
git commit -m "Checkpoint: Auth flow complete and tested"
git commit -m "Checkpoint: Landing page deployed to Netlify"
git commit -m "Checkpoint: CRUD operations working"

# Note commit hash for reference
git log -1 --oneline
```

### Pattern 4: File Structure Summary

**Instead of listing every file**, group by purpose:

```markdown
## Core Files
- Auth: app/login, app/signup, lib/supabase.ts
- Dashboard: app/dashboard/*, components/dashboard/*
- API: app/api/projects, app/api/users
- Database: Supabase (profiles, projects tables with RLS)
```

**Not this** (too verbose):
```markdown
- app/login/page.tsx
- app/signup/page.tsx
- lib/supabase.ts
- components/auth/LoginForm.tsx
[...50 more files]
```

### Pattern 5: Code Patterns Reference

**Include snippets of established patterns**:

```markdown
## Established Patterns

**Pattern 1: API Routes**
Location: app/api/*/route.ts
Standard: Auth check → Supabase query → Response
See: app/api/projects/route.ts

**Pattern 2: Forms**
Location: components/forms/
Standard: React Hook Form + Zod validation
See: components/forms/LeadCaptureForm.tsx

**Pattern 3: Database**
Standard: RLS enabled, auth.uid() = user_id policy
See: Supabase SQL (profiles, projects tables)
```

## Quick Reference

| Situation | Template | Focus |
|-----------|----------|-------|
| Mid-development | Quick Context | Current work, next steps |
| Major milestone | Full Context | All completed, blockers |
| Daily end | Checkpoint | Commit hash, tomorrow's start |
| Team handoff | Full Context | Everything, clear next steps |

### Compression Techniques

**1. Group files by purpose** (not alphabetical list)
**2. Reference commits** (not re-explain completed work)
**3. Focus on "what's next"** (not "what we did")
**4. Include blockers** (so next session can solve)

## Command Templates

```bash
# Before transition
git add .
git commit -m "Checkpoint: [state]"
git log -1 --oneline  # Note this hash

# Create summary
# Copy Quick Context Template above
# Fill in project details
# Paste in new thread

# New thread starts immediately
# No warm-up needed
```

## Integration with Other Skills

- Use **genesis-commands** for checkpoint commands
- Use **genesis-core** to restate project type in handoff
- Use **genesis-deployment** for deployment status
- Reference other skills in "Next Steps"

## Examples

### Example 1: Mid-Development Transition

```markdown
# Genesis SaaS Project - Thread #2

## Project: TaskFlow SaaS
**Type**: Multi-tenant task manager
**Phase**: Core Features (Week 2)

## Completed
- ✓ Auth flow (Supabase)
- ✓ Dashboard layout
- ✓ Projects CRUD (create, list working)

## Current
Working on: Update/Delete for projects
Status: Update endpoint created, needs testing
Blocker: RLS policy issue (updates fail)

## Key Files
- CRUD: app/api/projects/[id]/route.ts, lib/api/projects.ts
- UI: app/dashboard/projects/page.tsx

## Next
1. Fix RLS policy (try separate update policy)
2. Test update/delete
3. Add loading states

**Resume with**: "Fix the RLS update policy in Supabase"
```

### Example 2: Pre-Deployment Transition

```markdown
# Genesis Landing Page - Ready for Deploy

## Project: FitnessPro Lead Gen
**Type**: Landing Page
**Status**: Development complete, ready for Netlify

## Completed
- ✓ Hero + lead form
- ✓ GHL integration tested
- ✓ SEO configured
- ✓ Build passing

## Environment Variables (for Netlify)
```
GHL_API_KEY=ghl_prod_abc123
GHL_LOCATION_ID=loc_xyz789
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Next
1. Create Netlify site
2. Set env vars in dashboard
3. Deploy production
4. Test form in production

**Resume with**: "Deploy to Netlify using genesis-deployment patterns"
```

## Best Practices

1. **Always checkpoint**: Git commit before transition
2. **Test first**: Only transition from working state
3. **Be specific**: "Next Steps" should be actionable
4. **Include blockers**: Document issues clearly
5. **Reference commits**: Use git hashes for history

## Troubleshooting

**New thread doesn't understand context**:
- Provide project type explicitly
- Include stack (Next.js 14, Supabase, etc.)
- Reference established patterns
- Be specific about next action

**Too much context to include**:
- Use compression techniques above
- Group files by purpose
- Reference git commits
- Focus on current/next work only

**Context got lost**:
- Restate project type
- Quick file structure
- Current milestone
- Immediate next step

## Deep Dive

For complete thread transition patterns, reference:
- docs/MILESTONE_COMPRESSION_CHECKLIST.md (Full transition templates, compression techniques)
