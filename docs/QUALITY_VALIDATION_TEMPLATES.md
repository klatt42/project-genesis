# Quality Validation Templates

## Overview

This document provides ready-to-use templates for common quality validation scenarios with Chrome DevTools MCP. Copy these templates directly into Claude Code for consistent, comprehensive testing.

## Template Categories

1. **Full Project Validation** - Comprehensive quality scans
2. **Section-Specific Validation** - Individual section checks
3. **Performance Optimization** - Performance-focused testing
4. **Accessibility Audit** - A11y-specific validation
5. **Responsive Design** - Multi-breakpoint testing
6. **Pre-Deployment Gates** - Deployment readiness checks

---

## 1. Full Project Validation

### Template 1.1: Complete Landing Page Scan

```
Comprehensive quality validation for Genesis landing page at localhost:3000:

SETUP:
- Navigate to localhost:3000
- Wait for complete page load
- Clear console

VISUAL INSPECTION:
Hero Section:
- Layout and spacing correct
- CTA buttons visible and properly styled
- Background image loaded and optimized
- Text contrast readable (≥ 4.5:1)
- Headline impactful and clear
- Score: [X]/10

Features/Services Section:
- All cards render consistently
- Icons/images load properly
- Grid layout responsive
- Hover states work
- Content aligned
- Score: [X]/10

Testimonials (if present):
- Images load properly
- Layout consistent
- Quotes readable
- Author attribution clear
- Score: [X]/10

Contact Form:
- All fields visible
- Labels associated with inputs
- Styling consistent
- Button properly styled
- Validation indicators present
- Score: [X]/10

Footer:
- All links functional
- Contact information correct
- Layout responsive
- Social links work (if present)
- Score: [X]/10

FUNCTIONALITY TESTING:
- Test contact form submission with data:
  * Name: "Test User"
  * Email: "test@example.com"
  * Phone: "555-0123"
  * Message: "Test message for quality validation"
- Click all CTA buttons (verify clickability, not navigation)
- Test navigation menu (if present)
- Verify phone link works (tel: protocol)
- Verify email link works (mailto: protocol)
- Check all internal links
- Check all external links

RESPONSIVE DESIGN:
Mobile (375px width):
- No horizontal scrolling
- Touch targets ≥ 44x44px
- Text readable (font-size ≥ 16px)
- Navigation accessible/collapsible
- Images scale to container
- Form usable
- Status: [PASS/FAIL]

Tablet (768px width):
- Layout adapts from mobile
- Spacing increases appropriately
- Multi-column layouts work
- Images scale properly
- Status: [PASS/FAIL]

Desktop (1920px width):
- Max-width containers prevent stretching
- Whitespace balanced
- Hover states work
- No excessive empty space
- Status: [PASS/FAIL]

PERFORMANCE ANALYSIS:
- Record full page load trace
- Report metrics:
  * LCP: [X.X]s (Target: < 2.5s) [PASS/FAIL]
  * CLS: [X.XX] (Target: < 0.1) [PASS/FAIL]
  * FID/INP: [X]ms (Target: < 100ms) [PASS/FAIL]
- Identify top 3 performance bottlenecks
- Check bundle sizes (JS + CSS)

ACCESSIBILITY AUDIT:
- Run Lighthouse accessibility scan
- Check color contrast (all text)
- Verify all images have alt text
- Verify all forms have labels
- Test keyboard navigation
- Check focus indicators
- Verify ARIA attributes
- Report Lighthouse score: [X]/100

CONSOLE ERRORS:
- List all JavaScript errors
- List all failed network requests
- List any CORS issues
- List any missing resources
- Count warnings

OUTPUT:
Generate quality report with:
1. Overall Score: [X.X]/10
2. Section Scores (each section)
3. Issues Found (High/Medium/Low priority)
4. Performance Metrics (with pass/fail)
5. Responsive Status (each breakpoint)
6. Accessibility Score
7. Console Errors Summary
8. Specific Recommendations (prioritized)

Save report to: docs/quality-reports/[YYYY-MM-DD]-full-scan.md
```

### Template 1.2: SaaS Application Scan

```
Comprehensive quality validation for Genesis SaaS app at localhost:3000:

SETUP:
- Navigate to localhost:3000
- Log in if authentication required
- Clear console

VISUAL INSPECTION:
Dashboard:
- Layout clean and organized
- Navigation clear
- Stats/metrics display correctly
- Charts render properly
- Sidebar functional
- Score: [X]/10

Forms:
- All input fields styled consistently
- Labels properly associated
- Validation messages clear
- Error states visible
- Success states clear
- Score: [X]/10

Tables/Lists:
- Data displays correctly
- Sorting works (if applicable)
- Pagination works (if applicable)
- Row actions functional
- Responsive on mobile
- Score: [X]/10

Modals/Dialogs:
- Open/close animations smooth
- Content readable
- Actions clear
- Backdrop works
- Escape key closes
- Score: [X]/10

FUNCTIONALITY TESTING:
Authentication:
- Login works
- Logout works
- Session persistence
- Password reset (if applicable)
- Error messages clear

CRUD Operations:
- Create: Test creating new item
- Read: Verify data displays
- Update: Test editing item
- Delete: Test deleting item
- Verify all operations in console/network

Forms:
- Test all form submissions
- Verify validation (required fields, format)
- Test error handling
- Test success feedback
- Test cancel/reset functionality

Navigation:
- Test all navigation links
- Verify correct routing
- Test browser back/forward
- Test deep linking

SECURITY:
- Check HTTPS enforced
- Verify CSRF protection
- Check XSS prevention
- Verify input sanitization
- Check authentication on protected routes

PERFORMANCE:
- Record interaction trace
- Report metrics:
  * Time to Interactive: [X.X]s
  * INP: [X]ms (Target: < 100ms)
  * Bundle size: [X]KB (Target: < 200KB)
- Check for unnecessary re-renders
- Identify optimization opportunities

ACCESSIBILITY:
- Keyboard navigation through entire app
- Screen reader compatibility
- ARIA labels on interactive elements
- Focus management in modals
- Color contrast throughout
- Lighthouse score: [X]/100

RESPONSIVE DESIGN:
- Test at 375px (mobile)
- Test at 768px (tablet)
- Test at 1920px (desktop)
- Verify responsive tables/charts
- Check mobile navigation

CONSOLE/NETWORK:
- Check for errors
- Check for failed requests
- Verify API response times
- Check for memory leaks
- Review console warnings

OUTPUT:
Generate comprehensive SaaS quality report with:
1. Overall Score: [X.X]/10 (Target: ≥ 8.5)
2. Security Score: [X.X]/10 (Target: ≥ 9.0)
3. All section scores
4. Functionality test results
5. Performance metrics
6. Security audit results
7. Prioritized issues
8. Recommendations

Save to: docs/quality-reports/[YYYY-MM-DD]-saas-scan.md
```

---

## 2. Section-Specific Validation

### Template 2.1: Hero Section

```
Validate hero section at localhost:3000:

VISUAL:
- Layout correct and centered
- Spacing consistent with design
- CTA buttons prominent and styled
- Background image/gradient loads properly
- Text contrast readable (check with DevTools)
- Typography hierarchy clear
- Animations (if any) smooth

FUNCTIONALITY:
- Primary CTA clickable
- Secondary CTA clickable (if present)
- Both CTAs have proper hover states
- Both CTAs have proper focus states
- Buttons not disabled unless intentional

RESPONSIVE:
At 375px (mobile):
- No horizontal scroll
- Headline readable (≥ 20px)
- Body text readable (≥ 16px)
- CTAs stack vertically or wrap properly
- Touch targets ≥ 44x44px
- Background scales appropriately

At 768px (tablet):
- Layout adapts properly
- Spacing increases from mobile
- CTAs side-by-side if designed that way

At 1920px (desktop):
- Content max-width applied (not stretched)
- Whitespace balanced
- Background covers properly

PERFORMANCE:
- Check if hero background is LCP element
- If LCP, verify image optimized
- Check for layout shift during load
- Verify font loading doesn't cause shift

ACCESSIBILITY:
- Heading is h1
- CTA buttons have descriptive text/aria-label
- Color contrast ≥ 4.5:1
- Focus indicators visible

SCORE: [X]/10

ISSUES:
- [ ] [List any issues found]

RECOMMENDATIONS:
- [ ] [Specific improvements]
```

### Template 2.2: Contact Form

```
Comprehensive form validation at localhost:3000:

VISUAL:
- All fields visible and properly styled
- Labels clearly associated with inputs
- Field spacing consistent
- Button styled prominently
- Error message styling defined
- Success message styling defined

FUNCTIONALITY:
Test 1: Valid Submission
- Fill fields:
  * Name: "Test User"
  * Email: "test@example.com"
  * Phone: "555-0123" (if present)
  * Message: "Test message for validation"
- Submit form
- Verify success message appears
- Verify form clears or shows success state
- Check console for errors
- Check network tab for submission

Test 2: Required Field Validation
- Submit empty form
- Verify all required fields show errors
- Check error messages are clear
- Verify focus goes to first error field

Test 3: Email Validation
- Enter invalid email: "notanemail"
- Submit form
- Verify email validation error
- Try valid email format
- Verify error clears

Test 4: Phone Validation (if present)
- Enter invalid phone: "abc"
- Verify phone validation error
- Try valid format
- Verify error clears

Test 5: Edge Cases
- Very long name (> 100 characters)
- Very long message (> 1000 characters)
- Special characters in fields
- Copy/paste into fields
- Verify handling of all cases

RESPONSIVE:
Mobile (375px):
- Fields stack vertically
- Touch-friendly (44x44px minimum)
- Keyboard opens appropriately
- Submit button full-width or prominent
- Error messages readable

Tablet/Desktop:
- Layout appropriate for screen size
- Field widths reasonable
- Button placement logical

ACCESSIBILITY:
- All fields have associated labels
- Labels visible (not just placeholder)
- Required fields marked with asterisk
- Error messages associated with fields (aria-describedby)
- Success message announced to screen readers
- Form can be submitted with Enter key
- Tab order logical

PERFORMANCE:
- Form submission fast (< 1s)
- Loading state shown during submission
- No blocking during submission

SCORE: [X]/10

ISSUES:
- [ ] [List all issues]

RECOMMENDATIONS:
- [ ] [Prioritized improvements]
```

---

## 3. Performance Optimization

### Template 3.1: Performance Audit

```
Comprehensive performance analysis for localhost:3000:

SETUP:
- Clear cache
- Open DevTools Performance tab
- Prepare to record

RECORDING:
- Start performance recording
- Navigate to localhost:3000 (or reload)
- Wait for complete load (network idle)
- Stop recording

CORE WEB VITALS:
Largest Contentful Paint (LCP):
- Time: [X.X]s
- Element: [Identify element]
- Target: < 2.5s
- Status: [PASS/FAIL]
- Issues: [If LCP > 2.5s, identify why]

Cumulative Layout Shift (CLS):
- Score: [X.XX]
- Target: < 0.1
- Status: [PASS/FAIL]
- Shifting elements: [Identify elements causing shift]

First Input Delay / Interaction to Next Paint:
- Time: [X]ms
- Target: < 100ms
- Status: [PASS/FAIL]

ADDITIONAL METRICS:
- First Contentful Paint: [X.X]s (Target: < 1.8s)
- Time to Interactive: [X.X]s (Target: < 3.5s)
- Total Blocking Time: [X]ms (Target: < 200ms)
- Speed Index: [X.X] (Target: < 3.4s)

RESOURCE ANALYSIS:
JavaScript:
- Total JS size: [X]KB (gzipped)
- Largest JS file: [filename] ([X]KB)
- Unused JS: [X]KB ([X]%)
- Blocking scripts: [Count]

CSS:
- Total CSS size: [X]KB (gzipped)
- Largest CSS file: [filename] ([X]KB)
- Unused CSS: [X]KB ([X]%)
- Blocking styles: [Count]

Images:
- Total image size: [X]KB
- Largest image: [filename] ([X]KB)
- Images not optimized: [Count]
- Missing width/height: [Count]

Fonts:
- Total font size: [X]KB
- Font loading strategy: [Describe]
- Fonts causing FOIT/FOUT: [List]

BOTTLENECK IDENTIFICATION:
Top 3 Performance Issues:
1. [Issue]: [Description]
   - Impact: [X]s delay
   - Recommendation: [Specific fix]

2. [Issue]: [Description]
   - Impact: [X]s delay
   - Recommendation: [Specific fix]

3. [Issue]: [Description]
   - Impact: [X]s delay
   - Recommendation: [Specific fix]

OPTIMIZATION OPPORTUNITIES:
Images:
- [ ] Convert to WebP
- [ ] Add lazy loading
- [ ] Properly size images
- [ ] Add width/height attributes

Code:
- [ ] Code split large bundles
- [ ] Tree-shake unused code
- [ ] Minify and compress
- [ ] Remove console.logs

Fonts:
- [ ] Subset fonts
- [ ] Preload critical fonts
- [ ] Use font-display: swap

Critical Rendering Path:
- [ ] Inline critical CSS
- [ ] Defer non-critical CSS
- [ ] Async/defer scripts
- [ ] Eliminate render-blocking resources

ESTIMATED IMPROVEMENTS:
If all recommendations applied:
- Expected LCP: [X.X]s (improvement: [X]s)
- Expected CLS: [X.XX] (improvement: [X])
- Expected FID: [X]ms (improvement: [X]ms)
- Overall Performance Score: [X]/100 → [X]/100

PRIORITY FIXES:
High Priority (Do First):
1. [Fix]: [Why high priority]
2. [Fix]: [Why high priority]

Medium Priority:
1. [Fix]
2. [Fix]

Low Priority:
1. [Fix]
2. [Fix]

OUTPUT:
Save detailed performance report to:
docs/quality-reports/[YYYY-MM-DD]-performance.md
```

---

## 4. Accessibility Audit

### Template 4.1: WCAG 2.1 AA Compliance Check

```
Accessibility audit for localhost:3000:

AUTOMATED SCAN:
- Run Lighthouse accessibility audit
- Report score: [X]/100
- List all issues found

MANUAL TESTING:

1. KEYBOARD NAVIGATION:
- Tab through entire page
- Verify tab order logical
- Check all interactive elements reachable
- Verify focus indicators visible
- Check no keyboard traps
- Test Enter/Space on buttons
- Test Escape on modals
- Verify skip links work

2. SCREEN READER TESTING:
- Headings hierarchical (h1 → h2 → h3)
- Landmarks properly labeled
- Images have descriptive alt text
- Forms have associated labels
- Buttons have descriptive names
- Links have descriptive text (not "click here")
- ARIA attributes correct

3. COLOR CONTRAST:
Use DevTools to check:
- Body text: [Contrast ratio] (Need: ≥ 4.5:1)
- Headings: [Contrast ratio] (Need: ≥ 4.5:1)
- Buttons: [Contrast ratio] (Need: ≥ 4.5:1)
- Links: [Contrast ratio] (Need: ≥ 4.5:1)
- Form labels: [Contrast ratio] (Need: ≥ 4.5:1)
- Error messages: [Contrast ratio] (Need: ≥ 4.5:1)

4. FORM ACCESSIBILITY:
- All inputs have associated labels
- Required fields marked (asterisk + aria-required)
- Error messages use aria-describedby
- Success messages announced
- Fieldsets used for radio groups
- Legends used for fieldsets

5. IMAGE ACCESSIBILITY:
- All images have alt text
- Decorative images use alt=""
- Complex images have long descriptions
- Icon buttons have aria-label

6. SEMANTIC HTML:
- Page has main landmark
- Navigation in nav element
- Headings used correctly
- Lists used for list content
- Tables used only for tabular data

WCAG 2.1 LEVEL AA CHECKLIST:

Perceivable:
- [ ] All non-text content has text alternative
- [ ] Color not sole means of conveying information
- [ ] Color contrast meets minimums
- [ ] Text can be resized 200%
- [ ] Images of text avoided

Operable:
- [ ] All functionality keyboard accessible
- [ ] No keyboard trap
- [ ] Page titled
- [ ] Focus order logical
- [ ] Link purpose clear from text
- [ ] Multiple ways to find pages
- [ ] Headings and labels descriptive
- [ ] Focus visible

Understandable:
- [ ] Page language identified
- [ ] Language of parts identified
- [ ] Navigation consistent
- [ ] Consistent identification
- [ ] Error identification
- [ ] Labels or instructions provided
- [ ] Error suggestion provided

Robust:
- [ ] Valid HTML (no major errors)
- [ ] Name, role, value for all UI components
- [ ] Status messages identified

ISSUES FOUND:
High Priority:
1. [Issue]: [Description]
   - WCAG Criterion: [X.X.X]
   - Impact: [Who is affected]
   - Fix: [How to fix]

Medium Priority:
1. [Issue]
2. [Issue]

Low Priority:
1. [Issue]
2. [Issue]

ACCESSIBILITY SCORE: [X]/10

COMPLIANCE: [AA / Below AA / AAA]

OUTPUT:
Save detailed accessibility report to:
docs/quality-reports/[YYYY-MM-DD]-accessibility.md
```

---

## 5. Responsive Design Testing

### Template 5.1: Multi-Breakpoint Validation

```
Comprehensive responsive design test for localhost:3000:

MOBILE (375px width):
- Set viewport to 375px × 667px
- Reload page

Visual:
- No horizontal scrolling
- Content fits within viewport
- Images scale to container
- Text readable (check all font sizes)
- Spacing appropriate for mobile
- Navigation collapsed/hamburger menu

Interactive:
- Touch targets ≥ 44x44px (measure key elements)
- Buttons easy to tap
- Form fields large enough
- Dropdown menus work
- Modals fit on screen

Typography:
- Body text ≥ 16px
- Headings scale appropriately
- Line height comfortable
- Text doesn't overflow

Forms:
- Fields stack vertically
- Labels visible above fields
- Button full-width or prominent
- Mobile keyboard appropriate (email, tel, etc.)

Navigation:
- Menu accessible
- Hamburger icon clear
- Menu animation smooth
- Close button easy to tap

Score: [X]/10
Issues: [List issues]

TABLET (768px width):
- Set viewport to 768px × 1024px
- Reload page

Visual:
- Layout transitions from mobile
- Columns adjust (e.g., 1 column → 2 columns)
- Spacing increases from mobile
- Images scale appropriately
- Typography scales up

Navigation:
- Menu may expand or stay collapsed
- Navigation items spaced appropriately
- Dropdowns work properly

Forms:
- May use multi-column layout
- Fields appropriate width
- Buttons appropriately sized

Score: [X]/10
Issues: [List issues]

DESKTOP (1920px width):
- Set viewport to 1920px × 1080px
- Reload page

Visual:
- Content has max-width (not stretched)
- Whitespace balanced
- Typography comfortable to read
- Images high quality (not pixelated)
- Layout uses available space wisely

Interactive:
- Hover states work
- Dropdowns position correctly
- Modals centered properly

Navigation:
- Full navigation visible
- Mega menus work (if applicable)
- Dropdowns don't go off-screen

Score: [X]/10
Issues: [List issues]

BREAKPOINT TRANSITIONS:
- Slowly resize browser from 375px to 1920px
- Watch for:
  * Awkward intermediate sizes
  * Content overflow
  * Images breaking
  * Navigation issues
  * Layout jumps

ORIENTATION TESTING:
Mobile landscape (667px × 375px):
- Page usable in landscape
- No critical content cut off
- Navigation accessible

Tablet landscape (1024px × 768px):
- Layout appropriate
- Content readable

TOUCH vs. HOVER:
- Verify hover-only features have touch alternatives
- Check for hover-dependent dropdowns (bad for mobile)
- Verify tooltips work on touch

RESPONSIVE IMAGES:
- Verify srcset used for different sizes
- Check images load appropriate size
- Confirm no oversized images on mobile

OVERALL RESPONSIVE SCORE: [X]/10

ISSUES BY BREAKPOINT:
Mobile: [List]
Tablet: [List]
Desktop: [List]
Transitions: [List]

RECOMMENDATIONS:
1. [Fix]: [Description]
2. [Fix]: [Description]
3. [Fix]: [Description]

OUTPUT:
Save responsive design report to:
docs/quality-reports/[YYYY-MM-DD]-responsive.md
```

---

## 6. Pre-Deployment Gates

### Template 6.1: Deployment Readiness Check

```
Pre-deployment quality gate for localhost:3000:

STEP 1: FULL QUALITY SCAN
Run comprehensive quality validation (use Template 1.1 or 1.2).

STEP 2: VERIFY MINIMUM STANDARDS

Landing Page Standards (if applicable):
- [ ] Overall score ≥ 8.0/10
- [ ] Performance score ≥ 8.5/10
- [ ] Accessibility score ≥ 90
- [ ] No high-priority issues
- [ ] All Core Web Vitals pass

SaaS App Standards (if applicable):
- [ ] Overall score ≥ 8.5/10
- [ ] Performance score ≥ 8.0/10
- [ ] Security score ≥ 9.0/10
- [ ] Accessibility score ≥ 90
- [ ] No critical security issues

STEP 3: CRITICAL CHECKS

Functionality:
- [ ] All forms submit successfully
- [ ] All links work
- [ ] All buttons functional
- [ ] Navigation works
- [ ] No console errors

Performance:
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] FID/INP < 100ms
- [ ] No blocking resources

Accessibility:
- [ ] Lighthouse score ≥ 90
- [ ] Keyboard navigation works
- [ ] Color contrast passes
- [ ] All images have alt text
- [ ] All forms have labels

Responsive:
- [ ] Works on mobile (375px)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1920px)
- [ ] No horizontal scrolling

Security (SaaS):
- [ ] HTTPS enforced
- [ ] Authentication works
- [ ] CSRF protection enabled
- [ ] XSS prevention in place
- [ ] Input validation working

STEP 4: CROSS-BROWSER CHECK (if possible)
Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

STEP 5: GO/NO-GO DECISION

IF ALL CHECKS PASS:
✅ DEPLOY - Project meets Genesis quality standards

IF ANY CHECKS FAIL:
❌ DO NOT DEPLOY

High-Priority Issues to Fix:
1. [Issue]
2. [Issue]
3. [Issue]

Action: Fix high-priority issues and re-run this checklist.

STEP 6: PRE-DEPLOYMENT REPORT

Generate final report including:
- Overall quality score
- All section scores
- Performance metrics
- Accessibility score
- List of known minor issues (if any)
- Deployment recommendation (GO/NO-GO)
- Date and time of validation

Save to: docs/quality-reports/[YYYY-MM-DD]-pre-deployment.md

STEP 7: POST-DEPLOYMENT PLAN

After deployment, schedule:
- Week 1: Production quality scan
- Week 2: User feedback review
- Week 4: Performance monitoring review
- Monthly: Re-validate and track trends
```

---

## Quick Reference

### Common Commands

**Full Scan:**
```
Run comprehensive quality scan using Genesis template on localhost:3000.
Save report to docs/quality-reports/[date]-full-scan.md
```

**Quick Validation:**
```
Quick validation of localhost:3000:
- Check for console errors
- Verify Core Web Vitals
- Test mobile responsive (375px)
- Report overall status
```

**Section Check:**
```
Validate [section-name] section at localhost:3000:
- Visual inspection
- Functionality testing
- Responsive design
- Score 1-10
```

**Performance Only:**
```
Performance audit of localhost:3000:
- Record trace
- Report Core Web Vitals
- Identify top 3 bottlenecks
- Provide optimization recommendations
```

**Accessibility Only:**
```
Accessibility audit of localhost:3000:
- Run Lighthouse scan
- Check WCAG 2.1 AA compliance
- Test keyboard navigation
- List all issues with priorities
```

---

## Related Documentation

- **[Chrome DevTools MCP](CHROME_DEVTOOLS_MCP.md)** - Integration guide
- **[Quality Standards](QUALITY_STANDARDS.md)** - Validation criteria
- **[Browser Automation Guide](BROWSER_AUTOMATION_GUIDE.md)** - Implementation
- **[Claude Code Integration](../CLAUDE_CODE_INTEGRATION.md)** - Genesis MCP

---

**Status**: Ready to Use
**Last Updated**: 2025-10-16
**Maintainer**: Project Genesis Team
