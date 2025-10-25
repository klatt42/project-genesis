# Genesis Project Restart Artifact

**Purpose**: Quick project restart after PC reboot or terminal restart
**Usage**: Feed this to Claude Code in any project terminal to apply Genesis v1.1.0 restart templates

---

## 🎯 Two Use Cases

### Case 1: Projects Already Have restart-project.sh
**If the project already has the restart workflow (rok-copilot, my-erp-plan, serp-master):**

After PC reboot, just run:
```bash
cd ~/projects/[project] && ./restart-project.sh
```

**No need to apply this artifact** - the restart workflow is already there!

### Case 2: New Projects or Projects Without Restart Workflow
**If the project doesn't have restart-project.sh yet:**

Use this **recommended command format**:
```
Apply Genesis v1.1.0 restart workflow to [project-name] at [path]. It's a [type]. Create restart-project.sh, PROJECT_STATUS.md, and context recovery files.
```

**Examples:**
- "Apply Genesis v1.1.0 restart workflow to my-new-project at ~/projects/my-new-project. It's a SaaS Application. Create restart-project.sh, PROJECT_STATUS.md, and context recovery files."
- "Apply Genesis v1.1.0 restart workflow to landing-site at ~/projects/landing-site. It's a Landing Page. Create restart-project.sh, PROJECT_STATUS.md, and context recovery files."

**Why this format?**
- ✅ Clear: Specifies "v1.1.0 restart workflow" (not SaaS templates)
- ✅ Explicit: Lists specific deliverables (restart-project.sh, etc.)
- ✅ Unambiguous: Won't confuse with genesis-saas-app skill

**Avoid ambiguous commands like:**
- ❌ "Apply Genesis templates to [project]" (too vague)
- ❌ "Apply Genesis restart templates to [project]" (could mean SaaS templates)

---

## 🚨 IMPORTANT: Execute ALL Steps Below Automatically

**When you receive this artifact, you MUST complete ALL 5 steps without stopping.**

Do NOT just restart the dev server. Execute the full workflow below.

---

## Project Information Required

When the user provides this artifact, they will specify:
1. **Project name** (e.g., "rok-copilot", "my-erp-plan", "serp-master")
2. **Project type** (e.g., "SaaS Application", "Landing Page")
3. **Project path** (if not in `~/projects/[project-name]`)

---

## COMPLETE WORKFLOW - Execute ALL Steps

### Step 1: Apply Genesis Templates ✅ REQUIRED

**Run this command first:**
```bash
~/projects/project-genesis/update-existing-project.sh [PROJECT_PATH]
```

This will copy:
- GENESIS_QUICK_START.md
- PROJECT_STATUS.md
- .github/CLAUDE_CODE_REMINDER.md
- README.md template (if missing)

**Expected output**: "Templates copied successfully!"

---

### Step 2: Generate Restart Script ✅ REQUIRED

**Run this command:**
```bash
~/projects/project-genesis/templates/generate-restart-script.sh [PROJECT_NAME] "[PROJECT_TYPE]"
```

**Example:**
```bash
~/projects/project-genesis/templates/generate-restart-script.sh serp-master "SaaS Application"
```

This creates the executable `restart-project.sh` script.

**Expected output**: "Script Generated Successfully!"

---

### Step 3: Gather Project Context ✅ REQUIRED

**Run these git commands to understand current state:**
```bash
cd [PROJECT_PATH]
git log --oneline -10
git branch --show-current
git status
```

**Read these files (if they exist):**
- README.md
- package.json
- Any existing status/documentation files (CURRENT_STATUS.md, PHASE_*.md, etc.)
- .env or .env.example (for environment info)

**Determine:**
- Current phase/milestone
- Last task worked on
- Uncommitted changes
- Next actions
- Active issues/blockers

---

### Step 4: Customize Templates ✅ REQUIRED

**DO NOT leave placeholders! Replace ALL [PLACEHOLDER] text with actual project details.**

#### 4a. Customize PROJECT_STATUS.md

Replace placeholders with actual information:
- `[PROJECT_NAME]` → actual project name
- `[DATE and TIME]` → current date and time
- `[Phase Number and Name]` → actual phase from git/docs
- Current Position section → fill with actual current state
- Phase Progress → fill with actual completed/in-progress items
- Database Status → actual Supabase info (if applicable)
- Recent Changes → from git log
- Next Actions → actual next steps from docs/status

**CRITICAL**: Read existing project docs to fill this accurately!

#### 4b. Customize GENESIS_QUICK_START.md

Replace placeholders with:
- Project name
- Project type
- Current phase status
- Environment URLs (Supabase, GitHub, Netlify, etc.)
- Genesis skills already used
- Tech stack details

#### 4c. Update README.md

Add context recovery section at the TOP of README.md:

```markdown
## 🤖 For Claude Code: Context Recovery

**If context was lost (restart, PC reboot, new thread), read these files IN ORDER:**

1. **[.github/CLAUDE_CODE_REMINDER.md](./.github/CLAUDE_CODE_REMINDER.md)** ← START HERE
2. **[GENESIS_QUICK_START.md](./GENESIS_QUICK_START.md)** - Project overview & recovery workflow
3. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current state, position, and next actions

**Then invoke Genesis skills to reload context:**
```typescript
Skill({ command: 'genesis-core' })
Skill({ command: 'genesis-[project-type]' })
```

**PC Reboot Recovery:**
```bash
cd ~/projects/[project-path] && ./restart-project.sh
```
```

---

### Step 5: Test and Commit ✅ REQUIRED

#### 5a. Test the restart script
```bash
cd [PROJECT_PATH] && ./restart-project.sh
```

**Verify output shows:**
- Project name and type
- Git status and branch
- Context recovery prompt for Claude Code
- Tab 1 and Tab 2 instructions

#### 5b. Commit all changes
```bash
git add .github/CLAUDE_CODE_REMINDER.md GENESIS_QUICK_START.md PROJECT_STATUS.md restart-project.sh README.md
git commit -m "feat: Add Genesis v1.1.0 context recovery and restart workflow

CONTEXT RECOVERY SYSTEM:
- Add .github/CLAUDE_CODE_REMINDER.md (auto-surfaces on context loss)
- Add GENESIS_QUICK_START.md (project overview & recovery workflow)
- Add PROJECT_STATUS.md (detailed current state)
- Add restart-project.sh (PC reboot two-tab workflow script)
- Update README.md (context recovery section at top)

Based on Genesis v1.1.0 terminal restart patterns.
Enables seamless PC reboot recovery and context restoration."
```

**Do NOT push to remote unless explicitly requested by user.**

---

## Expected Completion Report

After completing ALL 5 steps, report:

```
✅ Genesis v1.1.0 Restart Workflow Applied to [PROJECT_NAME]

Files Created/Modified:
- ✅ restart-project.sh (executable, ~100 lines)
- ✅ PROJECT_STATUS.md (customized with current state)
- ✅ GENESIS_QUICK_START.md (customized with project details)
- ✅ .github/CLAUDE_CODE_REMINDER.md (auto context recovery)
- ✅ README.md (context recovery section added)

All files committed to git: [commit hash]

Next PC Reboot:
cd [PROJECT_PATH] && ./restart-project.sh

Ready for PC reboot workflow!
```

---

## Success Criteria Checklist

Before reporting completion, verify:

- [ ] Step 1: Templates copied (ran update-existing-project.sh)
- [ ] Step 2: restart-project.sh generated and executable
- [ ] Step 3: Read git log, README, existing docs
- [ ] Step 4: PROJECT_STATUS.md has NO placeholders, actual project state
- [ ] Step 4: GENESIS_QUICK_START.md has NO placeholders
- [ ] Step 4: README.md has context recovery section at top
- [ ] Step 5: Tested restart-project.sh (shows correct output)
- [ ] Step 5: All files committed to git
- [ ] restart-project.sh shows correct project name and type
- [ ] Context recovery prompt in restart script is correct

**All items must be checked before reporting completion!**

---

## Common Mistakes to Avoid

❌ **WRONG**: Only restarting dev server
✅ **CORRECT**: Execute ALL 5 steps

❌ **WRONG**: Leaving [PLACEHOLDER] text in files
✅ **CORRECT**: Replace ALL placeholders with actual project info

❌ **WRONG**: Skipping git log / project file reading
✅ **CORRECT**: Read existing files to understand current state

❌ **WRONG**: Not testing restart-project.sh
✅ **CORRECT**: Test it and verify output is correct

❌ **WRONG**: Not committing files
✅ **CORRECT**: Commit all 5 files with proper message

---

## Example: Complete Workflow for serp-master

```
User: "Apply Genesis restart templates to serp-master. It's a SaaS Application."

Claude Code executes:

Step 1: Run update-existing-project.sh
  → Templates copied to ~/projects/serp-master

Step 2: Generate restart script
  → ~/projects/serp-master/templates/generate-restart-script.sh serp-master "SaaS Application"
  → restart-project.sh created

Step 3: Gather context
  → git log --oneline -10
  → git status
  → Read README.md, package.json, existing docs
  → Determine: Phase 2, working on API endpoints, 3 uncommitted files

Step 4: Customize templates
  → PROJECT_STATUS.md: Fill current phase (Phase 2), recent changes, next actions
  → GENESIS_QUICK_START.md: Add serp-master details, environment URLs
  → README.md: Add context recovery section at top

Step 5: Test and commit
  → ./restart-project.sh (verify correct output)
  → git add + commit all files

Report: ✅ Complete! Ready for PC reboot workflow.
```

---

## What User Will Do After PC Reboot

**Tab 1 (WSL):**
```bash
cd ~/projects/[project-path] && ./restart-project.sh
```

**Tab 2 (Claude Code):**
Paste the context recovery prompt shown by the restart script.

**Result**: Full context recovered, ready to resume work.

---

**Version**: Genesis v1.1.0 (Updated for automatic execution)
**Last Updated**: October 25, 2025
**Repository**: https://github.com/cole-m/project-genesis
