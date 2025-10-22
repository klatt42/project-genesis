# Project Genesis Quality Standards

## Overview

This document defines the quality standards, validation criteria, and acceptance thresholds for Project Genesis projects. These standards ensure consistent, high-quality deliverables across landing pages and SaaS applications.

## Quality Scoring System

### Overall Score Calculation

The overall quality score is a weighted average of five dimensions:

```
Overall Score = (Visual Quality × 0.25) + (Functionality × 0.25) +
                (Performance × 0.25) + (Accessibility × 0.15) +
                (Responsive Design × 0.10)
```

**Score Scale**: 1.0 to 10.0 (one decimal place)

### Score Interpretation

| Score Range | Status | Description | Action |
|-------------|--------|-------------|--------|
| 9.0-10.0 | Excellent | Production-ready, exceptional quality | Deploy immediately |
| 8.0-8.9 | Good | Production-ready, minor improvements possible | Deploy with notes |
| 7.0-7.9 | Acceptable | Functional but needs improvements | Fix before deploy |
| 6.0-6.9 | Needs Work | Significant issues present | Major fixes required |
| < 6.0 | Not Ready | Critical issues, not production-ready | Do not deploy |

## Dimension-Specific Standards

### 1. Visual Quality (Weight: 25%)

**Scoring Criteria:**

**10 Points - Excellent:**
- Perfect layout consistency across all sections
- Professional typography and spacing
- Cohesive color scheme and branding
- High-quality images properly optimized
- No visual artifacts or glitches
- Animations smooth and purposeful

**8-9 Points - Good:**
- Minor spacing inconsistencies (1-2 issues)
- Occasional alignment issues
- One or two images could be better optimized
- Generally professional appearance

**6-7 Points - Acceptable:**
- Noticeable layout inconsistencies
- Several spacing/alignment issues
- Image quality issues in multiple places
- Color scheme lacks cohesion

**4-5 Points - Needs Work:**
- Significant layout problems
- Poor typography choices
- Inconsistent spacing throughout
- Multiple visual artifacts

**1-3 Points - Not Ready:**
- Broken layouts
- Major visual glitches
- Unprofessional appearance
- Critical rendering issues

**Validation Checklist:**
- [ ] Consistent spacing (use design system scales)
- [ ] Proper typography hierarchy
- [ ] Color contrast meets WCAG standards
- [ ] Images optimized (WebP, proper dimensions)
- [ ] No layout shifts during load
- [ ] Hover states defined for interactive elements
- [ ] Focus states visible for accessibility
- [ ] Animations add value, not distraction

### 2. Functionality (Weight: 25%)

**Scoring Criteria:**

**10 Points - Excellent:**
- All features work flawlessly
- Forms validate properly
- All links functional
- Error handling comprehensive
- Loading states implemented
- User feedback clear
- No console errors

**8-9 Points - Good:**
- One minor functional issue
- Forms work with minor validation gaps
- Occasional missing feedback
- 1-2 console warnings (not errors)

**6-7 Points - Acceptable:**
- Several features with minor issues
- Form validation incomplete
- Some links broken
- Limited error handling
- 3-5 console errors

**4-5 Points - Needs Work:**
- Multiple features not working properly
- Forms partially functional
- Many broken links
- Poor error handling
- Significant console errors

**1-3 Points - Not Ready:**
- Critical features broken
- Forms don't work
- Site largely non-functional
- Severe errors preventing use

**Validation Checklist:**
- [ ] Contact form submits successfully
- [ ] Form validation works (required fields, email format)
- [ ] All CTA buttons clickable and functional
- [ ] Navigation works (if present)
- [ ] Links open correctly (internal/external)
- [ ] Phone/email links work (tel:/mailto:)
- [ ] No JavaScript errors in console
- [ ] Loading states show for async operations
- [ ] Error messages clear and helpful
- [ ] Success messages confirm actions

### 3. Performance (Weight: 25%)

**Core Web Vitals Targets:**

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| FID/INP (Interaction to Next Paint) | < 100ms | 100ms - 300ms | > 300ms |

**Scoring Criteria:**

**10 Points - Excellent:**
- All Core Web Vitals in "Good" range
- First Contentful Paint < 1.8s
- Time to Interactive < 3.5s
- Total bundle size < 200KB (gzipped)
- No render-blocking resources

**8-9 Points - Good:**
- One metric in "Needs Improvement"
- Other metrics in "Good" range
- Minor optimization opportunities

**6-7 Points - Acceptable:**
- Two metrics in "Needs Improvement"
- Or one metric in "Poor"
- Multiple optimization opportunities

**4-5 Points - Needs Work:**
- Two metrics in "Poor"
- Significant performance issues
- Bundle size > 500KB

**1-3 Points - Not Ready:**
- All metrics in "Poor"
- Site barely usable
- Critical performance problems

**Additional Performance Targets:**

| Metric | Target | Method |
|--------|--------|--------|
| First Contentful Paint (FCP) | < 1.8s | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Total Blocking Time (TBT) | < 200ms | Lighthouse |
| Speed Index | < 3.4s | Lighthouse |
| Bundle Size (JS) | < 200KB gzipped | Build analysis |
| Bundle Size (CSS) | < 50KB gzipped | Build analysis |

**Validation Checklist:**
- [ ] All Core Web Vitals pass
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting implemented
- [ ] CSS minimized and optimized
- [ ] JavaScript minimized and tree-shaken
- [ ] Fonts optimized (subset, preload)
- [ ] No unused CSS/JS
- [ ] CDN used for static assets (if applicable)
- [ ] Compression enabled (gzip/brotli)

### 4. Accessibility (Weight: 15%)

**WCAG 2.1 Compliance Targets:**

**Level AA Minimum** (Required for 8.0+ score)

**Scoring Criteria:**

**10 Points - Excellent:**
- Lighthouse Accessibility score: 95-100
- WCAG 2.1 Level AAA compliant
- Perfect keyboard navigation
- Screen reader optimized
- No accessibility errors

**8-9 Points - Good:**
- Lighthouse Accessibility score: 90-94
- WCAG 2.1 Level AA compliant
- Minor accessibility issues
- Good keyboard navigation

**6-7 Points - Acceptable:**
- Lighthouse Accessibility score: 80-89
- WCAG Level AA with gaps
- Several accessibility issues
- Keyboard navigation works but imperfect

**4-5 Points - Needs Work:**
- Lighthouse Accessibility score: 70-79
- WCAG compliance failures
- Many accessibility barriers
- Poor keyboard navigation

**1-3 Points - Not Ready:**
- Lighthouse Accessibility score: < 70
- Critical accessibility failures
- Not usable with assistive technologies

**WCAG 2.1 Level AA Requirements:**

1. **Perceivable**
   - [ ] All images have alt text
   - [ ] Color contrast ratio ≥ 4.5:1 (normal text)
   - [ ] Color contrast ratio ≥ 3:1 (large text, UI components)
   - [ ] Content not solely reliant on color
   - [ ] Audio/video have captions

2. **Operable**
   - [ ] All functionality keyboard accessible
   - [ ] Focus order logical
   - [ ] Focus indicators visible
   - [ ] No keyboard traps
   - [ ] Skip links provided
   - [ ] Page titles descriptive

3. **Understandable**
   - [ ] Language of page identified (lang attribute)
   - [ ] Navigation consistent
   - [ ] Form labels clear
   - [ ] Error identification clear
   - [ ] Error suggestions provided

4. **Robust**
   - [ ] Valid HTML (no critical errors)
   - [ ] ARIA used correctly
   - [ ] Compatible with assistive technologies
   - [ ] Name, role, value set correctly

**Validation Checklist:**
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] Color contrast ratios meet WCAG AA
- [ ] All images have descriptive alt text
- [ ] All forms have associated labels
- [ ] Keyboard navigation functional
- [ ] Focus indicators visible
- [ ] Heading hierarchy proper (h1 → h2 → h3)
- [ ] ARIA attributes correct
- [ ] Landmarks properly labeled
- [ ] Skip to main content link present
- [ ] Form errors clearly announced
- [ ] Interactive elements have accessible names

### 5. Responsive Design (Weight: 10%)

**Breakpoint Requirements:**

| Breakpoint | Width | Device Type | Requirements |
|------------|-------|-------------|--------------|
| Mobile | 375px | Phone | No horizontal scroll, touch targets ≥ 44px |
| Tablet | 768px | Tablet | Layout adapts, spacing appropriate |
| Desktop | 1920px | Desktop | Max-width containers, whitespace balanced |

**Scoring Criteria:**

**10 Points - Excellent:**
- Perfect across all breakpoints
- Smooth transitions between breakpoints
- Touch targets optimal on mobile
- Typography scales perfectly
- Images scale appropriately

**8-9 Points - Good:**
- Minor layout adjustments needed at one breakpoint
- Generally good responsive behavior
- 1-2 minor spacing issues

**6-7 Points - Acceptable:**
- Noticeable issues at one or two breakpoints
- Some horizontal scrolling
- Touch targets too small in places
- Several spacing inconsistencies

**4-5 Points - Needs Work:**
- Significant responsive problems
- Horizontal scrolling at multiple breakpoints
- Poor mobile experience
- Many touch targets too small

**1-3 Points - Not Ready:**
- Broken on mobile or tablet
- Not usable on small screens
- Critical responsive failures

**Mobile Requirements (375px):**
- [ ] No horizontal scrolling
- [ ] Touch targets ≥ 44x44px
- [ ] Text readable (font-size ≥ 16px)
- [ ] Navigation accessible/collapsible
- [ ] Images scale to container
- [ ] Spacing appropriate for small screen
- [ ] Forms usable with mobile keyboard

**Tablet Requirements (768px):**
- [ ] Layout adapts from mobile
- [ ] Spacing increases appropriately
- [ ] Multi-column layouts work
- [ ] Images scale properly
- [ ] Navigation transitions properly

**Desktop Requirements (1920px):**
- [ ] Max-width containers prevent stretching
- [ ] Whitespace balanced
- [ ] Typography scales up
- [ ] Hover states functional
- [ ] No excessive empty space
- [ ] Images maintain quality

## Project-Specific Standards

### Landing Pages

**Minimum Deployment Thresholds:**
- **Overall Score**: ≥ 8.0/10
- **Performance Score**: ≥ 8.5/10
- **Accessibility Score**: ≥ 90 (Lighthouse)
- **No High-Priority Issues**
- **All Core Web Vitals**: Pass

**Section-Specific Requirements:**

**Hero Section:**
- Score ≥ 8.0/10
- CTA buttons clearly visible
- Headline readable and impactful
- Background image optimized
- Responsive at all breakpoints

**Features/Services:**
- Score ≥ 7.5/10
- All cards render consistently
- Icons/images load properly
- Grid layout responsive

**Contact Form:**
- Score ≥ 8.5/10
- All validation works
- Success/error messages clear
- Accessible and keyboard navigable
- Mobile-friendly

**Testimonials:**
- Score ≥ 7.5/10
- Images load properly
- Layout consistent
- Responsive design works

**Footer:**
- Score ≥ 8.0/10
- All links functional
- Contact info correct
- Responsive layout

### SaaS Applications

**Minimum Deployment Thresholds:**
- **Overall Score**: ≥ 8.5/10
- **Performance Score**: ≥ 8.0/10
- **Security Score**: ≥ 9.0/10
- **Accessibility Score**: ≥ 90 (Lighthouse)
- **No Critical Security Issues**

**Additional Requirements:**

**Authentication:**
- Secure password handling
- Session management proper
- HTTPS enforced
- CSRF protection
- XSS prevention

**Dashboard:**
- Data loads efficiently
- Real-time updates work
- Navigation intuitive
- Mobile responsive
- Error handling comprehensive

**Forms:**
- Client-side validation
- Server-side validation
- Error messages helpful
- Success feedback clear
- Accessibility compliant

**API Endpoints:**
- Proper authentication
- Rate limiting implemented
- Error responses structured
- CORS configured correctly
- Input validation thorough

## Quality Gates

### Pre-Deployment Quality Gate

Before deploying ANY Genesis project:

1. **Run Full Quality Scan**
   ```
   QA Agent, run full quality scan on localhost:3000
   ```

2. **Verify Minimum Standards**
   - Overall score ≥ threshold (8.0 for landing pages, 8.5 for SaaS)
   - All Core Web Vitals pass
   - No high-priority issues
   - Accessibility score ≥ 90

3. **Review Quality Report**
   - Read all high/medium priority issues
   - Assess impact on users
   - Determine if acceptable for deployment

4. **Make Go/No-Go Decision**
   - **GO**: All standards met, deploy
   - **NO-GO**: Fix high-priority issues, re-test

### Post-Deployment Monitoring

After deployment, monitor these metrics:

**Week 1:**
- Real User Monitoring (RUM) data
- Error rates in production
- Performance metrics from real users
- Accessibility feedback

**Week 2-4:**
- User feedback on quality
- Support tickets related to quality
- Analytics on user experience

**Monthly:**
- Re-run quality scans
- Compare to baseline
- Track quality trends
- Address degradation

## Issue Priority Classification

### High Priority (Fix Before Deployment)

**Criteria:**
- Affects core functionality
- Prevents users from completing critical tasks
- Severe performance impact
- Critical accessibility barrier
- Security vulnerability

**Examples:**
- Contact form doesn't submit
- Page unusable on mobile
- LCP > 4.0s
- Color contrast < 3:1
- Missing form labels
- XSS vulnerability

**Action**: Must fix before deployment

### Medium Priority (Fix Soon After Deployment)

**Criteria:**
- Affects secondary functionality
- Annoys users but doesn't block tasks
- Moderate performance impact
- Minor accessibility issue
- Non-critical bug

**Examples:**
- Minor layout inconsistency
- Hover state missing
- Image slightly pixelated
- Minor spacing issue
- LCP 2.5s-3.0s
- One ARIA attribute incorrect

**Action**: Fix in next sprint/update

### Low Priority (Enhancement)

**Criteria:**
- Nice-to-have improvement
- Minimal user impact
- Minor optimization opportunity
- Edge case issue
- Future enhancement

**Examples:**
- Slight animation improvement
- Minor color adjustment
- Font size optimization
- Additional whitespace
- Further performance optimization

**Action**: Backlog for future consideration

## Quality Tracking

### Baseline Establishment

When starting a project:

1. **Run Initial Quality Scan**
   - Establish baseline scores
   - Document current state
   - Identify improvement opportunities

2. **Set Quality Goals**
   - Define target scores
   - Prioritize improvements
   - Create action plan

3. **Track Progress**
   - Re-scan after changes
   - Compare to baseline
   - Document improvements

### Quality Score History

**Recommended Tracking:**

```markdown
# Quality Score History: [Project Name]

| Date | Overall | Visual | Function | Perf | A11y | Responsive | Notes |
|------|---------|--------|----------|------|------|------------|-------|
| 2025-10-01 | 6.5 | 7.0 | 6.0 | 6.5 | 7.0 | 6.5 | Baseline |
| 2025-10-08 | 7.8 | 8.0 | 7.5 | 8.0 | 8.0 | 7.5 | Form fixes |
| 2025-10-15 | 8.5 | 8.5 | 8.5 | 9.0 | 8.5 | 8.0 | Perf optimizations |
| 2025-10-22 | 9.0 | 9.0 | 9.0 | 9.5 | 9.0 | 8.5 | Final polish |
```

**Trend Analysis:**
- Identify quality improvements over time
- Spot quality degradation early
- Celebrate milestones
- Share learnings with team

## Best Practices

### ✅ Do

1. **Establish Baseline Early**
   - Run quality scan on day 1
   - Document initial scores
   - Set improvement goals

2. **Test Frequently**
   - Run quality scans after major changes
   - Don't wait until pre-deployment
   - Catch issues early

3. **Prioritize Fixes**
   - Fix high-priority issues first
   - Address medium priority next
   - Consider low priority for backlog

4. **Track Trends**
   - Monitor quality over time
   - Identify patterns
   - Learn from improvements

5. **Document Findings**
   - Save quality reports
   - Track fixes applied
   - Share learnings

6. **Celebrate Improvements**
   - Recognize quality milestones
   - Share success with team
   - Maintain momentum

### ❌ Don't

1. **Don't Skip Quality Gates**
   - Never deploy without quality scan
   - Don't ignore failing scores
   - Don't rush to production

2. **Don't Ignore Warnings**
   - Console warnings indicate problems
   - Accessibility warnings matter
   - Performance warnings add up

3. **Don't Accept Low Scores**
   - Don't normalize < 8.0 scores
   - Don't ship high-priority issues
   - Don't compromise on quality

4. **Don't Test Once**
   - Multiple tests more reliable
   - Different conditions affect results
   - Consistency matters

5. **Don't Forget Mobile**
   - Most users on mobile
   - Mobile issues critical
   - Test mobile first

6. **Don't Deploy Regressions**
   - Never deploy lower scores
   - Fix before deploying
   - Maintain quality standards

## Tools and Resources

### Recommended Tools

**Chrome DevTools MCP:**
- Live browser inspection
- Performance profiling
- Accessibility auditing
- Console monitoring

**Lighthouse:**
- Comprehensive audits
- Performance metrics
- Accessibility scoring
- Best practice recommendations

**Web Vitals Extension:**
- Real-time Core Web Vitals
- On-page performance data
- Historical tracking

**axe DevTools:**
- Detailed accessibility testing
- WCAG compliance checking
- Remediation guidance

### Genesis Quality Commands

```bash
# Full quality scan
/quality-scan localhost:3000

# Performance analysis
/performance-audit localhost:3000

# Accessibility audit
/accessibility-check localhost:3000

# Responsive testing
/responsive-test localhost:3000

# Pre-deployment gate
/pre-deployment-check localhost:3000
```

## Related Documentation

- **[Chrome DevTools MCP](CHROME_DEVTOOLS_MCP.md)** - Integration guide
- **[Browser Automation Guide](BROWSER_AUTOMATION_GUIDE.md)** - Implementation details
- **[Validation Templates](QUALITY_VALIDATION_TEMPLATES.md)** - Reusable templates
- **[Phase 2 Complete](../PHASE_2_COMPLETE.md)** - Genesis agents

## Appendix

### Score Calculation Examples

**Example 1: Landing Page**

```
Visual Quality: 8.5
Functionality: 9.0
Performance: 8.0
Accessibility: 8.5
Responsive: 8.0

Overall = (8.5 × 0.25) + (9.0 × 0.25) + (8.0 × 0.25) + (8.5 × 0.15) + (8.0 × 0.10)
Overall = 2.125 + 2.25 + 2.0 + 1.275 + 0.8
Overall = 8.45/10

Status: Good - Deploy with confidence
```

**Example 2: SaaS App**

```
Visual Quality: 9.0
Functionality: 8.5
Performance: 8.5
Accessibility: 9.0
Responsive: 8.5

Overall = (9.0 × 0.25) + (8.5 × 0.25) + (8.5 × 0.25) + (9.0 × 0.15) + (8.5 × 0.10)
Overall = 2.25 + 2.125 + 2.125 + 1.35 + 0.85
Overall = 8.70/10

Status: Good - Exceeds SaaS minimum (8.5)
```

### Glossary

**LCP**: Largest Contentful Paint - Time for largest visible element to render
**CLS**: Cumulative Layout Shift - Visual stability during page load
**FID**: First Input Delay - Time from user interaction to browser response
**INP**: Interaction to Next Paint - Responsiveness to user interactions
**WCAG**: Web Content Accessibility Guidelines
**A11y**: Accessibility (a + 11 letters + y)
**RUM**: Real User Monitoring - Performance data from actual users

---

**Status**: Active Standard
**Version**: 1.0
**Last Updated**: 2025-10-16
**Maintainer**: Project Genesis Team
