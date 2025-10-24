# > Claude Code Context Reminder

**This file is automatically surfaced when Claude Code loses context or starts a new session.**

---

## =¨ IMMEDIATE ACTIONS ON CONTEXT LOSS

### Step 1: Reload Genesis Foundation (ALWAYS DO THIS FIRST)
```typescript
// Invoke genesis-core to reload project type awareness
Skill({ command: 'genesis-core' })
```

### Step 2: Reload Project-Type Patterns
**Check GENESIS_QUICK_START.md for project type, then invoke appropriate skill:**

**For SaaS Projects:**
```typescript
Skill({ command: 'genesis-saas-app' })
Skill({ command: 'genesis-supabase' })
```

**For Landing Page Projects:**
```typescript
Skill({ command: 'genesis-landing-page' })
Skill({ command: 'genesis-supabase' })
```

### Step 3: Review Project Status
```bash
# Read these files IN ORDER:
# 1. GENESIS_QUICK_START.md (project overview)
# 2. PROJECT_STATUS.md (current state)
# 3. Git log (recent changes)
git log --oneline -10
```

---

## =Ú Critical Files to Read on Context Loss

**Read these files BEFORE resuming work:**

1. **GENESIS_QUICK_START.md**
   - Project type and overview
   - Genesis skills to use
   - Environment status
   - Common tasks reference

2. **PROJECT_STATUS.md**
   - Current position (exact file and line)
   - Phase progress
   - Recent changes
   - Next actions

3. **Latest Git Commits**
   - `git log --oneline -10`
   - `git diff HEAD~3` (if needed)

---

## <¯ Genesis Pattern: Skills-First Development

**CRITICAL RULE**: Always invoke Genesis Skills BEFORE writing custom code.

### Common Scenarios ’ Skill to Invoke

| Scenario | Skill Command |
|----------|---------------|
| Starting new feature | `Skill({ command: 'genesis-[project-type]' })` |
| Database schema change | `Skill({ command: 'genesis-supabase' })` |
| ANY error occurs | `Skill({ command: 'genesis-troubleshooting' })` |
| Adding AI features | `Skill({ command: 'genesis-copilotkit' })` |
| Setting up tests | `Skill({ command: 'genesis-testing' })` |
| Deploying | `Skill({ command: 'genesis-deployment' })` |

### Multi-Skill Workflow for New Feature
```typescript
// 1. Get project-type patterns
Skill({ command: 'genesis-[saas-app/landing-page]' })

// 2. Get database patterns (if feature needs DB)
Skill({ command: 'genesis-supabase' })

// 3. Implement feature using patterns from both skills
```

---

## = Recovery Workflow

```bash
# Terminal: Navigate to project
cd ~/projects/[project-name]

# Terminal: Check current branch and status
git branch --show-current
git status

# Claude Code: Reload Genesis foundation
Skill({ command: 'genesis-core' })

# Claude Code: Reload project-type skill
Skill({ command: 'genesis-[saas-app/landing-page]' })

# Claude Code: Read project status
# 'Review GENESIS_QUICK_START.md and PROJECT_STATUS.md'

# Claude Code: Resume from 'Current Position' in PROJECT_STATUS.md
```

---

##   Common Mistakes After Context Loss

### L MISTAKE: Starting to code immediately without reloading Genesis
**CORRECT**: Always invoke genesis-core first, then project-type skill

### L MISTAKE: Asking 'What should I do?' without reading PROJECT_STATUS.md
**CORRECT**: Read PROJECT_STATUS.md ’ See 'Current Position' and 'Next Actions'

### L MISTAKE: Trying to debug errors manually instead of using troubleshooting skill
**CORRECT**: On ANY error, invoke `Skill({ command: 'genesis-troubleshooting' })`

### L MISTAKE: Re-implementing patterns that exist in Genesis Skills
**CORRECT**: Invoke skill first, use existing patterns

---

## =Ë Context Recovery Checklist

Use this checklist EVERY TIME context is lost:

- [ ] Invoke `Skill({ command: 'genesis-core' })`
- [ ] Invoke `Skill({ command: 'genesis-[project-type]' })`
- [ ] Read `GENESIS_QUICK_START.md`
- [ ] Read `PROJECT_STATUS.md`
- [ ] Check git log: `git log --oneline -10`
- [ ] Review 'Current Position' in PROJECT_STATUS.md
- [ ] Resume from 'Next Actions' in PROJECT_STATUS.md

---

## <“ Genesis = Single Source of Truth

- **Genesis Skills** = Battle-tested patterns for all common scenarios
- **GENESIS_QUICK_START.md** = This project's Genesis configuration
- **PROJECT_STATUS.md** = Current state and next steps
- **Genesis Repository** = https://github.com/cole-m/project-genesis

**When in doubt**: Invoke genesis-troubleshooting or genesis-[project-type] skill.

---

**Remember**: Genesis Skills save time and provide proven patterns. Use them liberally!
