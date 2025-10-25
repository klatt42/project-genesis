# Genesis Auto-Restart Workflow Proposal

**Date**: October 25, 2025
**Version**: Genesis v1.2.0 (proposed)
**Status**: Ready to implement

---

## Executive Summary

**Proposal**: Integrate Genesis v1.1.0 restart workflow into all new Genesis projects automatically.

**Impact**: Every new Genesis project will have PC reboot recovery built-in from day one.

**Implementation**: Update genesis-core and project-type skills to include restart workflow during project initialization.

---

## Current State

**Genesis v1.1.0** introduced restart workflow templates:
- `restart-project.sh` - PC reboot recovery script
- `PROJECT_STATUS.md` - Current state tracking
- `GENESIS_QUICK_START.md` - Project overview
- `.github/CLAUDE_CODE_REMINDER.md` - Auto context recovery

**Current limitation**: Must be manually applied to projects via RESTART_ARTIFACT.md

---

## Proposed Enhancement

### Option 1: Update genesis-core Skill
Add restart workflow setup to initial project scaffolding.

**Changes needed:**
1. Update `.genesis/skills/genesis-core.md` to include restart workflow setup
2. Auto-generate `restart-project.sh` during project creation
3. Include template files (PROJECT_STATUS.md, GENESIS_QUICK_START.md)
4. Add restart workflow to project initialization checklist

### Option 3: Update Project-Type Skills
Customize restart workflow for each project type.

**Changes needed:**
1. Update `.genesis/skills/genesis-saas-app.md` - SaaS-specific restart workflow
2. Update `.genesis/skills/genesis-landing-page.md` - Landing page restart workflow
3. Include project-type specific status tracking
4. Customize GENESIS_QUICK_START.md for project type

---

## Implementation Steps

Execute these steps in the project-genesis terminal:

### Step 1: Update genesis-core Skill

**File**: `.genesis/skills/genesis-core.md`

Add new section after "Project Structure Setup":

```markdown
## Restart Workflow Setup

Every Genesis project includes automatic PC reboot recovery:

### 1. Generate restart-project.sh
```bash
~/projects/project-genesis/templates/generate-restart-script.sh [PROJECT_NAME] "[PROJECT_TYPE]"
```

### 2. Copy Context Recovery Templates
```bash
~/projects/project-genesis/update-existing-project.sh ~/projects/[PROJECT_NAME]
```

### 3. Customize Templates
- Fill PROJECT_STATUS.md with initial project state
- Update GENESIS_QUICK_START.md with project details
- Add context recovery section to README.md

### 4. Verify Restart Workflow
```bash
cd ~/projects/[PROJECT_NAME] && ./restart-project.sh
```
Should display project info, git status, and context recovery instructions.

**Result**: Project ready for PC reboot recovery from day one.
```

### Step 2: Update genesis-saas-app Skill

**File**: `.genesis/skills/genesis-saas-app.md`

Add new section after "Database Setup":

```markdown
## SaaS Project Restart Workflow

SaaS applications include enhanced restart workflow with:
- Multi-tenant context tracking
- Database migration status
- API endpoint documentation
- Authentication state preservation

### Customize PROJECT_STATUS.md for SaaS
Include sections:
- Current Phase (Foundation, Core Features, Advanced, Launch)
- Database Status (tables, RLS policies, migrations)
- API Routes Status
- Authentication Status
- Integration Status (Supabase, payments, etc.)

### Customize GENESIS_QUICK_START.md for SaaS
Include:
- Supabase project URL
- Database migration commands
- API testing commands
- Common SaaS development tasks
```

### Step 3: Update genesis-landing-page Skill

**File**: `.genesis/skills/genesis-landing-page.md`

Add new section after "Lead Capture Setup":

```markdown
## Landing Page Restart Workflow

Landing pages include focused restart workflow with:
- Conversion funnel status
- Lead capture integration status
- Analytics tracking status
- A/B testing variants

### Customize PROJECT_STATUS.md for Landing Page
Include sections:
- Current Phase (Design, Development, Integration, Launch)
- Components Status (hero, features, testimonials, CTA, form)
- Integration Status (GoHighLevel, analytics, email)
- Performance Metrics (page speed, conversion rate targets)

### Customize GENESIS_QUICK_START.md for Landing Page
Include:
- GoHighLevel webhook URL
- Analytics tracking IDs
- Deployment commands
- A/B testing setup
```

### Step 4: Update Project Templates

**File**: `templates/README.md`

Update to include restart workflow by default:

Add after project description:
```markdown
## 🤖 For Claude Code: Context Recovery

**If context was lost (restart, PC reboot, new thread), read these files IN ORDER:**

1. **[.github/CLAUDE_CODE_REMINDER.md](./.github/CLAUDE_CODE_REMINDER.md)** ← START HERE
2. **[GENESIS_QUICK_START.md](./GENESIS_QUICK_START.md)** - Project overview & recovery workflow
3. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current state, position, and next actions

**Then invoke Genesis skills to reload context:**
```typescript
Skill({ command: 'genesis-core' })
Skill({ command: 'genesis-[saas-app/landing-page]' })
```

**PC Reboot Recovery:**
```bash
cd ~/projects/[project-path] && ./restart-project.sh
```
```

### Step 5: Update Documentation

**Files to update:**
1. `docs/CLAUDE_CODE_INSTRUCTIONS.md` - Add restart workflow to project initialization
2. `docs/PROJECT_KICKOFF_CHECKLIST.md` - Add restart workflow verification
3. `CHANGELOG.md` - Add v1.2.0 entry

---

## Testing Plan

### Test 1: New SaaS Project
1. Create new project with genesis-core + genesis-saas-app
2. Verify restart-project.sh exists and is executable
3. Verify PROJECT_STATUS.md has SaaS-specific sections
4. Run `./restart-project.sh` and verify output
5. Test PC reboot recovery workflow

### Test 2: New Landing Page Project
1. Create new project with genesis-core + genesis-landing-page
2. Verify restart workflow files exist
3. Verify PROJECT_STATUS.md has landing page sections
4. Run `./restart-project.sh` and verify output
5. Test PC reboot recovery workflow

### Test 3: Backward Compatibility
1. Existing projects without restart workflow should still work
2. RESTART_ARTIFACT.md should still work for manual application
3. No breaking changes to existing Genesis projects

---

## Success Criteria

- [ ] genesis-core skill includes restart workflow setup
- [ ] genesis-saas-app skill includes SaaS-specific customization
- [ ] genesis-landing-page skill includes landing page customization
- [ ] New projects auto-generate restart-project.sh
- [ ] PROJECT_STATUS.md customized for project type
- [ ] GENESIS_QUICK_START.md customized for project type
- [ ] README.md includes context recovery section
- [ ] restart-project.sh works correctly for new projects
- [ ] Documentation updated (CLAUDE_CODE_INSTRUCTIONS.md, etc.)
- [ ] CHANGELOG.md updated to v1.2.0
- [ ] Backward compatible with existing projects

---

## Implementation Commands

### Execute in project-genesis Terminal

```bash
# Navigate to project-genesis
cd ~/projects/project-genesis

# Update skills (you'll edit these files)
# .genesis/skills/genesis-core.md
# .genesis/skills/genesis-saas-app.md
# .genesis/skills/genesis-landing-page.md

# Update templates
# templates/README.md

# Update documentation
# docs/CLAUDE_CODE_INSTRUCTIONS.md
# docs/PROJECT_KICKOFF_CHECKLIST.md

# Update CHANGELOG
# CHANGELOG.md (add v1.2.0 entry)

# Test with new project
# mkdir ~/projects/test-genesis-v12
# Apply genesis-core + genesis-saas-app
# Verify restart workflow exists

# Commit changes
git add .genesis/skills/ templates/ docs/ CHANGELOG.md
git commit -m "feat: Genesis v1.2.0 - Auto-include restart workflow in new projects

FEATURES:
- genesis-core auto-generates restart workflow during initialization
- genesis-saas-app customizes restart workflow for SaaS projects
- genesis-landing-page customizes restart workflow for landing pages
- All new Genesis projects include PC reboot recovery from day one

CHANGES:
- Update genesis-core.md (restart workflow setup)
- Update genesis-saas-app.md (SaaS-specific customization)
- Update genesis-landing-page.md (landing page customization)
- Update templates/README.md (include context recovery by default)
- Update docs/CLAUDE_CODE_INSTRUCTIONS.md
- Update docs/PROJECT_KICKOFF_CHECKLIST.md

IMPACT:
- Every new Genesis project: automatic PC reboot recovery
- No manual RESTART_ARTIFACT.md application needed
- Consistent restart workflow across all projects
- Part of Genesis quality standards

BACKWARD COMPATIBLE:
- Existing projects without restart workflow still work
- RESTART_ARTIFACT.md still available for manual application
- No breaking changes

Version: Genesis v1.2.0"

# Push to GitHub
git push origin main
```

---

## Expected Outcome

**After implementation:**
1. ✅ Every new Genesis project has restart workflow built-in
2. ✅ Developers get PC reboot recovery automatically
3. ✅ Consistent experience across all Genesis projects
4. ✅ No extra manual steps needed
5. ✅ Part of Genesis quality standards (like TypeScript strict mode)

**For existing projects:**
1. ✅ Continue using RESTART_ARTIFACT.md for manual application
2. ✅ No breaking changes
3. ✅ Optional: can manually apply restart workflow anytime

---

## Next Steps

1. **Review this proposal** - Make any adjustments needed
2. **Execute implementation** - Update skill files, templates, docs
3. **Test with new project** - Verify restart workflow auto-generated
4. **Commit and push** - Genesis v1.2.0 to main branch
5. **Update existing projects** - Optionally apply to rok-copilot, my-erp-plan, serp-master (already done)

---

**Ready to implement!** Feed this proposal to Claude Code in project-genesis terminal.

**Command to use:**
```
Implement Genesis v1.2.0 auto-restart workflow proposal from GENESIS_AUTO_RESTART_PROPOSAL.md. Update skills, templates, and documentation as specified.
```

---

**Version**: Genesis v1.2.0 (proposed)
**Date**: October 25, 2025
**Author**: Claude Code (Sonnet 4.5)
**Status**: Ready for implementation
