# Docker MCP Workflow Templates
## Ready-to-Use Automation Patterns

**Purpose**: Copy-paste workflow templates for common Genesis tasks using Docker MCPs
**Updated**: 2025-10-16

---

## 📋 How to Use These Templates

1. **Copy the prompt** from any workflow below
2. **Customize** the bracketed [placeholders]
3. **Paste** into Claude Code or Claude Desktop
4. **Execute** - MCPs will handle the automation

**Prerequisites**: Docker Desktop MCP Toolkit configured with required MCPs

---

## 🏗️ Workflow Category: Genesis Project Setup

### Workflow 1.1: New Landing Page Project

**MCPs Required**: GitHub, Supabase, Archon OS
**Time**: 5-10 minutes
**API Keys Needed**: GitHub token, Supabase credentials

**Prompt Template**:
```
Create a new Genesis landing page project for [CLIENT_NAME] with these specifications:

PROJECT SETUP:
1. GitHub Repository:
   - Name: [client-name]-landing-page
   - Description: Genesis landing page for [CLIENT_NAME]
   - Initialize with README
   - Add .gitignore for Next.js
   - Make private

2. Supabase Project:
   - Create new project: [client-name]-landing
   - Setup database schema:
     * contacts table (id, name, email, phone, message, created_at)
     * Enable RLS
     * Create insert policy for public form submissions
   - Generate API keys

3. Archon OS:
   - Create project entry
   - Add tasks: "Setup repository", "Configure database", "Generate landing page"
   - Initialize Genesis project structure

OUTPUT:
- Repository URL
- Supabase project URL
- Database connection string (secured)
- Next steps for development
```

---

### Workflow 1.2: Initialize Genesis Boilerplate

**MCPs Required**: GitHub, Archon OS
**Time**: 2-3 minutes
**API Keys Needed**: GitHub token

**Prompt Template**:
```
Initialize Genesis landing page boilerplate:

1. Clone Genesis boilerplate:
   - Source: project-genesis/boilerplate/landing-page
   - Destination: [NEW_PROJECT_PATH]

2. Setup configuration:
   - Update package.json with [CLIENT_NAME]
   - Configure environment variables template
   - Update README with project specifics

3. Create GitHub repository:
   - Name: [project-name]
   - Push initial code
   - Setup branch protection on main

4. Archon OS tracking:
   - Register new project
   - Create initial tasks

DELIVER:
- Local project path
- GitHub repository URL
- Environment variables checklist
- Development start command
```

---

## 🎨 Workflow Category: Design & Development

### Workflow 2.1: Generate Landing Page Section

**MCPs Required**: Archon OS, Chrome DevTools (for validation)
**Time**: 10-15 minutes
**API Keys Needed**: None (uses local Archon)

**Prompt Template**:
```
Generate Genesis landing page section:

SECTION TYPE: [hero / features / testimonials / contact / pricing / faq]
CLIENT: [CLIENT_NAME]
INDUSTRY: [INDUSTRY_TYPE]

REQUIREMENTS:
1. Use Genesis design patterns
2. Colors: [PRIMARY_COLOR], [SECONDARY_COLOR]
3. Include: [SPECIFIC_ELEMENTS]
4. Target audience: [AUDIENCE_DESCRIPTION]

PROCESS:
1. Use Archon autonomous-generate command
2. Generate section code (React + TypeScript + Tailwind)
3. Place in: components/sections/[section-name].tsx
4. Create preview at: app/preview/[section-name]/page.tsx

VALIDATION:
5. Start dev server on port 3000
6. Navigate to preview page
7. Run quality validation:
   - Visual quality check
   - Responsive design (375px, 768px, 1920px)
   - Accessibility scan
   - Score 1-10

DELIVER:
- Component file path
- Quality score
- Top 3 improvements needed (if score < 8.0)
- Preview URL
```

---

### Workflow 2.2: Quality Validation Loop

**MCPs Required**: Chrome DevTools
**Time**: 5 minutes per iteration
**API Keys Needed**: None

**Prompt Template**:
```
Run comprehensive quality validation on localhost:[PORT]

PROJECT: [PROJECT_NAME]
URL: localhost:[PORT]

VALIDATION CHECKLIST:
1. Visual Quality (25%):
   - Layout and spacing
   - Color consistency
   - Typography hierarchy
   - Image optimization
   - Score: __/10

2. Functionality (25%):
   - All links work
   - Forms submit correctly
   - Buttons respond
   - No JavaScript errors
   - Score: __/10

3. Performance (25%):
   - LCP < 2.5s
   - CLS < 0.1
   - FID < 100ms
   - Total load time < 3s
   - Score: __/10

4. Accessibility (15%):
   - Lighthouse score ≥ 90
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader friendly
   - Score: __/10

5. Responsive Design (10%):
   - Mobile (375px) perfect
   - Tablet (768px) perfect
   - Desktop (1920px) perfect
   - No horizontal scroll
   - Score: __/10

QUALITY GATE: Overall ≥ 8.0/10 for deployment

DELIVER:
- Overall score
- Dimension scores
- Top 5 issues prioritized
- Specific fix recommendations
- Re-test after fixes applied
```

---

## 🚀 Workflow Category: Deployment

### Workflow 3.1: Deploy to Netlify

**MCPs Required**: GitHub, Netlify
**Time**: 5-10 minutes
**API Keys Needed**: GitHub token, Netlify token

**Prompt Template**:
```
Deploy Genesis landing page to Netlify:

PROJECT: [PROJECT_NAME]
REPOSITORY: [GITHUB_REPO_URL]

PRE-DEPLOYMENT CHECKLIST:
1. Run quality validation (must be ≥ 8.0/10)
2. Verify environment variables are documented
3. Check build command: npm run build
4. Verify output directory: .next

DEPLOYMENT:
1. Connect repository to Netlify:
   - Site name: [site-name]
   - Branch: main
   - Build command: npm run build
   - Publish directory: .next

2. Configure environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - [OTHER_ENV_VARS]

3. Deploy:
   - Trigger build
   - Monitor build logs
   - Report any errors

4. Post-deployment validation:
   - Run quality check on live URL
   - Test form submissions
   - Verify analytics

DELIVER:
- Live site URL
- Deploy status
- Build time
- Post-deployment quality score
- DNS configuration instructions
```

---

### Workflow 3.2: Pre-Deployment Quality Gate

**MCPs Required**: Chrome DevTools, GitHub, Slack (optional)
**Time**: 10 minutes
**API Keys Needed**: GitHub token, Slack token (optional)

**Prompt Template**:
```
Pre-deployment quality gate for [PROJECT_NAME]:

GATE REQUIREMENTS (Landing Page):
- [ ] Overall quality ≥ 8.0/10
- [ ] Performance ≥ 8.5/10
- [ ] Accessibility ≥ 90
- [ ] No console errors
- [ ] All Core Web Vitals pass
- [ ] Responsive at all breakpoints
- [ ] Forms tested successfully
- [ ] All images optimized

PROCESS:
1. Run comprehensive quality scan on localhost:3000
2. Generate quality report
3. Check against deployment standards
4. If PASS:
   - Create GitHub tag: v1.0.0
   - Post success to Slack #deployments
   - Approve for deployment
5. If FAIL:
   - List blocking issues
   - Estimate fix time
   - Block deployment
   - Notify team via Slack

DELIVER:
- PASS/FAIL decision
- Quality report
- Blocking issues (if FAIL)
- Deployment recommendation
```

---

## 📊 Workflow Category: Research & Content

### Workflow 4.1: Competitive Analysis

**MCPs Required**: Brave Search, Firecrawl, Obsidian (optional)
**Time**: 15-20 minutes
**API Keys Needed**: Brave API key, Firecrawl API key

**Prompt Template**:
```
Conduct competitive analysis for [CLIENT_NAME] in [INDUSTRY]:

RESEARCH PHASE:
1. Use Brave Search to find:
   - Top 10 competitors in [INDUSTRY] in [LOCATION]
   - Recent industry trends
   - Best practices for [INDUSTRY] landing pages

2. For each top 5 competitors:
   - Use Firecrawl to extract website content
   - Analyze:
     * Hero section messaging
     * Services offered
     * Call-to-action strategy
     * Contact form placement
     * Design patterns
     * Value propositions

ANALYSIS:
3. Synthesize findings:
   - Common patterns (what works)
   - Unique differentiators
   - Gaps in market (opportunities for [CLIENT_NAME])
   - Design trends
   - Messaging frameworks

4. Generate recommendations:
   - Unique value props for [CLIENT_NAME]
   - Differentiation strategy
   - Design direction
   - Content strategy

OPTIONAL - DOCUMENTATION:
5. Save to Obsidian vault:
   - Create note: [CLIENT_NAME] Competitive Analysis
   - Add tags: #competitive-analysis #[industry]
   - Link to project

DELIVER:
- Top 5 competitors list with URLs
- Pattern analysis summary
- Opportunities identified
- Specific recommendations for [CLIENT_NAME]
- Design inspiration examples
```

---

### Workflow 4.2: Content Research Pipeline

**MCPs Required**: Brave Search, Firecrawl, Archon OS
**Time**: 10-15 minutes
**API Keys Needed**: Brave API key, Firecrawl API key

**Prompt Template**:
```
Research content for [TOPIC] to inform Genesis project:

TOPIC: [TOPIC_DESCRIPTION]
PURPOSE: [CONTENT_PURPOSE]
TARGET: [TARGET_AUDIENCE]

RESEARCH STEPS:
1. Brave Search phase:
   - Query: "[TOPIC] best practices"
   - Query: "[TOPIC] examples in [INDUSTRY]"
   - Query: "latest [TOPIC] trends 2025"
   - Filter: Recent articles (last 6 months)

2. Content extraction:
   - Use Firecrawl on top 5 results
   - Extract: Key points, statistics, quotes, examples
   - Identify: Authoritative sources

3. Synthesis:
   - Summarize key findings
   - Extract actionable insights
   - Identify best practices
   - Note statistics and data points

4. Application to Genesis:
   - How findings apply to current project
   - Specific recommendations
   - Content ideas for landing page
   - Messaging suggestions

5. Document in Archon:
   - Add research findings to project knowledge base
   - Create tasks for implementation
   - Link to relevant project sections

DELIVER:
- Research summary (bullet points)
- Key statistics with sources
- Top 5 actionable recommendations
- Content ideas for implementation
- Archon knowledge base updated confirmation
```

---

## 🤖 Workflow Category: Automation

### Workflow 5.1: Client Onboarding Automation

**MCPs Required**: Slack, GitHub, Supabase, Archon OS, GoHighLevel (optional)
**Time**: 5 minutes (automated)
**API Keys Needed**: All required MCPs

**Prompt Template**:
```
Automate client onboarding for [CLIENT_NAME]:

TRIGGER: New client inquiry received in Slack #new-clients

AUTOMATION SEQUENCE:
1. Monitor Slack #new-clients channel
   - Watch for new messages
   - Extract: Client name, email, phone, service interest

2. Create GitHub repository:
   - Name: [client-name]-landing-page
   - Initialize with Genesis boilerplate
   - Setup branch protection

3. Setup Supabase project:
   - Create new project
   - Initialize database schema
   - Configure RLS policies

4. Initialize Archon project:
   - Create project entry
   - Add initial tasks:
     * Discovery call scheduled
     * Requirements gathering
     * Design mockups
     * Development sprint
     * Quality validation
     * Deployment

5. Add to CRM (if GoHighLevel configured):
   - Create contact
   - Add to "New Clients" pipeline
   - Trigger welcome email automation
   - Schedule follow-up tasks

6. Notify team in Slack:
   - Post to #projects channel:
     * Client: [CLIENT_NAME]
     * Repository: [GITHUB_URL]
     * Database: [SUPABASE_URL]
     * Next steps: Discovery call

DELIVER:
- Automation success confirmation
- All resource URLs
- Team notification sent
- Next action items
```

---

### Workflow 5.2: Daily Project Status Report

**MCPs Required**: GitHub, Archon OS, Slack
**Time**: 2 minutes (automated daily)
**API Keys Needed**: GitHub token, Slack token

**Prompt Template**:
```
Generate daily project status report:

PROJECTS TO MONITOR: [ALL_ACTIVE_GENESIS_PROJECTS]
SCHEDULE: Daily at 9:00 AM

FOR EACH PROJECT:
1. GitHub activity (last 24 hours):
   - Commits pushed
   - PRs opened/merged
   - Issues created/closed
   - Latest commit message

2. Archon task status:
   - Tasks completed yesterday
   - Tasks in progress
   - Blocked tasks
   - Upcoming milestones

3. Deployment status:
   - Last deployment date
   - Current environment (staging/production)
   - Latest quality score

GENERATE REPORT:
Format as Slack message:

📊 *Daily Genesis Project Status - [DATE]*

*Project: [PROJECT_1_NAME]*
├─ 🔧 [N] commits by [@developers]
├─ ✅ [N] tasks completed
├─ 🚧 [N] tasks in progress
├─ 📈 Quality: [SCORE]/10
└─ 🚀 Last deployed: [DATE]

*Project: [PROJECT_2_NAME]*
[...]

*Team Highlights:*
- [NOTABLE_ACHIEVEMENT]
- [UPCOMING_DEADLINE]

*Action Items:*
- [BLOCKED_TASK needs attention]
- [UPCOMING_MILESTONE in N days]

POST to Slack #daily-status

DELIVER:
- Report posted confirmation
- Any urgent items flagged
- Team mentions for action items
```

---

## 🔧 Workflow Category: Maintenance

### Workflow 6.1: Weekly Quality Audit

**MCPs Required**: Chrome DevTools, GitHub
**Time**: 15-20 minutes per project
**API Keys Needed**: GitHub token

**Prompt Template**:
```
Weekly quality audit for all Genesis projects:

PROJECTS: [LIST_OF_LIVE_PROJECTS]
SCHEDULE: Every Monday at 10:00 AM

FOR EACH PROJECT:
1. Quality validation:
   - Navigate to live URL
   - Run comprehensive quality scan
   - Compare to previous week's score
   - Identify any regressions

2. Performance check:
   - Core Web Vitals
   - Page load time
   - Resource sizes
   - Compare to baseline

3. Error monitoring:
   - Console errors (if any)
   - Broken links
   - Failed API calls
   - Form submission issues

4. Accessibility check:
   - Lighthouse score
   - WCAG compliance
   - Any new violations

GENERATE REPORT:
Create comparison table:

| Project | Quality | Performance | Accessibility | Change |
|---------|---------|-------------|---------------|--------|
| [P1]    | 8.2/10  | 8.8/10      | 94           | +0.3   |
| [P2]    | 7.9/10  | 8.1/10      | 91           | -0.5 ⚠️|

FLAG ISSUES:
- Projects with score drop > 0.5
- Any score below deployment threshold
- New accessibility violations
- Performance regressions

CREATE GITHUB ISSUES:
For each flagged item:
- Title: "Quality regression: [SPECIFIC_ISSUE]"
- Label: "quality", "priority:high"
- Assign: Responsible developer
- Link: Quality report

DELIVER:
- Quality audit report
- GitHub issues created
- Projects flagged for attention
- Recommendations for improvements
```

---

### Workflow 6.2: Dependency Updates

**MCPs Required**: GitHub, Slack (optional)
**Time**: 10 minutes per project
**API Keys Needed**: GitHub token, Slack token (optional)

**Prompt Template**:
```
Monthly dependency update check for [PROJECT_NAME]:

SCOPE: All Genesis projects
SCHEDULE: First Monday of each month

FOR EACH PROJECT:
1. Check for updates:
   - npm outdated (list all)
   - Identify:
     * Security vulnerabilities
     * Major version updates
     * Minor/patch updates

2. Categorize updates:
   HIGH PRIORITY (Security):
   - [package@version] - [vulnerability description]

   MEDIUM PRIORITY (Major):
   - [package@version] - [breaking changes]

   LOW PRIORITY (Minor/Patch):
   - [package@version] - [improvements]

3. Create update plan:
   - High priority: Update immediately
   - Medium priority: Test in branch, review
   - Low priority: Batch update monthly

4. For HIGH PRIORITY:
   - Create branch: deps/security-updates
   - Update packages
   - Run tests
   - Create PR with details
   - Request review

5. Notify team:
   - Slack #dev-updates channel
   - List critical security updates
   - Mention assigned reviewers

DELIVER:
- Update categorization
- PRs created (with links)
- Testing status
- Team notifications sent
- Timeline for non-critical updates
```

---

## 🎓 Workflow Category: Learning & Optimization

### Workflow 7.1: Genesis Pattern Analysis

**MCPs Required**: GitHub, Archon OS, Obsidian (optional)
**Time**: 20 minutes
**API Keys Needed**: GitHub token

**Prompt Template**:
```
Analyze Genesis patterns across all projects:

OBJECTIVE: Identify successful patterns and areas for improvement

DATA COLLECTION:
1. From all Genesis projects:
   - Component usage frequency
   - Quality scores by section type
   - Common issues reported
   - Performance metrics
   - Conversion rates (if available)

2. From GitHub:
   - Most modified files
   - Code review feedback themes
   - Bug reports by component
   - Feature requests

3. From Archon:
   - Task completion times by type
   - Common bottlenecks
   - Pattern generation success rates

ANALYSIS:
4. Identify patterns:
   HIGH PERFORMERS:
   - Components with quality > 9.0
   - Sections with best conversion
   - Patterns with fastest development

   NEED IMPROVEMENT:
   - Components with frequent bugs
   - Sections with low quality scores
   - Patterns taking longest to develop

5. Extract insights:
   - What makes high performers successful?
   - What causes issues in problem areas?
   - How can we improve Genesis boilerplate?

RECOMMENDATIONS:
6. Propose improvements:
   - Boilerplate updates
   - New patterns to add
   - Patterns to deprecate
   - Documentation enhancements
   - Training for team

7. Document findings:
   - Create Obsidian note (if configured)
   - Or save to docs/GENESIS_PATTERNS_ANALYSIS.md
   - Include data, insights, recommendations

DELIVER:
- Pattern analysis report
- High performer characteristics
- Problem areas identified
- Specific improvement recommendations
- Documentation updated
```

---

## 📱 Workflow Category: Client Communication

### Workflow 8.1: Project Status Update for Client

**MCPs Required**: Archon OS, Chrome DevTools, Slack (optional)
**Time**: 10 minutes
**API Keys Needed**: Slack token (if posting to client channel)

**Prompt Template**:
```
Generate client-friendly project status update:

CLIENT: [CLIENT_NAME]
PROJECT: [PROJECT_NAME]
REPORTING PERIOD: [DATE_RANGE]

GATHER DATA:
1. From Archon OS:
   - Tasks completed this week
   - Current sprint progress
   - Upcoming milestones

2. From Chrome DevTools (if site live):
   - Latest quality score
   - Performance metrics
   - User experience improvements

3. Visual updates:
   - Screenshot latest development
   - Highlight new features
   - Show mobile responsiveness

GENERATE UPDATE:
Format as professional client update:

---
*Project Update: [PROJECT_NAME]*
*Period: [DATE_RANGE]*

*📈 Progress This Week:*
✅ [TASK_1] - Completed
✅ [TASK_2] - Completed
🚧 [TASK_3] - In Progress (85% complete)

*✨ New Features:*
- [FEATURE_1]: [USER_BENEFIT]
- [FEATURE_2]: [USER_BENEFIT]

*📊 Quality Metrics:*
- Overall quality: [SCORE]/10
- Page load time: [TIME]s
- Mobile-friendly: ✅ Fully responsive
- Accessibility: [SCORE]/100

*🎯 Next Week's Focus:*
- [UPCOMING_TASK_1]
- [UPCOMING_TASK_2]
- [MILESTONE if applicable]

*👁️ Preview:*
[PREVIEW_URL if available]

*📅 Timeline:*
- Current phase: [PHASE] ([X]% complete)
- Estimated completion: [DATE]
- On track: ✅ / ⚠️ [if delayed: reason]

Questions? Let's discuss in our next check-in: [DATE/TIME]
---

DELIVERY OPTIONS:
Option 1: Send to client via Slack (if client has Slack channel)
Option 2: Format as email and provide text
Option 3: Generate PDF report (if needed)

DELIVER:
- Client update (formatted)
- Delivery confirmation
- Next check-in scheduled
```

---

## 🔄 Creating Custom Workflows

### Template for New Workflows

Use this structure to create your own workflow templates:

```markdown
### Workflow [ID]: [WORKFLOW_NAME]

**MCPs Required**: [LIST_REQUIRED_MCPS]
**Time**: [ESTIMATED_TIME]
**API Keys Needed**: [LIST_API_KEYS]

**Prompt Template**:
```
[YOUR_WORKFLOW_DESCRIPTION]

INPUTS:
- [INPUT_1]: [DESCRIPTION]
- [INPUT_2]: [DESCRIPTION]

STEPS:
1. [STEP_1_DESCRIPTION]
   - [SUB_STEP_1A]
   - [SUB_STEP_1B]

2. [STEP_2_DESCRIPTION]
   - [SUB_STEP_2A]

3. [STEP_3_DESCRIPTION]

VALIDATION:
- [CHECK_1]
- [CHECK_2]

DELIVER:
- [OUTPUT_1]
- [OUTPUT_2]
- [OUTPUT_3]
```
```

---

## 📊 Workflow Success Metrics

Track your workflow effectiveness:

| Workflow | Uses/Month | Avg Time Saved | Success Rate | Last Used |
|----------|-----------|----------------|--------------|-----------|
| New Project Setup | 4 | 45 min | 100% | 2025-10-15 |
| Quality Validation | 20 | 30 min | 95% | 2025-10-16 |
| Deployment | 8 | 20 min | 100% | 2025-10-14 |
| Competitive Analysis | 2 | 90 min | 100% | 2025-10-10 |
| Status Report | 30 | 15 min | 100% | 2025-10-16 |

---

## 🚀 Next Steps

1. **Choose a workflow** from this document
2. **Customize** with your project details
3. **Run it** in Claude Code or Claude Desktop
4. **Document results** for future reference
5. **Share** successful patterns with team
6. **Create custom workflows** for your specific needs

---

**Remember**: These are templates. Adapt them to your specific Genesis projects, team workflows, and business processes.

**Status**: Ready to Use
**Last Updated**: 2025-10-16
**Version**: 1.0
**Maintained by**: Project Genesis Team
