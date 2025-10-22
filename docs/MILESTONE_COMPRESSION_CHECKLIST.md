# Genesis Milestone Compression & Thread Transition

## Purpose
Efficient context preservation and thread transition strategies for Genesis projects.

## When to Use Thread Transition

### Transition When:
- Approaching context window limit
- Major milestone completed
- Switching between development phases
- Need to share progress with team
- Starting new major feature
- After 50+ messages in thread

### Don't Transition When:
- In middle of debugging
- Partial implementation
- Unstable state
- Tests failing
- Deploy in progress

---

## Thread Transition Template

### Step 1: Create Context Summary

**Copy-paste this template into new thread**:

````markdown
# Genesis Project Context Handoff

## Project Overview
- **Project Name**: [Name]
- **Project Type**: [Landing Page / SaaS Application]
- **Current Phase**: [Phase name]
- **Started**: [Date]
- **Last Updated**: [Date]

## Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Additional**: [CopilotKit / GoHighLevel / Other integrations]

## Current State

### Repository
```
GitHub: [repo-url]
Branch: [branch-name]
Commit: [latest-commit-hash]
```

### Deployment
- **Production**: [URL or "Not deployed"]
- **Staging**: [URL or "N/A"]
- **Status**: [Deployed / In Progress / Not Started]

## Completed Milestones

- [x] **Milestone 1**: [Description]
  - Files: [Key files created/modified]
  - Checkpoint: [Commit hash or description]

- [x] **Milestone 2**: [Description]
  - Files: [Key files created/modified]
  - Checkpoint: [Commit hash or description]

- [x] **Milestone 3**: [Description]
  - Files: [Key files created/modified]
  - Checkpoint: [Commit hash or description]

## Current Work

### In Progress
- [ ] [Current task description]
  - Status: [What's done, what's left]
  - Blockers: [Any issues encountered]

### File Structure
```
project/
├── app/
│   ├── [completed routes]/
│   ├── [in-progress routes]/
│   └── api/
│       └── [completed API routes]/
├── components/
│   ├── [completed components]/
│   └── [in-progress components]/
├── lib/
│   └── [utilities created]
└── [other relevant directories]
```

### Database Schema (if applicable)
```sql
-- Tables created
- profiles
- [other tables]

-- RLS policies: [Enabled / In Progress]
```

### Key Code Patterns Established

**Pattern 1: [Pattern Name]**
```typescript
// Location: [file path]
// Pattern description
[Key code snippet]
```

**Pattern 2: [Pattern Name]**
```typescript
// Location: [file path]
// Pattern description
[Key code snippet]
```

## Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=[Set / Not Set]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Set / Not Set]
GHL_API_KEY=[Set / Not Set / N/A]
OPENAI_API_KEY=[Set / Not Set / N/A]
[Other variables]
```

## Known Issues / Technical Debt
1. [Issue 1 description]
2. [Issue 2 description]

## Next Steps
1. [ ] [Next immediate task]
2. [ ] [Following task]
3. [ ] [Future task]

## Testing Status
- [ ] Local development working
- [ ] Build passing (`npm run build`)
- [ ] Key features tested manually
- [ ] [Integration tests if applicable]
- [ ] [E2E tests if applicable]

## Additional Context
[Any other relevant information: decisions made, approaches tried, etc.]

---

**Ready to continue from here. Next action: [Specific next task]**
````

---

## Milestone Compression Strategies

### Strategy 1: Critical Path Only

**Keep**:
- Current file structure
- Active code patterns
- Immediate blockers
- Next 2-3 tasks

**Remove**:
- Discussion/exploration
- Failed attempts
- Completed debugging
- Historical context

### Strategy 2: Code-Centric Handoff

**Focus on**:
- Key files and their purposes
- Established patterns (with snippets)
- Configuration state
- Critical dependencies

**Example**:
```markdown
## Key Files

### `lib/supabase.ts`
- Supabase client setup
- Auth helpers defined
- Pattern: Server vs Client components

### `components/forms/LeadCaptureForm.tsx`
- React Hook Form + Zod validation
- GHL integration
- Pattern: Form → API → GHL

### `app/api/leads/route.ts`
- POST endpoint for lead capture
- GHL API integration
- Error handling established
```

### Strategy 3: Checkpoint-Based

**After each major milestone, create checkpoint**:

```bash
# Create checkpoint
git add .
git commit -m "Checkpoint: [Milestone name] - [Description]"
git tag checkpoint-[number]

# Document in thread
## Checkpoint [Number]: [Milestone Name]
- Commit: [hash]
- Date: [date]
- Status: [Completed / Tested / Deployed]
- Next: [Next milestone]
```

**For thread transition, reference checkpoints**:
```markdown
Resume from Checkpoint 3: "Dashboard CRUD Complete"
Commit: abc123
All tests passing, ready for deployment phase
```

---

## Auto-Compression Techniques

### Technique 1: Progressive File Lists

**Early thread** (detailed):
```markdown
### Files Created
- app/page.tsx (Hero section with lead form)
- components/forms/LeadCaptureForm.tsx (Form with validation)
- app/api/leads/route.ts (GHL integration endpoint)
- lib/supabase.ts (Database client)
- types/index.ts (TypeScript definitions)
```

**Later thread** (compressed):
```markdown
### Core Files
- Lead capture: app/page.tsx, components/forms/, app/api/leads/
- Infrastructure: lib/supabase.ts, types/
```

### Technique 2: Pattern References

**Instead of re-explaining patterns, reference them**:

```markdown
## Established Patterns
Following Genesis patterns:
- ✓ Supabase client pattern (lib/supabase.ts)
- ✓ Form validation pattern (Zod + React Hook Form)
- ✓ API route pattern (app/api/*/route.ts)
- ✓ GHL integration pattern (as per docs)

New patterns this phase:
- Dashboard layout with auth protection
- CRUD operations with RLS
```

### Technique 3: Decision Log

**Track key decisions for future reference**:

```markdown
## Technical Decisions
1. **Auth**: Supabase Auth (not custom) - simpler, faster
2. **Forms**: React Hook Form (not Formik) - better TypeScript support
3. **Styling**: Tailwind utility-first (not styled-components) - Genesis standard
4. **Deploy**: Netlify (not Vercel) - easier env var management for our use case
```

---

## Quick Transition Workflow

### For Simple Projects (Landing Pages)

```markdown
# Quick Context: [Project Name]

**Type**: Landing Page
**Stack**: Next.js 14, Tailwind, Supabase, GHL
**Status**: [Phase]

**Done**:
- ✓ [Milestone 1]
- ✓ [Milestone 2]

**Current**: [What you're working on]

**Next**: [Immediate next task]

**Files**: [5-10 key files]

**Blockers**: [Any issues or "None"]
```

### For Complex Projects (SaaS)

Use full template above, but focus on:
1. Database schema state
2. Auth implementation status
3. Feature completion checklist
4. Deployment readiness

---

## Thread Transition Best Practices

### 1. Always Commit Before Transition
```bash
git add .
git commit -m "Thread transition: [Current state]"
git push origin [branch]
```

### 2. Test Before Transition
```bash
# Ensure stable state
npm run build
npm run dev
# Manual test key features
```

### 3. Document Blockers Clearly
```markdown
## Blockers
1. **Supabase RLS**: Policy not working for projects table
   - Error: "new row violates row-level security policy"
   - Attempted: [What you tried]
   - Need: [What's needed to fix]
```

### 4. Provide Clear Next Step
```markdown
## Immediate Next Action
Continue implementing project CRUD:
1. Fix RLS policy on projects table (blocker above)
2. Test create/update/delete operations
3. Add loading states to UI
4. Move to deployment checklist

Start with: "Fix the RLS policy on projects table by [specific approach]"
```

### 5. Keep It Actionable
- Focus on what to DO next
- Minimize historical context
- Prioritize current state
- Clear success criteria

---

## Example Thread Transitions

### Example 1: Mid-Development

```markdown
# Genesis SaaS Project - Thread #2

## Quick Context
- **Project**: TaskFlow SaaS
- **Type**: Multi-tenant task manager
- **Phase**: Core Features Development (Week 2)

## Completed (Thread #1)
- ✓ Project setup & deployment
- ✓ Authentication flow
- ✓ Database schema (users, profiles, projects tables)
- ✓ Dashboard layout

## Current State
Working on Project CRUD operations:
- ✓ Create project (working)
- ✓ List projects (working)
- ⚠️ Update project (RLS policy issue - see blocker)
- ❌ Delete project (not started)

## Blocker
**RLS Policy on Projects Table**:
```sql
-- Current policy (not working for updates)
create policy "Users can CRUD own projects"
  on projects for all
  using (auth.uid() = user_id);
```
Error: Updates fail with "new row violates row-level security policy"

Attempted: Verified auth.uid() matches user_id, tried separate policies for select/update

## Key Files
- `app/dashboard/projects/page.tsx` - Projects list + CRUD UI
- `app/api/projects/route.ts` - Create/Read endpoints
- `app/api/projects/[id]/route.ts` - Update/Delete (in progress)
- `lib/api/projects.ts` - Client-side API helpers

## Next Steps
1. [ ] Fix RLS policy (try separate policies for each operation)
2. [ ] Complete update/delete endpoints
3. [ ] Test all CRUD operations
4. [ ] Add loading/error states
5. [ ] Move to next feature (Tasks)

**Resume with**: "Let's fix the RLS policy by creating separate policies for select, insert, update, and delete operations"
```

### Example 2: Pre-Deployment

```markdown
# Genesis Landing Page - Ready for Deployment

## Project: "FitnessPro Lead Gen"
**Type**: Landing Page with GHL integration
**Repo**: github.com/user/fitnesspro-landing
**Branch**: main (ready to deploy)

## Completed Features
- ✓ Hero section with value prop
- ✓ Benefits section (3 key benefits)
- ✓ Lead capture form (name, email, phone)
- ✓ Social proof (testimonials)
- ✓ Footer with contact info
- ✓ GHL integration working (tested)
- ✓ SEO meta tags configured
- ✓ Mobile responsive
- ✓ Build passing

## Environment Variables (Need to Set in Netlify)
```bash
GHL_API_KEY=ghl_prod_abc123xyz
GHL_LOCATION_ID=loc_xyz789abc
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Deployment Checklist
- [ ] Create Netlify site
- [ ] Connect GitHub repo
- [ ] Set environment variables
- [ ] Deploy production
- [ ] Test form submission in production
- [ ] Configure custom domain (if applicable)

## Next Action
"Let's deploy to Netlify. Walk me through: 1) Creating the site, 2) Setting environment variables, 3) Deploying"
```

---

## Tools for Context Management

### Git Tags for Checkpoints
```bash
# Tag important milestones
git tag -a v0.1-auth-complete -m "Authentication flow complete and tested"
git tag -a v0.2-crud-complete -m "Project CRUD operations complete"

# List tags
git tag -l

# Reference in thread transition
"Resume from v0.2-crud-complete tag"
```

### Branch Strategy
```bash
# Feature branches for major work
git checkout -b feature/project-crud
# Work, commit, push

# After completion
git checkout main
git merge feature/project-crud
git tag checkpoint-project-crud

# Thread transition references main branch state
```

### Commit Messages as Documentation
```bash
# Detailed commit messages serve as mini-documentation
git commit -m "Add project CRUD operations

- Implemented create/read/update/delete endpoints
- Added RLS policies for multi-tenant isolation
- Created UI components for project management
- Tests passing for all CRUD operations

Closes #12"
```

---

## Summary

**Golden Rule**: New thread should be able to:
1. Understand current project state in <2 minutes
2. Know exactly what to do next
3. Access all critical code patterns
4. Identify and resolve any blockers

**Compression Target**:
- Quick context: 50-100 lines
- Full context: 200-300 lines
- Code snippets: Only patterns, not full files

**Success Metric**:
Claude in new thread can continue development immediately without asking clarifying questions.
