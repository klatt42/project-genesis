# Genesis Quick Start Guide

**Project**: [PROJECT_NAME]
**Type**: [SaaS Application / Landing Page]
**Genesis Version**: v1.0.0
**Last Updated**: [DATE]

---

## =¨ IMPORTANT: Context Loss Recovery

If Claude Code loses context (restart, new thread, connection loss), use this recovery workflow:

### Step 1: Reload Genesis Foundation
```bash
# In Claude Code, invoke genesis-core to reload project type awareness
Skill({ command: 'genesis-core' })
```

### Step 2: Reload Project-Specific Patterns
**For SaaS Projects:**
```bash
Skill({ command: 'genesis-saas-app' })
Skill({ command: 'genesis-supabase' })
```

**For Landing Page Projects:**
```bash
Skill({ command: 'genesis-landing-page' })
Skill({ command: 'genesis-supabase' })
```

### Step 3: Reload Current Project State
```bash
# Review project status document (see below)
# Review latest git commits for recent changes
git log --oneline -10
```

---

## Project Quick Reference

### Project Type: [SaaS Application / Landing Page]

**Genesis Skills Used:**
-  genesis-core (project type decision)
-  genesis-[saas-app/landing-page] (core patterns)
-  genesis-supabase (database patterns)
-  genesis-stack-setup (environment config)
- ó genesis-copilotkit (AI features - if applicable)
- ó genesis-testing (test patterns - Phase 2+)
- ó genesis-deployment (deployment - final phase)

### Current Phase: [Phase Number and Description]

**Completed:**
- [x] Genesis template setup
- [x] Supabase configuration
- [x] Database schema and RLS policies
- [x] [Other completed items]

**In Progress:**
- [ ] [Current feature/task]

**Next Up:**
- [ ] [Next feature/task]

### Key Files Modified
- `[file path]` - [description]
- `[file path]` - [description]

### Environment Status
-  Supabase: [Project URL]
-  GitHub: [Repo URL]
- ó Netlify: [Not yet deployed / Site URL]
- ó GHL: [Integration status]

---

## Genesis Pattern References

This project follows patterns from:
1. **Primary**: [SAAS_ARCHITECTURE.md / LANDING_PAGE_TEMPLATE.md]
2. **Database**: STACK_SETUP.md (Supabase section)
3. **Deployment**: DEPLOYMENT_GUIDE.md
4. **Skills**: GENESIS_SKILLS_GUIDE.md

**Genesis Repository**: https://github.com/cole-m/project-genesis

---

## Common Tasks

### Start Development
```bash
# WSL Terminal
cd ~/projects/[project-name]
npm run dev
```

### Create Database Migration
```bash
# Following genesis-supabase patterns
supabase migration new [migration_name]
# Edit: supabase/migrations/[timestamp]_[migration_name].sql
supabase db push
```

### Deploy to Netlify
```bash
# Following genesis-deployment patterns
netlify deploy --prod
```

### On Error: Invoke Troubleshooting Skill
```bash
# Claude Code - FIRST action on ANY error
Skill({ command: 'genesis-troubleshooting' })
```

---

## = Recurring Context Reminder

**When starting ANY new thread or after Claude Code restart:**

1. **Say this to Claude Code**:
   > 'Reload Genesis context for [PROJECT_NAME]. Review GENESIS_QUICK_START.md and PROJECT_STATUS.md.'

2. **Claude Code will then**:
   - Invoke genesis-core
   - Invoke project-type skill (genesis-saas-app OR genesis-landing-page)
   - Review project status
   - Resume development using Genesis patterns

3. **For errors**:
   > 'Getting [error description]. Use genesis-troubleshooting skill.'

---

## Emergency Recovery

If project is broken or context is completely lost:

```bash
# Step 1: Check git history
git log --oneline -20

# Step 2: Review recent changes
git diff HEAD~5

# Step 3: Reload all Genesis skills in sequence
Skill({ command: 'genesis-core' })
Skill({ command: 'genesis-[project-type]' })
Skill({ command: 'genesis-supabase' })
Skill({ command: 'genesis-troubleshooting' })

# Step 4: Review this file and PROJECT_STATUS.md
```

---

## Genesis Skills Quick Reference

**Skills to invoke during development:**

- **Starting new feature**: Invoke genesis-[project-type] for patterns
- **Database changes**: Invoke genesis-supabase for schema/RLS patterns
- **ANY error**: Invoke genesis-troubleshooting IMMEDIATELY
- **Adding AI**: Invoke genesis-copilotkit for AI patterns
- **Adding tests**: Invoke genesis-testing for test patterns
- **Deploying**: Invoke genesis-deployment for deployment checklist

**Full skill documentation**: See Genesis repository at docs/GENESIS_SKILLS_GUIDE.md

---

## Notes

[Add project-specific notes here as development progresses]

---

**Last Context Update**: [DATE]
**Last Modified By**: [USER/AGENT]
**Current Git Branch**: [branch_name]
**Current Commit**: [commit_hash]
