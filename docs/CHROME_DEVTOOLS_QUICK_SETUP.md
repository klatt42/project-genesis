# Chrome DevTools MCP Quick Setup Guide

Get Chrome DevTools MCP running with Project Genesis in 5 minutes.

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js version (need 22+)
node --version
# Should show: v22.x.x or higher

# Check if Claude Code is installed
claude --version

# Check if Chrome is installed
google-chrome --version
# or
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version  # macOS
```

If any are missing:
- **Node.js 22+**: Download from https://nodejs.org
- **Claude Code**: Install from https://claude.com/code
- **Chrome**: Download from https://www.google.com/chrome

---

## 5-Minute Setup

### Step 1: Install Chrome DevTools MCP (1 minute)

```bash
# Single command to install
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

**Expected output:**
```
✓ Added chrome-devtools MCP server
✓ Server configured and ready
```

### Step 2: Verify Installation (1 minute)

```bash
# List all MCP servers
claude mcp list
```

**You should see:**
```
chrome-devtools:
  command: npx
  args: ['chrome-devtools-mcp@latest']
  status: ready
```

### Step 3: Start Your Project (1 minute)

```bash
# Navigate to your Genesis project
cd ~/Developer/projects/[your-project]

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

**Verify it's running:**
- Open browser to http://localhost:3000
- You should see your project

### Step 4: Test Chrome DevTools MCP (1 minute)

Open Claude Code in your project directory and run:

```
Navigate to localhost:3000 and tell me what you see.
Check the console for any errors.
```

**Expected behavior:**
- Claude Code will launch Chrome
- Navigate to your site
- Inspect the page
- Report back with findings

### Step 5: Run First Quality Scan (1 minute)

```
Quick quality check: Navigate to localhost:3000, score the overall
page 1-10, and list the top 3 issues to fix.
```

**You should get:**
- Overall quality score (1-10)
- Top 3 issues prioritized
- Specific recommendations

---

## Verification Checklist

After setup, verify everything works:

- [ ] Claude Code responds to Chrome DevTools commands
- [ ] Chrome launches automatically
- [ ] Can navigate to localhost:3000
- [ ] Can inspect page elements
- [ ] Can record performance traces
- [ ] Can check console errors
- [ ] Quality scores are generated

---

## Troubleshooting Quick Fixes

### Issue: "chrome-devtools not found"

**Fix:**
```bash
# Remove and re-add
claude mcp remove chrome-devtools
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest

# Verify
claude mcp list
```

### Issue: "Chrome won't launch"

**Fix:**
```bash
# Check Chrome installation
which google-chrome  # Linux/WSL
which chrome         # macOS

# Try manual Chrome launch
google-chrome --version

# If Chrome not found, install it
# Linux/WSL: sudo apt install google-chrome-stable
# macOS: Download from google.com/chrome
```

### Issue: "localhost:3000 not responding"

**Fix:**
```bash
# Check if dev server is running
ps aux | grep "next dev"  # for Next.js
# or
ps aux | grep "vite"      # for Vite

# If not running, start it
npm run dev

# Check port 3000 is available
lsof -i :3000

# If port taken, kill process
kill -9 [PID]
# Then restart: npm run dev
```

### Issue: "Connection timeout"

**Fix:**
```bash
# Increase timeout in MCP settings
# Edit: ~/.claude-code/mcp-settings.json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"],
      "timeout": 60000  // 60 seconds
    }
  }
}

# Restart Claude Code
exit
claude
```

### Issue: WSL-Specific: "Cannot connect to display"

**Fix:**
```bash
# Install required packages
sudo apt update
sudo apt install -y google-chrome-stable xdg-utils

# Set display variable (add to ~/.bashrc)
export DISPLAY=:0

# Or use Windows Chrome
# Create symlink in WSL
sudo ln -s /mnt/c/Program\ Files/Google/Chrome/Application/chrome.exe /usr/local/bin/chrome
```

---

## WSL-Specific Setup

If you're using Windows Subsystem for Linux (WSL):

### Option 1: Use Windows Chrome (Recommended)

```bash
# Add to ~/.bashrc or ~/.zshrc
export CHROME_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"

# Reload shell
source ~/.bashrc

# Test
"$CHROME_PATH" --version
```

### Option 2: Use WSL Chrome with X Server

1. **Install VcXsrv or X410** (Windows X server)
2. **Configure display:**
   ```bash
   export DISPLAY=:0
   ```
3. **Install Chrome in WSL:**
   ```bash
   wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
   sudo dpkg -i google-chrome-stable_current_amd64.deb
   sudo apt --fix-broken install
   ```

---

## Genesis Integration

### Create Quality Reports Directory

```bash
# In your Genesis project
mkdir -p docs/quality-reports/[project-name]

# Verify structure
ls -la docs/quality-reports/
```

### Run Baseline Quality Scan

```
Run comprehensive quality validation on localhost:3000 and save the report to:
docs/quality-reports/[project-name]/baseline-2025-10-16.md

Use the Genesis quality report template.
```

### Add to Git

```bash
# Add quality reports to git
git add docs/quality-reports/

# Commit
git commit -m "Add baseline quality report"
```

---

## Daily Workflow Setup

### Morning Check (Save this command)

```
Quick quality check: Navigate to localhost:3000, score 1-10,
and list top 3 issues compared to yesterday.
```

### Pre-Commit Check

```
Pre-commit quality check: Run quick validation on localhost:3000.
If score < 8.0, block commit and list issues to fix.
```

### Pre-Deployment Gate

```
Pre-deployment validation: Run full quality scan on localhost:3000.
Verify: overall ≥ 8.0, performance ≥ 8.5, accessibility ≥ 90,
all Core Web Vitals pass. Report deployment readiness.
```

---

## Save These Commands

**Create a file: `~/genesis-quality-commands.txt`**

```bash
# Quick Quality Check
Quick quality check: score localhost:3000

# Full Quality Scan
Run comprehensive quality validation on localhost:3000

# Performance Audit
Performance audit: report Core Web Vitals and top 3 optimizations

# Responsive Test
Test responsive design at 375px, 768px, 1920px breakpoints

# Form Test
Test contact form submission and validation

# Console Check
Check console for errors on localhost:3000
```

**Access quickly:**
```bash
# View saved commands
cat ~/genesis-quality-commands.txt

# Or create an alias (add to ~/.bashrc)
alias qc='cat ~/genesis-quality-commands.txt'

# Usage
qc  # Shows all saved commands
```

---

## IDE Integration (Optional)

### VS Code Snippets

Create `.vscode/claude-snippets.json`:

```json
{
  "Quality Check": {
    "prefix": "qc",
    "body": ["Quick quality check: score localhost:3000"],
    "description": "Quick quality validation"
  },
  "Full Scan": {
    "prefix": "qs",
    "body": ["Run comprehensive quality validation on localhost:3000"],
    "description": "Full quality scan"
  },
  "Performance": {
    "prefix": "qp",
    "body": ["Performance audit: report Core Web Vitals"],
    "description": "Performance audit"
  }
}
```

---

## Next Steps

After setup is complete:

1. **Read Command Reference**: `docs/CHROME_DEVTOOLS_COMMAND_REFERENCE.md`
2. **Study Quality Standards**: `docs/QUALITY_STANDARDS.md`
3. **Review Templates**: `docs/QUALITY_VALIDATION_TEMPLATES.md`
4. **Run First Scan**: Generate baseline quality report
5. **Set Daily Goals**: Track quality improvements

---

## Getting Help

### Documentation
- [Chrome DevTools MCP](CHROME_DEVTOOLS_MCP.md)
- [Quality Standards](QUALITY_STANDARDS.md)
- [Command Reference](CHROME_DEVTOOLS_COMMAND_REFERENCE.md)
- [Validation Templates](QUALITY_VALIDATION_TEMPLATES.md)

### Official Resources
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp
- Claude Code Docs: https://docs.claude.com/en/docs/claude-code
- Project Genesis: https://github.com/klatt42/project-genesis

### Common Issues
- Check [Chrome DevTools MCP Troubleshooting](CHROME_DEVTOOLS_MCP.md#troubleshooting)
- Check [Browser Automation Guide](BROWSER_AUTOMATION_GUIDE.md#troubleshooting)

---

## Quick Reference Card

**Save this to your notes:**

```
✅ SETUP COMPLETE CHECKLIST
□ Node.js 22+ installed
□ Claude Code installed
□ Chrome browser installed
□ Chrome DevTools MCP added
□ MCP server verified (claude mcp list)
□ Dev server running (localhost:3000)
□ First quality scan completed
□ Baseline report saved
□ Quality commands saved

✅ DAILY WORKFLOW
Morning: Quick quality check
After changes: Full quality scan
Before commit: Pre-commit check
Before deploy: Pre-deployment gate
End of day: Generate progress report

✅ QUICK COMMANDS
QC: Quick quality check
FULL: Full quality scan
PERF: Performance audit
RESP: Responsive test
FORM: Form validation
```

---

**Setup Time**: ~5 minutes
**Status**: Ready for Quality Validation
**Next**: Run your first comprehensive quality scan!

---

**Pro Tip**: Bookmark this file for quick reference during setup of new Genesis projects.
