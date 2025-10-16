# Chrome DevTools MCP Quick Start Guide
## Immediate Actions - Start Today!

**Time to First Test**: 15 minutes
**Project**: Commercial Landing Page
**Goal**: Get Chrome DevTools MCP working and run your first quality scan

---

## Quick Start: 3 Commands to Success

### Command 1: Install (2 minutes)

```bash
# Open WSL terminal
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest

# Verify
claude mcp list
```

**Expected**: See `chrome-devtools` in the list

---

### Command 2: Test (3 minutes)

```bash
# Navigate to your commercial project
cd ~/Developer/projects/personal/commercial-lead-gen

# Start Claude Code
claude
```

**In Claude Code, type**:
```
Start the dev server and navigate to localhost:3000. Tell me what you see
on the page and check the console for any errors.
```

**Expected**: Claude launches Chrome, inspects your page, reports findings

---

### Command 3: Quality Scan (10 minutes)

```
Run a comprehensive quality check on the commercial restoration landing page:

1. Navigate to localhost:3000
2. Check responsive design at mobile (375px), tablet (768px), desktop (1920px)
3. Test the contact form with sample data
4. Record performance metrics (LCP, CLS, FID)
5. Check console for errors
6. Score each section (hero, services, testimonials, form, footer) from 1-10
7. Generate a quality report

Provide:
- Overall quality score
- Section-by-section scores
- Top 3 issues to fix
- Specific recommendations
```

**Expected**: Automated quality report with scores and actionable fixes

---

## Today's Success Checklist

After running these 3 commands, you should have:
- ✅ Chrome DevTools MCP installed
- ✅ Verified it works with your project
- ✅ Generated your first automated quality report
- ✅ Specific issues identified
- ✅ Recommendations for improvements

**Time saved vs manual testing**: 45 minutes on this first run alone!

---

## What This Unlocks

Now that it's working, you can use it for:
- **Real-time debugging**: "Why is the text overflowing on mobile?"
- **Performance analysis**: "What's slowing down my page load?"
- **Form testing**: "Is the contact form submitting correctly?"
- **Responsive validation**: "How does this look on tablet?"
- **Error detection**: "Are there any console errors?"
- **Quality scoring**: "What's my current quality score?"

---

## Your First Optimization Loop

**Try this workflow**:
```
1. Run quality scan → Get score of 7.5/10
2. Ask: "What are the top 3 issues?"
3. Ask: "How do I fix [specific issue]?"
4. Apply the fix
5. Run quality scan again → Get score of 8.2/10
6. Celebrate improvement! 🎉
```

**This entire loop**: 10-15 minutes (vs 1-2 hours manually)

---

## Natural Language Examples

**Instead of manually testing, just ask**:
- "Check if the hero section looks good on mobile"
- "Test all the buttons to make sure they work"
- "How fast does the page load?"
- "Are there any accessibility issues?"
- "Compare the quality now vs when I started"
- "What should I fix first?"

**Claude uses Chrome DevTools MCP to actually test and report back!**

---

## Quick Tip: Save Your Reports

Create a quality reports folder:
```bash
cd ~/Developer/projects/personal/commercial-lead-gen
mkdir -p docs/quality-reports
```

Then ask Claude to save each report:
```
Save this quality report to docs/quality-reports/report-[date].md
```

**Track your improvements over time!**

---

## Common First-Time Questions

**Q: Does this work with localhost?**
A: Yes! That's the whole point - test during development

**Q: Will it break my actual browser?**
A: No, it launches a separate Chrome instance

**Q: Can I see what it's doing?**
A: Yes! It can run with visible browser (not headless)

**Q: What if I get an error?**
A: Run `claude mcp list` to verify, restart Claude Code, try again

**Q: Does this replace manual testing?**
A: No, but reduces it by 70-90%

---

## Next Steps After Quick Start

Once you've successfully run these 3 commands:

**Tomorrow**:
- Try more specific tests (form validation, responsive design)
- Track quality improvements after fixes
- Test other pages

**This Week**:
- Integrate with Archon (Phase 2 of full plan)
- Enhance BMAD agents (Phase 3 of full plan)
- Set up automated quality gates

**This Month**:
- Add to CI/CD pipeline
- Create quality dashboards
- Expand to other Genesis projects

---

## Emergency Troubleshooting

**Chrome won't launch?**
```bash
# Check Chrome is installed
which google-chrome

# Update Chrome DevTools MCP
claude mcp remove chrome-devtools
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest

# Restart Claude Code
exit
claude
```

**Still not working?**
1. Check Node version: `node --version` (need v22+)
2. Verify MCP config: `cat ~/.claude-code/mcp-settings.json`
3. Check Chrome: `google-chrome --version`
4. Restart computer (sometimes needed for PATH updates)

---

## Celebrate Your Win! 🎉

**You just**:
- Automated quality testing
- Saved 45+ minutes of manual work
- Got objective quality scores
- Received specific, actionable recommendations

**And this is just the beginning!**

The full implementation plan adds:
- Archon integration (centralized dashboard)
- BMAD agent automation (fixes applied automatically)
- CI/CD quality gates (no bad code deployed)

But right now, with just 15 minutes of setup, you have a powerful new development superpower.

**Go test something!** 🚀

---

## For Deeper Dive

After completing this quick start, explore the comprehensive documentation:

**Setup & Installation**:
- [Complete Setup Guide](CHROME_DEVTOOLS_QUICK_SETUP.md) - Full 5-minute setup with troubleshooting
- [Command Reference](CHROME_DEVTOOLS_COMMAND_REFERENCE.md) - 45+ ready-to-use commands

**Quality Standards**:
- [Quality Standards](QUALITY_STANDARDS.md) - Detailed scoring criteria
- [Validation Templates](QUALITY_VALIDATION_TEMPLATES.md) - Reusable test templates
- [Quality Reports](quality-reports/README.md) - Report structure and templates

**Implementation**:
- [Chrome DevTools MCP](CHROME_DEVTOOLS_MCP.md) - Complete integration guide
- [Browser Automation Guide](BROWSER_AUTOMATION_GUIDE.md) - Full implementation plan
- [Archon Integration](BROWSER_AUTOMATION_GUIDE.md#layer-2-archon-integration) - Centralized testing

**Genesis Integration**:
- [Phase 2 Complete](../PHASE_2_COMPLETE.md) - Autonomous code generation
- [Claude Code Integration](../CLAUDE_CODE_INTEGRATION.md) - MCP server integration

---

**Pro Tip**: Save this file to your bookmarks for quick reference when starting new projects!

---

**Status**: Ready to Test
**Next**: Run Command 1 and start testing!
**Questions**: Refer to Emergency Troubleshooting section above
