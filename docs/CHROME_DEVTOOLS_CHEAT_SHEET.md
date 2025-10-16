# Chrome DevTools MCP Cheat Sheet
## One-Page Quick Reference

**Print this or keep it open while working!**

---

## 🚀 Installation (One Time)

```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
claude mcp list  # Verify
```

---

## 💨 Quick Commands (Most Used)

### Quick Check (30 seconds)
```
Quick quality check: score localhost:3000
```

### Full Scan (2 minutes)
```
Run comprehensive quality validation on localhost:3000
```

### Performance (1 minute)
```
Performance audit: report Core Web Vitals
```

### Responsive (1 minute)
```
Test responsive at 375px, 768px, 1920px
```

### Form Test (2 minutes)
```
Test contact form with sample data
```

### Console Check (10 seconds)
```
Check console for errors on localhost:3000
```

---

## 🎯 Section Tests

### Hero
```
Validate hero section: layout, CTAs, responsive
```

### Form
```
Test contact form: validation, submission, errors
```

### Services
```
Check services section: cards, icons, layout
```

### Mobile
```
Test at 375px: scrolling, touch targets, text size
```

---

## 🔧 Debug Commands

### Layout Issue
```
Debug layout in [selector]: inspect and fix
```

### Slow Page
```
Identify performance bottlenecks and recommend fixes
```

### Mobile Problem
```
Debug mobile layout: check overflow and targets
```

### Form Not Working
```
Debug form submission: network and console
```

---

## 📊 Tracking

### Compare
```
Compare quality to docs/quality-reports/baseline.md
```

### Progress
```
Show quality trend over time from all reports
```

---

## 💾 Save Report

```
Save report to docs/quality-reports/[project]/[type]-[date].md
```

**Types**: baseline, daily, pre-deployment, post-deployment

---

## 🎨 Natural Language

**Just ask in plain English**:
- "Why is text overflowing on mobile?"
- "How fast does my page load?"
- "Are there console errors?"
- "Does the form work?"
- "How does this look on tablet?"
- "What should I fix first?"

---

## ✅ Quality Gates

### Pre-Commit
```
Pre-commit check: if score < 8.0, list issues
```

### Pre-Deployment
```
Pre-deployment gate: verify all standards met
```

---

## 🎯 Daily Workflow

**Morning**:
```
Quick quality check: score localhost:3000
```

**After Changes**:
```
Run comprehensive quality validation
```

**Before Commit**:
```
Pre-commit quality check
```

**Before Deploy**:
```
Pre-deployment validation: full scan
```

---

## 📏 Quality Standards

**Landing Pages**:
- Overall: ≥ 8.0/10
- Performance: ≥ 8.5/10
- Accessibility: ≥ 90

**SaaS Apps**:
- Overall: ≥ 8.5/10
- Performance: ≥ 8.0/10
- Security: ≥ 9.0/10

**Core Web Vitals**:
- LCP: < 2.5s
- CLS: < 0.1
- FID: < 100ms

---

## 🚨 Troubleshooting

**Not working?**
```bash
claude mcp list        # Check status
claude mcp remove chrome-devtools
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
exit                   # Restart Claude Code
claude
```

**Chrome won't launch?**
```bash
which google-chrome    # Check installed
google-chrome --version
```

**Timeout?**
Edit `~/.claude-code/mcp-settings.json`:
```json
{"timeout": 60000}
```

---

## 🔗 Documentation

**Quick Guides**:
- [Quick Start](CHROME_DEVTOOLS_QUICK_START.md) - 15-minute first test
- [Command Reference](CHROME_DEVTOOLS_COMMAND_REFERENCE.md) - All 45+ commands
- [Complete Setup](CHROME_DEVTOOLS_QUICK_SETUP.md) - Full setup guide

**Standards**:
- [Quality Standards](QUALITY_STANDARDS.md) - Scoring criteria
- [Templates](QUALITY_VALIDATION_TEMPLATES.md) - Validation templates

**Implementation**:
- [Chrome DevTools MCP](CHROME_DEVTOOLS_MCP.md) - Integration guide
- [Browser Automation](BROWSER_AUTOMATION_GUIDE.md) - Full implementation

---

## 🎓 Pro Tips

1. **Save commands**: Create `~/genesis-commands.txt`
2. **Track reports**: Always save to `docs/quality-reports/`
3. **Compare scores**: Check trend over time
4. **Fix high priority first**: Impact > effort
5. **Re-test after fixes**: Verify improvements
6. **Celebrate wins**: Track quality improvements

---

## 📋 Quick Checklist

**First Time**:
- [ ] Install Chrome DevTools MCP
- [ ] Run test navigation
- [ ] Generate first quality report
- [ ] Save baseline report

**Daily**:
- [ ] Morning: Quick check
- [ ] After changes: Full scan
- [ ] Before commit: Quality gate
- [ ] Track improvements

**Before Deploy**:
- [ ] Full quality scan
- [ ] Verify standards met
- [ ] Save pre-deployment report
- [ ] Get approval to deploy

---

## 🎯 Shortcuts (Save These)

Create aliases in `~/.bashrc`:
```bash
alias qc='echo "Quick quality check: score localhost:3000"'
alias qf='echo "Run comprehensive quality validation"'
alias qp='echo "Performance audit: Core Web Vitals"'
alias qr='echo "Test responsive at all breakpoints"'
```

---

**Print this and keep it handy!** 🖨️

Most commands are natural language - just describe what you want to test.

**Example**: "Check if the hero section looks good on mobile and tablet"

**Status**: Ready to Use
**Updated**: 2025-10-16
**Version**: 1.0
