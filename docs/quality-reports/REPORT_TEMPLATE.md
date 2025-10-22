# Quality Report: [Project Name]

**Date**: YYYY-MM-DD
**URL**: localhost:3000
**Report Type**: [Baseline / Daily / Pre-Deployment / Post-Deployment]
**Tester**: [Name or "Claude Code + Chrome DevTools MCP"]

---

## Executive Summary

**Overall Score**: X.X/10
**Status**: [Excellent / Good / Acceptable / Needs Work / Not Ready]
**Deployment Ready**: [Yes / No]

**Key Findings**:
- [Brief summary of major findings]
- [Overall quality assessment]
- [Deployment recommendation]

---

## Section Scores

| Section | Score | Status | Notes |
|---------|-------|--------|-------|
| Hero Section | X.X/10 | [Pass/Fail] | [Brief notes] |
| Features/Services | X.X/10 | [Pass/Fail] | [Brief notes] |
| Testimonials | X.X/10 | [Pass/Fail] | [Brief notes] |
| Contact Form | X.X/10 | [Pass/Fail] | [Brief notes] |
| Footer | X.X/10 | [Pass/Fail] | [Brief notes] |

**Dimension Scores**:
- Visual Quality: X.X/10 (Weight: 25%)
- Functionality: X.X/10 (Weight: 25%)
- Performance: X.X/10 (Weight: 25%)
- Accessibility: X.X/10 (Weight: 15%)
- Responsive Design: X.X/10 (Weight: 10%)

---

## Performance Metrics

### Core Web Vitals

| Metric | Actual | Target | Status | Notes |
|--------|--------|--------|--------|-------|
| LCP (Largest Contentful Paint) | X.Xs | < 2.5s | ✅/❌ | [Element causing LCP] |
| CLS (Cumulative Layout Shift) | X.XX | < 0.1 | ✅/❌ | [Elements causing shift] |
| FID/INP (Interaction to Next Paint) | Xms | < 100ms | ✅/❌ | [Interaction tested] |

### Additional Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint (FCP) | X.Xs | < 1.8s | ✅/❌ |
| Time to Interactive (TTI) | X.Xs | < 3.5s | ✅/❌ |
| Total Blocking Time (TBT) | Xms | < 200ms | ✅/❌ |
| Speed Index | X.X | < 3.4s | ✅/❌ |

### Resource Analysis

**JavaScript**:
- Total size: XKB (gzipped)
- Largest file: [filename] (XKB)
- Unused JS: XKB (X%)

**CSS**:
- Total size: XKB (gzipped)
- Unused CSS: XKB (X%)

**Images**:
- Total size: XKB
- Largest image: [filename] (XKB)
- Images not optimized: X

---

## Responsive Design

### Mobile (375px)
- **Status**: [Pass / Fail]
- **Horizontal Scrolling**: [Yes / No]
- **Touch Targets**: [All ≥ 44px / Some < 44px]
- **Text Readability**: [All ≥ 16px / Some < 16px]
- **Issues**:
  - [List any mobile-specific issues]

### Tablet (768px)
- **Status**: [Pass / Fail]
- **Layout Adaptation**: [Good / Needs Work]
- **Spacing**: [Appropriate / Needs Adjustment]
- **Issues**:
  - [List any tablet-specific issues]

### Desktop (1920px)
- **Status**: [Pass / Fail]
- **Max-Width Containers**: [Present / Missing]
- **Whitespace Balance**: [Good / Needs Work]
- **Issues**:
  - [List any desktop-specific issues]

---

## Accessibility

**Lighthouse Score**: X/100
**WCAG Compliance**: [AA / Below AA / AAA]

### Checklist

- [x] All images have alt text
- [x] All forms have labels
- [x] Color contrast ≥ 4.5:1
- [x] Keyboard navigation works
- [x] Focus indicators visible
- [x] Heading hierarchy correct
- [x] ARIA attributes correct
- [x] No keyboard traps

### Issues Found

**High Priority**:
1. [Issue]: [Description]
   - **WCAG Criterion**: [X.X.X]
   - **Impact**: [Who is affected and how]
   - **Fix**: [Specific remediation steps]

**Medium Priority**:
1. [Issue]
2. [Issue]

**Low Priority**:
1. [Issue]
2. [Issue]

---

## Console & Network

### JavaScript Errors
```
[List all console errors, or "None" if clean]
```

### Network Failures
```
[List all failed requests, or "None" if clean]
```

### Warnings
```
[List warnings, or "None" if clean]
```

### CORS Issues
```
[List CORS issues, or "None" if clean]
```

---

## Issues Found

### High Priority (Must Fix Before Deployment)

1. **[Issue Title]**
   - **Location**: [Section / Component / Selector]
   - **Description**: [Detailed description of the issue]
   - **Impact**: [How this affects users]
   - **Recommendation**: [Specific fix to apply]
   - **Effort**: [Low / Medium / High]

### Medium Priority (Fix Soon After Deployment)

1. **[Issue Title]**
   - **Location**: [Section / Component / Selector]
   - **Description**: [Detailed description]
   - **Impact**: [How this affects users]
   - **Recommendation**: [Specific fix]
   - **Effort**: [Low / Medium / High]

### Low Priority (Future Enhancement)

1. **[Issue Title]**
   - **Description**: [Brief description]
   - **Recommendation**: [Suggested improvement]

---

## Recommendations

### Immediate Actions (Before Deployment)

- [ ] **Fix #1**: [Specific action with selector/file]
  - Priority: High
  - Estimated time: [X minutes]
  - Expected impact: [Score improvement]

- [ ] **Fix #2**: [Specific action]
  - Priority: High
  - Estimated time: [X minutes]
  - Expected impact: [Score improvement]

- [ ] **Fix #3**: [Specific action]
  - Priority: High
  - Estimated time: [X minutes]
  - Expected impact: [Score improvement]

### Future Enhancements

- [ ] **Enhancement #1**: [Specific improvement]
  - Priority: Low
  - Estimated time: [X hours]
  - Expected impact: [Benefit]

- [ ] **Enhancement #2**: [Specific improvement]

---

## Comparison to Previous Report

*(Include only if comparing to previous report)*

### Score Changes

| Dimension | Previous | Current | Change |
|-----------|----------|---------|--------|
| Overall | X.X | X.X | +/- X.X |
| Visual | X.X | X.X | +/- X.X |
| Functionality | X.X | X.X | +/- X.X |
| Performance | X.X | X.X | +/- X.X |
| Accessibility | X.X | X.X | +/- X.X |
| Responsive | X.X | X.X | +/- X.X |

### Issues Resolved
- [List issues fixed since last report]

### New Issues
- [List new issues found]

### Performance Changes
- LCP: X.Xs → X.Xs ([Improved / Degraded] by X.Xs)
- CLS: X.XX → X.XX ([Improved / Degraded] by X.XX)
- FID: Xms → Xms ([Improved / Degraded] by Xms)

---

## Next Steps

### For Developer

1. **[Action Item]**: [Specific task]
   - Expected time: [X minutes/hours]
   - Priority: [High / Medium / Low]

2. **[Action Item]**: [Specific task]
   - Expected time: [X minutes/hours]
   - Priority: [High / Medium / Low]

3. **Re-scan**: After applying fixes, run new quality scan

### For Team

- Review high-priority issues in team meeting
- Assign fixes to team members
- Schedule re-scan for [date]
- Plan deployment after score ≥ 8.0

---

## Testing Methodology

**Tools Used**:
- Chrome DevTools MCP
- Lighthouse (via Chrome DevTools)
- Manual testing

**Test Environment**:
- Browser: Chrome [version]
- Viewport sizes: 375px, 768px, 1920px
- Network: [Throttled / Fast 3G / No throttling]
- Cache: [Cleared / Enabled]

**Test Data**:
- Contact Form: Test user data (name: "Test User", email: "test@example.com")
- No real user data used

---

## Deployment Readiness

### Landing Page Standards
- [ ] Overall score ≥ 8.0/10: [Current: X.X]
- [ ] Performance score ≥ 8.5/10: [Current: X.X]
- [ ] Accessibility score ≥ 90: [Current: X]
- [ ] No high-priority issues: [Current: X issues]
- [ ] All Core Web Vitals pass: [LCP / CLS / FID]

### SaaS App Standards
- [ ] Overall score ≥ 8.5/10: [Current: X.X]
- [ ] Performance score ≥ 8.0/10: [Current: X.X]
- [ ] Security score ≥ 9.0/10: [Current: X.X]
- [ ] Accessibility score ≥ 90: [Current: X]
- [ ] All Core Web Vitals pass: [LCP / CLS / FID]

### Deployment Decision

**Recommendation**: [DEPLOY / DO NOT DEPLOY / DEPLOY WITH NOTES]

**Reasoning**: [Explain deployment decision based on scores and standards]

---

## Attachments

*(Optional: Include links to screenshots, performance traces, etc.)*

- Performance trace: [Link or path]
- Screenshots: [Link or path]
- Lighthouse report: [Link or path]

---

## Report Metadata

**Generated By**: Claude Code + Chrome DevTools MCP
**Report Version**: 1.0
**Quality Standards**: Project Genesis v1.0
**Report Duration**: [X minutes]

---

**End of Report**
