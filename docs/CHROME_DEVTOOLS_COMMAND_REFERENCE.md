# Chrome DevTools MCP Command Reference Card

Quick access guide for quality validation commands in Project Genesis.

**Save this file for instant access to common validation commands**

---

## 🎯 Core Commands

### Full Quality Scan

```
Run comprehensive quality validation on localhost:3000:
- Overall quality score (1-10)
- Section-by-section breakdown (hero, services, testimonials, form, footer)
- Performance metrics (LCP, CLS, FID)
- Responsive design check (mobile, tablet, desktop)
- Console error check
- Top 5 issues prioritized
- Specific recommendations for each issue
```

### Quick Quality Check

```
Quick quality check: Navigate to localhost:3000, score the overall page 1-10,
and list the top 3 issues to fix.
```

### Performance Audit

```
Performance audit:
1. Record full page load trace
2. Report LCP, CLS, FID metrics with pass/fail
3. Identify the 3 biggest performance bottlenecks
4. Provide specific optimization recommendations
```

### Responsive Design Test

```
Responsive design validation:
- Test at 375px width (mobile)
- Test at 768px width (tablet)
- Test at 1920px width (desktop)
- Check for horizontal scrolling
- Verify touch targets ≥ 44px on mobile
- Screenshot each breakpoint
- Report layout issues
```

### Form Testing

```
Test the contact form:
1. Fill all fields with test data (name: "Test User", email: "test@example.com", message: "Testing")
2. Submit the form
3. Verify submission success
4. Check Supabase for received data
5. Test validation (try empty fields, invalid email)
6. Report any issues
```

### Console Error Check

```
Check for console errors: Navigate to localhost:3000 and report all
JavaScript errors, warnings, and network failures.
```

### Accessibility Audit

```
Accessibility check:
- Run Lighthouse accessibility audit
- Check ARIA labels
- Verify color contrast ratios
- Check keyboard navigation
- Test screen reader compatibility
- Report score and issues
```

---

## 🎨 Section-Specific Commands

### Hero Section

```
Validate hero section:
1. Check layout and spacing
2. Verify CTA button styling and visibility
3. Test headline readability
4. Check background image quality
5. Test at mobile (375px), tablet (768px), desktop (1920px)
6. Score 1-10
```

### Navigation

```
Test navigation:
- Check all menu items are clickable
- Test mobile menu (hamburger) if present
- Verify active states
- Test keyboard navigation
- Check accessibility
```

### Services/Features Section

```
Validate services section:
- Check card layout and spacing
- Verify icons/images load correctly
- Test responsive grid behavior
- Check hover states
- Score 1-10
```

### Testimonials

```
Validate testimonials section:
- Check layout and readability
- Verify images load
- Test slider functionality (if present)
- Check responsive behavior
- Score 1-10
```

### Contact Form

```
Comprehensive form test:
1. Visual validation (layout, styling, labels)
2. Functionality test (fill and submit)
3. Validation test (empty fields, invalid data)
4. Success/error message display
5. Supabase integration verification
6. Accessibility check
7. Mobile usability
8. Score 1-10
```

### Footer

```
Validate footer:
- Check all links work
- Verify contact information
- Test social media links
- Check copyright/legal links
- Verify responsive layout
- Score 1-10
```

---

## 🔍 Specific Issue Investigation

### Layout Issue

```
Debug layout issue in [selector]:
1. Inspect DOM element and computed styles
2. Check for overflow issues
3. Verify responsive behavior
4. Identify root cause
5. Provide specific CSS fix
```

### Performance Issue

```
Investigate slow page load:
1. Record performance trace
2. Analyze main thread activity
3. Identify render-blocking resources
4. Check JavaScript bundle size
5. Analyze image loading
6. Provide top 3 optimizations
```

### Mobile Issue

```
Debug mobile layout problem:
1. Set viewport to 375px
2. Check for horizontal scrolling
3. Inspect touch target sizes
4. Verify text readability
5. Check navigation usability
6. Provide specific fixes
```

### Form Not Working

```
Debug form submission:
1. Fill form with test data
2. Monitor network requests
3. Check console for JavaScript errors
4. Verify Supabase connection
5. Check form validation logic
6. Identify root cause and fix
```

---

## 📊 Comparison & Tracking

### Before/After Comparison

```
Compare quality before and after fixes:
1. Load previous quality report from docs/quality-reports/baseline.md
2. Run new quality scan
3. Compare scores section by section
4. Calculate improvement percentage
5. Highlight biggest improvements
6. List remaining issues
```

### Track Progress

```
Generate progress report:
1. Load all previous quality reports
2. Show quality score trend over time
3. Identify consistent issues
4. Show improvement areas
5. Provide recommendations for continued improvement
```

---

## 🚀 BMAD Agent Commands

### QA Agent Full Scan

```
QA Agent, run comprehensive quality scan on localhost:3000 and generate
detailed quality report following Genesis quality standards (minimum 8.0/10).
```

### Victoria Validation

```
Victoria Validator, validate the [specific section] on localhost:3000:
- Check UI/UX quality
- Verify functionality
- Test accessibility
- Check responsive design
- Provide specific recommendations
```

### Elena Auto-Fix

```
Based on Victoria's findings, Elena Execution should apply the top 3
highest-priority fixes. After each fix, re-validate to confirm improvement.
```

### Coordinated Workflow

```
BMAD Coordinator, execute Quality Validation Workflow on localhost:3000:
1. QA Agent: identify all issues
2. Victoria: validate specific components
3. Elena: apply fixes automatically
4. QA Agent: verify improvements
5. Oscar: create tracking tasks
6. Generate before/after report
```

---

## 🎯 Archon Dashboard Commands

### Via Archon UI

1. Navigate to http://localhost:3737/quality
2. Enter project URL: `http://localhost:3000`
3. Click "Run Quality Scan"
4. Review generated report
5. Click "Create Tasks for Fixes"

### Via Archon API

```bash
# Full quality scan
curl -X POST http://localhost:8181/api/quality/full-scan \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3000"}'

# Performance audit only
curl -X POST http://localhost:8181/api/quality/performance \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3000"}'

# Responsive test
curl -X POST http://localhost:8181/api/quality/responsive \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3000", "breakpoints": [375, 768, 1920]}'
```

---

## 📋 Report Generation Commands

### Standard Quality Report

```
Generate quality report and save to docs/quality-reports/[date]-report.md:

Format:
- Executive summary with overall score
- Section-by-section scores
- Performance metrics with pass/fail
- Issue list (prioritized)
- Specific recommendations
- Next steps checklist
```

### Performance Report

```
Generate performance report and save to docs/performance-reports/[date]-perf.md:

Include:
- All Core Web Vitals
- Waterfall analysis
- Main thread breakdown
- Bundle size analysis
- Image optimization opportunities
- Top 5 performance recommendations
```

### Responsive Design Report

```
Generate responsive design report with screenshots:

Include:
- Mobile (375px) screenshot and analysis
- Tablet (768px) screenshot and analysis
- Desktop (1920px) screenshot and analysis
- Layout issues at each breakpoint
- Touch target analysis
- Recommendations
```

### Accessibility Report

```
Generate accessibility report:

Include:
- Lighthouse accessibility score
- WCAG 2.1 compliance level
- ARIA label issues
- Color contrast issues
- Keyboard navigation issues
- Screen reader issues
- Specific fixes needed
```

---

## 🔧 Troubleshooting Commands

### Verify MCP Connection

```
Check MCP status: List all available MCP servers and verify
chrome-devtools is active and responding.
```

### Test Chrome Launch

```
Test Chrome DevTools MCP: Launch Chrome, navigate to https://example.com,
take a screenshot, and report success or failure.
```

### Clear Cache Test

```
Performance test with cache cleared:
1. Clear browser cache
2. Record performance trace
3. Report fresh load metrics
```

---

## 💡 Pro Tips

### Save Time with Shortcuts

Create saved prompts in your notes:
- **"QV"** = Quick quality check
- **"FULL"** = Full quality scan
- **"PERF"** = Performance audit
- **"RESP"** = Responsive test
- **"FORM"** = Form validation

### Chain Commands

```
Run this sequence:
1. Full quality scan
2. If overall score < 8.0, list top 3 issues
3. For each issue, provide specific fix
4. After I apply fixes, re-scan
5. Generate before/after comparison report
```

### Automated Daily Check

```
Daily quality check:
1. Navigate to localhost:3000
2. Quick quality check (1-10 score)
3. If score dropped since yesterday, identify what changed
4. Report any new console errors
5. Quick performance metrics check
```

---

## 📚 Genesis Workflow Integration

### Pre-Commit Validation

```
Pre-commit quality check:
1. Run quick quality scan
2. If score < 8.0, block commit
3. List issues that must be fixed
4. Re-scan after fixes
```

### Pre-Deployment Gate

```
Pre-deployment validation:
1. Run full quality scan
2. Verify overall score ≥ 8.0 (landing page) or ≥ 8.5 (SaaS)
3. Verify all Core Web Vitals pass
4. Verify no high-priority issues
5. Verify accessibility score ≥ 90
6. Generate deployment readiness report
```

### Post-Deployment Monitoring

```
Post-deployment check:
1. Run quality scan on production URL
2. Compare to pre-deployment scores
3. Report any degradation
4. Monitor for 24 hours
5. Generate stability report
```

---

## 🎯 Your Most Common Commands

**Copy these to your notes for instant access**:

### Daily Commands

```bash
# Quick Check
Quick quality check: score 1-10, list top 3 issues

# Full Scan
Run comprehensive quality validation with full report

# Performance
Performance audit: metrics + top 3 optimizations

# Responsive
Responsive test: mobile, tablet, desktop

# Form Test
Test contact form submission and validation
```

### Weekly Commands

```bash
# Progress Tracking
Generate weekly quality progress report

# Trend Analysis
Show quality score trends for past 7 days

# Issue Tracking
List unresolved issues from previous scans
```

### Before Deployment

```bash
# Pre-Deployment Gate
Run full quality scan and verify all standards met

# Cross-Browser Test
Test in Chrome, Firefox, and Safari (if available)

# Performance Baseline
Record performance metrics for production monitoring
```

---

## 📖 Command Categories Summary

| Category | Commands | Use Case |
|----------|----------|----------|
| **Core** | 7 commands | Daily validation |
| **Section-Specific** | 6 commands | Component testing |
| **Investigation** | 4 commands | Debug specific issues |
| **Tracking** | 2 commands | Monitor progress |
| **BMAD Agents** | 4 commands | Automated workflows |
| **Archon** | 2 methods | Centralized testing |
| **Reports** | 4 commands | Documentation |
| **Troubleshooting** | 3 commands | Fix MCP issues |

---

## 🔗 Related Documentation

**Genesis Quality Validation**:
- [Chrome DevTools MCP Integration](CHROME_DEVTOOLS_MCP.md)
- [Quality Standards](QUALITY_STANDARDS.md)
- [Browser Automation Guide](BROWSER_AUTOMATION_GUIDE.md)
- [Validation Templates](QUALITY_VALIDATION_TEMPLATES.md)

**Project Resources**:
- [Phase 2 Complete](../PHASE_2_COMPLETE.md)
- [Claude Code Integration](../CLAUDE_CODE_INTEGRATION.md)
- [Genesis Agents MCP](../genesis-agents-mcp/README.md)

**Quick Links**:
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp
- Archon Dashboard: http://localhost:3737/quality (when Archon is running)
- Model Context Protocol: https://modelcontextprotocol.io

---

## 🚀 Quick Start Workflow

**First Time Setup:**
```bash
# 1. Install Chrome DevTools MCP
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest

# 2. Verify installation
claude mcp list

# 3. Start your project
cd ~/your-project
npm run dev

# 4. Run first quality scan
Quick quality check: score localhost:3000
```

**Daily Workflow:**
```bash
# Morning: Check project health
Quick quality check: score localhost:3000

# After changes: Validate
Run comprehensive quality validation

# Before commit: Gate check
Pre-commit quality check with score threshold 8.0

# End of day: Track progress
Generate daily quality report
```

**Pre-Deployment:**
```bash
# 1. Full scan
Run comprehensive quality validation

# 2. Verify standards
Check: overall ≥ 8.0, performance ≥ 8.5, accessibility ≥ 90

# 3. Generate report
Save pre-deployment quality report

# 4. Deploy if passed
If all checks pass, proceed with deployment
```

---

## 📝 Notes & Best Practices

### Command Formatting

- **Be specific**: Always include URL (e.g., localhost:3000)
- **Set context**: Specify which section if validating components
- **Request format**: Ask for structured reports when needed
- **Save reports**: Always save reports to docs/quality-reports/

### Interpreting Results

**Quality Scores:**
- **9.0-10.0**: Excellent - deploy with confidence
- **8.0-8.9**: Good - deploy with minor notes
- **7.0-7.9**: Acceptable - fix before deployment
- **< 7.0**: Not ready - significant issues

**Performance Metrics:**
- **LCP < 2.5s**: Good
- **CLS < 0.1**: Good
- **FID < 100ms**: Good

**Priority Levels:**
- **High**: Must fix before deployment
- **Medium**: Fix in next sprint
- **Low**: Enhancement for future

### Common Pitfalls

❌ **Don't**: Run scans on external URLs without permission
❌ **Don't**: Skip baseline scans before making changes
❌ **Don't**: Ignore accessibility issues
❌ **Don't**: Deploy with score < 8.0

✅ **Do**: Clear cache between performance tests
✅ **Do**: Test on localhost first
✅ **Do**: Save all quality reports
✅ **Do**: Track scores over time

---

## 🎓 Learning Resources

### Understanding Metrics

**LCP (Largest Contentful Paint)**:
- Measures: Time for largest visible element to render
- Target: < 2.5s
- Common causes: Large images, slow server response

**CLS (Cumulative Layout Shift)**:
- Measures: Visual stability during load
- Target: < 0.1
- Common causes: Images without dimensions, web fonts

**FID/INP (Interaction to Next Paint)**:
- Measures: Responsiveness to user interactions
- Target: < 100ms
- Common causes: Long JavaScript tasks, blocking main thread

### WCAG 2.1 Quick Reference

**Level AA Requirements:**
- Color contrast: ≥ 4.5:1 (normal text)
- All images have alt text
- All forms have labels
- Keyboard navigation works
- Focus indicators visible

---

**Keep this card handy!** These commands will become your daily workflow for maintaining high-quality Genesis projects.

**Pro Tip**: Bookmark this file in your browser or add to your IDE for instant access during development.

---

**Status**: Ready for Use
**Last Updated**: 2025-10-16
**Version**: 1.0
**Maintainer**: Project Genesis Team
