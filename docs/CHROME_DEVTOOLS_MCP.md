# Chrome DevTools MCP Integration

## Overview

Chrome DevTools MCP enables live browser inspection, debugging, and quality validation for Project Genesis projects. This integration brings automated browser testing and quality assurance into the Genesis workflow.

**Integration Layers:**
1. **Direct MCP Access** - Use Chrome DevTools directly in Claude Code
2. **Archon Integration** - Centralized browser automation via Archon OS
3. **BMAD Agents** - AI agents with browser validation capabilities

## Why Chrome DevTools MCP?

### Benefits
- **Live Inspection**: Real browser debugging during development
- **Quality Validation**: Automated quality checks with scoring
- **Performance Analysis**: Core Web Vitals and performance metrics
- **Responsive Testing**: Multi-breakpoint validation
- **Accessibility Audit**: WCAG compliance checking
- **Console Monitoring**: Real-time error detection

### Use Cases
- Validate Genesis landing pages before deployment
- Debug layout issues in real-time
- Performance optimization analysis
- Automated quality assurance
- Cross-breakpoint responsive testing
- Form functionality validation

## Installation

### Prerequisites
- Node.js 22+
- Chrome browser
- Claude Code with MCP support

### Install Chrome DevTools MCP

```bash
# Add Chrome DevTools MCP to Claude Code
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest

# Verify installation
claude mcp list
```

**Expected Output:**
```
chrome-devtools:
  command: npx
  args: ['chrome-devtools-mcp@latest']
  status: ready
```

### Configuration

Claude Code MCP configuration (`~/.claude-code/mcp-settings.json`):

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"],
      "timeout": 30000
    }
  }
}
```

## Basic Usage

### 1. Navigation and Inspection

```
Navigate to localhost:3000 and inspect the hero section.
Check layout, styling, and console for errors.
```

**Claude Code will:**
1. Start dev server if needed
2. Launch Chrome browser
3. Navigate to specified URL
4. Inspect DOM structure
5. Report findings

### 2. Performance Analysis

```
Record a performance trace of the full page load and report:
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- FID/INP (First Input Delay / Interaction to Next Paint)
```

### 3. Responsive Testing

```
Test responsive design at these breakpoints:
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1920px width

Report any layout issues or horizontal scrolling.
```

### 4. Form Validation

```
Test the contact form:
1. Fill all fields with test data
2. Submit the form
3. Verify submission handling
4. Test validation (empty fields, invalid email)
5. Check error messages display correctly
```

### 5. Console Error Detection

```
Navigate to localhost:3000 and check console for:
- JavaScript errors
- Failed network requests
- CORS issues
- Missing resources
```

## Genesis Quality Validation Workflow

### Full Quality Check Template

Use this comprehensive template for Genesis project validation:

```
Quality validation for Genesis project at localhost:3000:

NAVIGATION:
- Navigate to localhost:3000
- Wait for full page load

VISUAL INSPECTION:
Hero Section:
- Check layout and spacing
- Verify CTA buttons visible and styled
- Test image/video loading
- Verify text contrast and readability

Features/Services Section:
- Verify all cards render properly
- Check icon loading
- Test hover states
- Verify grid/flex layout

Testimonials (if present):
- Check image loading
- Verify layout consistency
- Test responsive behavior

Contact Form:
- Verify all fields visible
- Check proper styling
- Test label associations
- Verify button styling

Footer:
- Check all links
- Verify information display
- Test responsive layout

FUNCTIONALITY:
- Test contact form submission (use test data)
- Click all CTA buttons (verify clickability)
- Test navigation menu (if present)
- Verify phone/email links work (mailto/tel)

RESPONSIVE DESIGN:
Test at mobile (375px):
- Check for horizontal scrolling
- Verify touch target sizes ≥ 44px
- Test navigation collapse/expand
- Verify text readability

Test at tablet (768px):
- Check layout adaptation
- Verify spacing adjustments
- Test all interactions

Test at desktop (1920px):
- Verify max-width containers
- Check whitespace balance
- Test all hover states

PERFORMANCE:
- Record full page load trace
- Report LCP (target: < 2.5s)
- Report CLS (target: < 0.1)
- Report FID/INP (target: < 100ms)
- Identify top 3 performance bottlenecks

ERRORS:
- Check console for JavaScript errors
- Check for failed network requests
- Report any CORS issues
- Check for missing resources

OUTPUT:
Generate a quality report with:
- Overall score (1-10)
- Section-by-section scores
- List of issues found (prioritized High/Medium/Low)
- Specific recommendations for fixes
- Performance metrics comparison to targets
```

### Quality Score Calculation

**Overall Score (1-10):**
```
Overall Score = (Visual × 0.25) + (Functionality × 0.25) +
                (Performance × 0.25) + (Accessibility × 0.15) +
                (Responsive × 0.10)
```

**Section Scoring Criteria:**

**Visual Quality (1-10):**
- 10: Perfect layout, styling, and design consistency
- 8-9: Minor spacing or styling inconsistencies
- 6-7: Noticeable layout issues
- 4-5: Significant visual problems
- 1-3: Broken layout or major issues

**Functionality (1-10):**
- 10: All features work perfectly
- 8-9: Minor functional issues
- 6-7: Some features not working
- 4-5: Significant functionality broken
- 1-3: Critical features failing

**Performance (1-10):**
- 10: All Core Web Vitals pass (LCP < 2.5s, CLS < 0.1, FID < 100ms)
- 8-9: One metric slightly exceeds target
- 6-7: Two metrics exceed targets
- 4-5: All metrics fail but page usable
- 1-3: Severe performance issues

**Accessibility (1-10):**
- 10: WCAG AA compliant, score ≥ 90
- 8-9: Minor accessibility issues
- 6-7: Several accessibility problems
- 4-5: Significant accessibility barriers
- 1-3: Critical accessibility failures

**Responsive Design (1-10):**
- 10: Perfect across all breakpoints
- 8-9: Minor layout adjustments needed
- 6-7: Noticeable issues at some breakpoints
- 4-5: Significant responsive problems
- 1-3: Broken on mobile or tablet

## Usage Patterns

### Pattern 1: Pre-Deployment Validation

```
Pre-deployment quality gate for Genesis project:

1. Run full quality scan
2. Verify overall score ≥ 8.0/10
3. Check all Core Web Vitals pass
4. Verify no high-priority issues
5. Generate deployment report

If score < 8.0, do not deploy. Fix high-priority issues first.
```

### Pattern 2: Performance Optimization

```
Performance optimization workflow:

1. Record performance trace
2. Identify bottlenecks:
   - Largest contentful paint elements
   - Layout shift causes
   - Long blocking tasks
3. Apply optimizations:
   - Image optimization
   - Code splitting
   - Lazy loading
4. Re-test and verify improvements
```

### Pattern 3: Responsive Design Validation

```
Comprehensive responsive testing:

1. Test at 375px (mobile):
   - No horizontal scroll
   - Touch targets ≥ 44px
   - Text readable (≥ 16px)
   - Navigation accessible

2. Test at 768px (tablet):
   - Layout adapts properly
   - Images scale correctly
   - Spacing appropriate

3. Test at 1920px (desktop):
   - Max-width containers work
   - Whitespace balanced
   - No excessive stretching

Report any breakpoint-specific issues.
```

### Pattern 4: Form Validation Testing

```
Comprehensive form testing:

1. Test valid submission:
   - Fill all fields with valid data
   - Submit form
   - Verify success message
   - Check data received

2. Test validation:
   - Submit empty form (check required field errors)
   - Submit invalid email (check email validation)
   - Submit invalid phone (check phone validation)
   - Verify error messages display correctly

3. Test edge cases:
   - Very long inputs
   - Special characters
   - Copy/paste behavior
   - Tab navigation
```

### Pattern 5: Accessibility Audit

```
Accessibility validation:

1. Lighthouse accessibility scan
2. Check WCAG 2.1 Level AA compliance:
   - Color contrast ratios ≥ 4.5:1
   - All images have alt text
   - All forms have labels
   - Keyboard navigation works
   - Focus indicators visible
   - ARIA attributes correct

3. Screen reader testing:
   - Headings hierarchical
   - Landmarks properly labeled
   - Forms describable
   - Buttons clearly labeled

Report accessibility score and issues found.
```

## Integration with Genesis Agents

### Victoria Validator Enhancement

Victoria can use Chrome DevTools for enhanced validation:

```
Victoria Validator, using Chrome DevTools:
1. Navigate to localhost:3000
2. Validate the hero section:
   - Check layout compliance
   - Verify responsive behavior
   - Test CTA functionality
3. Score the section 1-10
4. Provide specific recommendations
```

### Elena Execution with Verification

Elena can apply fixes and verify with browser:

```
Elena Execution workflow:
1. Apply responsive fix to hero section
2. Use Chrome DevTools to verify:
   - Test at 375px width
   - Check for horizontal scroll
   - Verify touch target sizes
3. If issue persists, try alternative fix
4. Re-test until resolved
```

### QA Agent Integration

Dedicated QA agent for comprehensive testing:

```
QA Agent, run full quality scan:
1. Visual inspection (all sections)
2. Functionality testing (all interactive elements)
3. Performance analysis (Core Web Vitals)
4. Accessibility audit (WCAG AA)
5. Responsive testing (3 breakpoints)
6. Generate comprehensive quality report
```

## Quality Report Template

```markdown
# Quality Report: [Project Name]
**Date**: [YYYY-MM-DD]
**URL**: localhost:3000
**Overall Score**: [X.X]/10

## Section Scores
- Hero Section: [X.X]/10
- Features/Services: [X.X]/10
- Testimonials: [X.X]/10
- Contact Form: [X.X]/10
- Footer: [X.X]/10

## Performance Metrics
| Metric | Actual | Target | Status |
|--------|--------|--------|--------|
| LCP | [X.X]s | < 2.5s | ✅/❌ |
| CLS | [X.XX] | < 0.1 | ✅/❌ |
| FID/INP | [X]ms | < 100ms | ✅/❌ |

## Issues Found

### High Priority
1. [Description of issue]
   - **Impact**: [How this affects users]
   - **Recommendation**: [Specific fix to apply]

### Medium Priority
1. [Description of issue]
   - **Impact**: [How this affects users]
   - **Recommendation**: [Specific fix to apply]

### Low Priority
1. [Description of issue]
   - **Impact**: [How this affects users]
   - **Recommendation**: [Specific fix to apply]

## Responsive Design
- **Mobile (375px)**: [PASS/FAIL] - [Issues if any]
- **Tablet (768px)**: [PASS/FAIL] - [Issues if any]
- **Desktop (1920px)**: [PASS/FAIL] - [Issues if any]

## Console Errors
- [List JavaScript errors]
- [List network failures]
- [List CORS issues]

## Accessibility
- **Lighthouse Score**: [X]/100
- **WCAG Compliance**: [AA/AAA/Fails]
- **Issues**: [List accessibility issues]

## Recommendations

### Immediate Actions (Before Deployment)
- [ ] [Fix 1]
- [ ] [Fix 2]
- [ ] [Fix 3]

### Future Enhancements
- [ ] [Enhancement 1]
- [ ] [Enhancement 2]

## Next Steps
1. [Action item 1]
2. [Action item 2]
3. [Re-run quality scan after fixes]
```

## Best Practices

### ✅ Do
1. **Run tests on localhost first** before staging/production
2. **Use test data** for form submissions
3. **Clear cache** between performance tests for accuracy
4. **Test isolated** use `--isolated` flag for clean environment
5. **Document findings** save reports for tracking improvements
6. **Re-test after fixes** verify improvements with new scan
7. **Track scores over time** monitor quality trends

### ❌ Don't
1. **Don't test with real user data** use test/dummy data only
2. **Don't skip baseline tests** establish baseline before changes
3. **Don't ignore low scores** address issues before deploying
4. **Don't test production directly** use staging environments
5. **Don't dismiss warnings** investigate all console warnings
6. **Don't test once** run multiple tests for consistency

## Troubleshooting

### Chrome Won't Launch

```bash
# Check Chrome installation
which google-chrome
google-chrome --version

# Try manual launch with debugging
google-chrome --remote-debugging-port=9222

# Check for conflicting Chrome instances
pkill chrome
```

### Connection Timeout

```json
// Increase timeout in ~/.claude-code/mcp-settings.json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"],
      "timeout": 60000  // 60 seconds
    }
  }
}
```

### Performance Metrics Inconsistent

**Solutions:**
1. Clear browser cache before each test
2. Use incognito/isolated browser profile
3. Close background apps/tabs
4. Run multiple tests and average results
5. Check for network throttling settings

### MCP Server Not Responding

```bash
# Verify MCP server
claude mcp list

# Check MCP logs
export DEBUG=*
claude mcp list

# Restart Claude Code
exit
claude
```

## Advanced Usage

### Custom Performance Budgets

```
Performance validation with custom budgets:

1. Record performance trace
2. Check against budgets:
   - LCP < 2.0s (stricter than default 2.5s)
   - CLS < 0.05 (stricter than default 0.1)
   - FID < 50ms (stricter than default 100ms)
   - Bundle size < 200KB
   - Time to Interactive < 3.0s

Report any metrics exceeding custom budgets.
```

### Visual Regression Testing

```
Visual regression workflow:

1. Capture baseline screenshots:
   - Desktop: 1920px width
   - Tablet: 768px width
   - Mobile: 375px width

2. After changes, capture new screenshots

3. Compare screenshots and report:
   - Any layout differences
   - Spacing changes
   - Color/styling differences
   - Elements that moved

4. Approve or reject changes
```

### Automated Testing in CI/CD

Integration with GitHub Actions:

```yaml
name: Quality Gate

on: [pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm install

      - name: Start dev server
        run: npm run dev &

      - name: Run quality scan
        run: |
          npx chrome-devtools-mcp@latest \
            --url http://localhost:3000 \
            --quality-threshold 8.0

      - name: Fail if quality < 8.0
        run: exit 1  # if quality check fails
```

## Genesis Quality Standards

### Minimum Deployment Standards

**Landing Pages:**
- Overall Score: ≥ 8.0/10
- Performance Score: ≥ 8.5/10
- No High-Priority Issues
- All Core Web Vitals Pass

**SaaS Applications:**
- Overall Score: ≥ 8.5/10
- Performance Score: ≥ 8.0/10
- Security Score: ≥ 9.0/10
- Accessibility: ≥ 90

### Quality Score Targets

| Score Range | Status | Action |
|-------------|--------|--------|
| 9.0-10.0 | Excellent | Deploy with confidence |
| 8.0-8.9 | Good | Deploy with minor notes |
| 7.0-7.9 | Acceptable | Fix before deployment |
| 6.0-6.9 | Needs Work | Significant fixes required |
| < 6.0 | Not Ready | Major issues, do not deploy |

## Related Documentation

- **[Quality Standards](QUALITY_STANDARDS.md)** - Detailed quality criteria
- **[Browser Automation Guide](BROWSER_AUTOMATION_GUIDE.md)** - Complete implementation
- **[Validation Templates](QUALITY_VALIDATION_TEMPLATES.md)** - Reusable templates
- **[Claude Code Integration](../CLAUDE_CODE_INTEGRATION.md)** - Genesis MCP integration

## Resources

### Official Documentation
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

### Genesis Resources
- [Scout-Plan-Build Workflow](PHASE_1_COMPLETE.md)
- [Phase 2 Agents](../PHASE_2_COMPLETE.md)
- [MCP Server Integration](../genesis-agents-mcp/README.md)

---

**Status**: Ready for Integration
**Last Updated**: 2025-10-16
**Maintainer**: Project Genesis Team
