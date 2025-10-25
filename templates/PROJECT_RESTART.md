# Project Terminal Restart Guide

**Project**: [PROJECT_NAME]
**WSL Path**: `~/projects/[project-name]`
**Last Updated**: [DATE]

---

## 🔄 PC Reboot / Terminal Restart Workflow

**Standard Setup**: Two-tab terminal organization
- **Tab 1**: WSL/Ubuntu (system commands)
- **Tab 2**: Claude Code (AI development)

---

## Quick Start Commands

### Tab 1: WSL Terminal Setup

```bash
cd ~/projects/[project-name]
pwd  # Verify directory
git branch --show-current
git status
npm run dev  # Start dev server (or yarn dev)
```

**✅ READY**: WSL terminal ready for git, npm, system commands

**Keep open for**:
- Git operations (commit, push, pull, branch management)
- NPM commands (install, run, build)
- File system operations
- Database migrations (Supabase)
- Deployment commands (Netlify)

---

### Tab 2: Claude Code Terminal Setup

```bash
cd ~/projects/[project-name]
pwd  # Verify directory
claude init
```

**✅ READY**: Claude Code ready

**After Claude Code starts**, provide context recovery prompt:

```
Reload Genesis context for [PROJECT_NAME].

This is a [SaaS Application / Landing Page] project using Genesis patterns.

Please:
1. Review .github/CLAUDE_CODE_REMINDER.md
2. Review GENESIS_QUICK_START.md
3. Review PROJECT_STATUS.md
4. Invoke genesis-core skill
5. Invoke genesis-[saas-app/landing-page] skill
6. Resume from current position in PROJECT_STATUS.md

Current phase: [Phase name]
Last working on: [Task description]
```

**Keep open for**:
- Code generation
- Pattern application
- Troubleshooting with Genesis skills
- AI-assisted development

---

## Alternative: One-Command Restart Script

### Create `restart-project.sh`

A bash script that:
- Checks directory
- Shows git status
- Displays restart instructions for both tabs
- Provides context recovery prompt

### Usage After PC Reboot

**Tab 1 (WSL)**:
```bash
cd ~/projects/[project-name] && ./restart-project.sh
```

**Tab 2 (Claude Code)**:
```bash
# Follow instructions from script
```

---

## Environment-Specific Considerations

### Development Server
```bash
# Check if port is in use
lsof -i :3000

# Kill process if needed
kill -9 $(lsof -t -i :3000)

# Start dev server
npm run dev
```

### Database Connection
```bash
# Verify Supabase connection (if using Supabase)
# Check .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
cat .env.local | grep SUPABASE
```

### Docker (if applicable)
```bash
# Check Docker status
docker ps

# Restart containers if needed
docker-compose up -d
```

---

## Quick Reference: Tab Organization

```
┌─────────────────────────────────────────────────────────────┐
│ Terminal Window                                             │
├─────────────────────────┬───────────────────────────────────┤
│ Tab 1: WSL/Ubuntu       │ Tab 2: Claude Code                │
│                         │                                   │
│ ~/projects/[project]    │ ~/projects/[project]              │
│                         │                                   │
│ Running:                │ Running:                          │
│ • npm run dev           │ • claude interactive session      │
│ • git operations        │ • AI development assistant        │
│ • system commands       │ • pattern application             │
│                         │                                   │
│ Purpose:                │ Purpose:                          │
│ • Build & deploy        │ • Code generation                 │
│ • Version control       │ • Genesis patterns                │
│ • Package management    │ • Troubleshooting                 │
└─────────────────────────┴───────────────────────────────────┘
```

---

## Common Post-Reboot Issues

### Node modules missing
```bash
npm install
# or
yarn install
```

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Git credentials expired
```bash
# Re-authenticate with GitHub
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# May need to re-authenticate
git push  # Will prompt for credentials
```

### Claude Code won't initialize
```bash
# Verify Claude Code installation
claude --version

# Reinstall if needed
npm install -g @anthropic-ai/claude-code
```

---

## Checklist: Full Restart Complete

- [ ] Tab 1: Navigated to project directory
- [ ] Tab 1: Git status verified (correct branch)
- [ ] Tab 1: Dev server running (npm run dev)
- [ ] Tab 1: No errors in terminal
- [ ] Tab 2: Navigated to project directory
- [ ] Tab 2: Claude Code initialized (claude init)
- [ ] Tab 2: Context recovery prompt provided
- [ ] Tab 2: Claude confirmed Genesis context loaded
- [ ] Tab 2: Claude ready to resume work
- [ ] Both tabs ready for development

---

## One-Line Summary

**After PC reboot**:

1. **Tab 1**: `cd ~/projects/[project-name] && ./restart-project.sh`
2. **Tab 2**: `cd ~/projects/[project-name] && claude init` + paste recovery prompt

**Time to full context recovery**: ~2 minutes

---

## Notes

- Always verify you're on the correct git branch before starting work
- Check git status to see if there are uncommitted changes from previous session
- Review PROJECT_STATUS.md to understand where you left off
- Keep both tabs open during entire development session
- Update PROJECT_STATUS.md at end of each session for easier restart next time

---

**Template Version**: Genesis v1.1.0
**Created**: 2025-10-25
**Part of**: Genesis Terminal Restart Workflow
