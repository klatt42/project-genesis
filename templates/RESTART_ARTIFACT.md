# Genesis Project Restart Artifact

**Purpose**: Quick project restart after PC reboot or terminal restart
**Usage**: Feed this to Claude Code in any project terminal to apply Genesis v1.1.0 restart templates

---

## Quick Instructions

**This artifact applies Genesis v1.1.0 restart templates to a project.**

When you provide this artifact to Claude Code, also specify:
1. **Project name** (e.g., "rok-copilot", "my-erp-plan")
2. **Project type** (e.g., "SaaS Application", "Landing Page")

---

## What This Artifact Does

1. ✅ Applies Genesis v1.1.0 templates from `~/projects/project-genesis/templates/`
2. ✅ Generates project-specific `restart-project.sh` script
3. ✅ Customizes templates with project details (you provide the details)
4. ✅ Commits files to project git repository

---

## Files That Will Be Created

1. **GENESIS_QUICK_START.md** - Project overview & context recovery workflow
2. **PROJECT_STATUS.md** - Current state & next actions (needs customization)
3. **.github/CLAUDE_CODE_REMINDER.md** - Auto context recovery reminder
4. **restart-project.sh** - PC reboot two-tab workflow script
5. **README.md** - Updated with context recovery section (or created if missing)

---

## Commands to Execute

### Step 1: Apply Templates
```bash
~/projects/project-genesis/update-existing-project.sh ~/projects/[PROJECT_NAME]
```

### Step 2: Generate Restart Script
```bash
~/projects/project-genesis/templates/generate-restart-script.sh [PROJECT_NAME] "[PROJECT_TYPE]"
```

### Step 3: Customize Templates
- Read existing project files to understand current state
- Customize PROJECT_STATUS.md with:
  - Current phase and progress
  - Recent changes
  - Next actions
  - Active issues
- Customize GENESIS_QUICK_START.md with:
  - Project-specific details
  - Environment URLs
  - Current phase status
- Update README.md with context recovery section at top

### Step 4: Test Restart Script
```bash
cd ~/projects/[PROJECT_NAME] && ./restart-project.sh
```

### Step 5: Commit Changes
```bash
git add .github/CLAUDE_CODE_REMINDER.md GENESIS_QUICK_START.md PROJECT_STATUS.md restart-project.sh README.md
git commit -m "feat: Add Genesis v1.1.0 context recovery and restart workflow"
```

---

## Context Recovery Workflow

**After PC reboot, the user will:**

**Tab 1 (WSL):**
```bash
cd ~/projects/[PROJECT_NAME] && ./restart-project.sh
```

**Tab 2 (Claude Code):**
Paste the context recovery prompt shown by the script.

---

## Project-Specific Information Needed

To customize the templates, you'll need to gather:

### From Git:
```bash
git log --oneline -10        # Recent commits
git branch --show-current    # Current branch
git status                   # Uncommitted changes
```

### From Project Files:
- README.md (project overview)
- package.json (dependencies, scripts)
- Existing documentation (CURRENT_STATUS.md, etc.)

### About Current State:
- What phase/milestone is the project at?
- What was the last task being worked on?
- What are the next actions?
- Are there any active issues/blockers?

---

## Example Usage

```
User: "Apply Genesis restart templates to my-erp-plan. It's a SaaS Application."

Claude Code:
1. Runs update-existing-project.sh
2. Generates restart script
3. Reads git log, README, existing docs
4. Customizes PROJECT_STATUS.md with current ERP plan state
5. Customizes GENESIS_QUICK_START.md
6. Updates README.md
7. Tests restart-project.sh
8. Commits all files
9. Confirms ready for PC reboot workflow
```

---

## Success Criteria

✅ All 5 files created/updated
✅ restart-project.sh is executable
✅ PROJECT_STATUS.md has current project state (not placeholders)
✅ GENESIS_QUICK_START.md has project-specific details
✅ restart-project.sh shows correct context recovery prompt
✅ All files committed to git
✅ User can now use ./restart-project.sh after PC reboot

---

## Quick Command Summary

```bash
# Apply to a project (replace [PROJECT_NAME] and [PROJECT_TYPE]):
~/projects/project-genesis/update-existing-project.sh ~/projects/[PROJECT_NAME]
~/projects/project-genesis/templates/generate-restart-script.sh [PROJECT_NAME] "[PROJECT_TYPE]"
# Then customize templates, test, and commit
```

---

**Version**: Genesis v1.1.0
**Last Updated**: October 25, 2025
**Repository**: https://github.com/cole-m/project-genesis
