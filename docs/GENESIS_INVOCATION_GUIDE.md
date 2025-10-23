# Genesis Invocation Guide - Full Power
**Date**: October 23, 2025
**Status**: Skills Verified Working ✅
**For**: New Projects & Existing Project Enhancement

---

## 🎯 What This Guide Covers

1. **Invoking Genesis for NEW projects** - Start from scratch with full Genesis power
2. **Invoking Genesis for EXISTING projects** - Add Genesis to current projects
3. **Maximizing Skills usage** - Get the most from all 16 Genesis skills
4. **Optimal prompting patterns** - How to trigger multi-skill orchestration

---

# PART 1: NEW PROJECT CREATION WITH GENESIS

## 🚀 Method 1: Claude Code (Recommended)

### Step 1: Set Up Project Directory

```bash
# In WSL Terminal
cd ~/projects
mkdir my-new-project
cd my-new-project

# Start Claude Code in this directory
claude
```

### Step 2: Invoke Genesis with Comprehensive Prompt

**For Landing Page Project:**

```
Start a new Genesis landing page project for [BUSINESS TYPE]:

Project Requirements:
- Business: [e.g., "Italian restaurant in downtown"]
- Goal: [e.g., "Lead generation for catering inquiries"]
- Key Features:
  - Hero section with compelling CTA
  - Service/menu showcase
  - Lead capture form
  - Customer testimonials
  - Contact information with map

Technical Setup:
- Supabase database for lead storage
- GoHighLevel CRM integration
- Google Analytics tracking
- Deploy to Netlify

Please use Genesis patterns and set up the complete project structure.
```

**Expected Genesis Response:**
- ✅ Invokes: genesis-core, genesis-landing-page, genesis-supabase, genesis-stack-setup, genesis-deployment
- ✅ Creates complete file structure
- ✅ Generates configuration files
- ✅ Provides setup command sequence
- ✅ Creates database schema
- ✅ Sets up integrations

**For SaaS Application:**

```
Start a new Genesis SaaS application project:

Application Details:
- Name: [e.g., "TaskFlow Pro"]
- Purpose: [e.g., "Team task management with AI suggestions"]
- Target Users: [e.g., "Small teams (5-20 people)"]

Core Features:
- User authentication (email/password + Google OAuth)
- Multi-tenant architecture (organization workspaces)
- AI assistant for task suggestions
- Analytics dashboard
- Team collaboration features
- Subscription management (Stripe)

Technical Requirements:
- Supabase (auth + database with RLS)
- CopilotKit for AI features
- Google Analytics 4
- Comprehensive testing
- Deploy to Netlify

Please use Genesis SaaS patterns and create the complete architecture.
```

**Expected Genesis Response:**
- ✅ Invokes: genesis-core, genesis-saas-app, genesis-supabase, genesis-copilotkit, genesis-analytics, genesis-testing, genesis-deployment
- ✅ Creates multi-tenant database schema
- ✅ Sets up authentication flows
- ✅ Configures RLS policies
- ✅ Integrates CopilotKit patterns
- ✅ Provides complete setup sequence

### Step 3: Follow Genesis Command Sequence

Genesis will provide a command sequence artifact. Execute it:

```bash
# Genesis provides something like:

# Phase 1: Initialize Next.js Project
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Phase 2: Install Dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Phase 3: Configure Environment
# [Genesis creates .env.local with template]

# Phase 4: Create Database Schema
# [Genesis provides SQL to run in Supabase]

# Phase 5: Set up Integration
# [Genesis provides configuration steps]

# Continue through all phases...
```

**Key**: Genesis provides **complete, executable commands** - just follow them in order.

### Step 4: Verify Genesis Setup

```bash
# After following commands, verify structure
ls -la

# Expected Genesis structure:
# app/
# components/
# lib/
# public/
# supabase/
# .env.local
# next.config.js
# package.json
# README.md
```

### Step 5: Connect to Services

Genesis provides connection steps for:

1. **Supabase** - Database and auth setup
2. **GoHighLevel** - CRM integration (if landing page)
3. **CopilotKit** - AI features (if SaaS)
4. **Netlify** - Deployment configuration

Follow Genesis-provided links and configuration steps.

---

## 🎨 Method 2: Claude Desktop (Planning & Architecture)

### Use Case
For **planning and architecture** before coding - especially for complex projects.

### Process

**Step 1: Open Claude Desktop**

**Step 2: Start Architecture Planning**

```
I'm planning a new Genesis project. Help me design the architecture:

Project Type: [Landing Page / SaaS App]
Industry: [e.g., "Healthcare appointment scheduling"]
Complexity: [Simple / Medium / Complex]

Key Requirements:
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

Please help me:
- Choose the right Genesis template
- Design the database schema
- Plan the feature architecture
- Identify integration needs
- Create implementation roadmap
```

**Expected Response:**
- ✅ Genesis-core invoked for template selection
- ✅ Genesis-supabase for schema design
- ✅ Genesis-saas-app or genesis-landing-page for architecture
- ✅ Comprehensive planning document

**Step 3: Export Plan to Claude Code**

Copy the architecture plan from Claude Desktop, then:

```bash
# In WSL Terminal
cd ~/projects/my-new-project
claude

# Paste the plan
"Implement this Genesis architecture:
[PASTE PLAN FROM CLAUDE DESKTOP]"
```

**Benefit**: Complex planning in Desktop, precise implementation in Code.

---

## 📋 Method 3: Genesis Template Repository (Fastest)

### Prerequisites
- Genesis repository on GitHub
- `gh` CLI installed

### Process

```bash
# Create new project from Genesis template
gh repo create my-new-project --template YOUR_USERNAME/project-genesis --private --clone

cd my-new-project

# Choose boilerplate
# For Landing Page:
rm -rf boilerplate/saas-app

# For SaaS App:
rm -rf boilerplate/landing-page

# Move chosen boilerplate to root
mv boilerplate/landing-page/* .
# OR
mv boilerplate/saas-app/* .

# Clean up
rm -rf boilerplate/

# Install dependencies
npm install

# Start Claude Code for customization
claude

# Invoke Genesis for specific features
"Customize this Genesis landing page for [BUSINESS TYPE]:
[YOUR REQUIREMENTS]"
```

**Benefit**: Fastest start with proven structure, customize with Genesis skills.

---

# PART 2: EXISTING PROJECT ENHANCEMENT

## 🔧 Method 1: Add Genesis to Existing React/Next.js Project

### Step 1: Assess Current Project

```bash
# In your existing project directory
cd ~/projects/existing-project

# Start Claude Code
claude
```

### Step 2: Invoke Genesis Migration

```
I have an existing [React / Next.js / other] project that needs Genesis integration.

Current Project:
- Framework: [e.g., "Next.js 14 with App Router"]
- Tech Stack: [current technologies]
- Features: [what currently exists]
- Pain Points: [what needs improvement]

What I Want to Add:
- Supabase database and authentication
- Better form handling with validation
- Analytics tracking
- SEO optimization
- Deployment automation

Please help me integrate Genesis patterns into this existing project without breaking current functionality.
```

**Expected Genesis Response:**
- ✅ Invokes: genesis-migration, genesis-supabase, genesis-forms, genesis-analytics, genesis-seo-optimization, genesis-deployment
- ✅ Creates migration strategy
- ✅ Identifies integration points
- ✅ Provides step-by-step migration plan
- ✅ Ensures backward compatibility

### Step 3: Follow Migration Plan

Genesis provides a safe migration approach:

```bash
# Typical Genesis migration phases:

# Phase 1: Create Genesis Structure (parallel to existing)
mkdir lib/ components/ui/ supabase/

# Phase 2: Add Dependencies
npm install [Genesis dependencies]

# Phase 3: Migrate Feature by Feature
# [Genesis provides specific migration steps]

# Phase 4: Update Configuration
# [Genesis updates config files]

# Phase 5: Test Integration
# [Genesis provides test checklist]

# Phase 6: Deploy Updated Project
# [Genesis deployment steps]
```

---

## ⚡ Method 2: Add Specific Genesis Features

### Use Case
You have a working project but want to add specific Genesis-powered features.

### Examples

**Add Lead Capture Form:**

```
I have a landing page and want to add a Genesis-style lead capture form:

Requirements:
- Form Fields: Name, Email, Phone, Message
- Validation: Client and server-side
- Storage: Save to Supabase 'leads' table
- Integration: Sync to GoHighLevel CRM
- UX: Multi-step form with progress indicator

Use Genesis form patterns and integrate with my existing Next.js app.
```

**Expected:**
- ✅ Invokes: genesis-forms, genesis-supabase, genesis-stack-setup
- ✅ Creates form component with Genesis validation patterns
- ✅ Sets up Supabase table and API route
- ✅ Configures GHL sync
- ✅ Provides integration instructions

**Add Authentication:**

```
Add Genesis authentication to my existing SaaS app:

Current Setup:
- Next.js App Router
- No authentication currently

Requirements:
- Email/password authentication
- Google OAuth
- Protected routes
- User session management
- Profile management page

Use Genesis Supabase auth patterns.
```

**Expected:**
- ✅ Invokes: genesis-supabase, genesis-saas-app
- ✅ Sets up Supabase Auth
- ✅ Creates auth components
- ✅ Implements protected routes
- ✅ Provides configuration steps

**Add AI Features:**

```
Add AI assistant to my application using Genesis CopilotKit patterns:

Application Context:
- Task management app
- Users need AI help with: task prioritization, deadline suggestions, workload balancing

Desired AI Features:
- Copilot sidebar for suggestions
- Inline AI actions on tasks
- Chat interface for task queries

Use Genesis CopilotKit integration patterns.
```

**Expected:**
- ✅ Invokes: genesis-copilotkit
- ✅ Sets up CopilotKit
- ✅ Creates AI actions
- ✅ Implements UI components
- ✅ Provides usage examples

**Add Analytics:**

```
Add comprehensive analytics tracking using Genesis patterns:

Tracking Needs:
- Page views
- Button clicks (all CTAs)
- Form submissions
- Conversion funnel
- User journey tracking

Integration:
- Google Analytics 4
- Custom events
- E-commerce tracking (if applicable)

Use Genesis analytics patterns.
```

**Expected:**
- ✅ Invokes: genesis-analytics
- ✅ Sets up GA4 configuration
- ✅ Creates event tracking functions
- ✅ Implements conversion tracking
- ✅ Provides dashboard setup

---

## 🔄 Method 3: Modernize Legacy Application

### Step 1: Assess Legacy App

```
I have a legacy application I want to modernize using Genesis:

Current State:
- Technology: [e.g., "jQuery + PHP backend"]
- Age: [e.g., "5 years old"]
- Problems: [e.g., "Slow, hard to maintain, no tests"]

Modernization Goals:
- Move to: Next.js with TypeScript
- Add: Modern database (Supabase)
- Improve: Performance, SEO, mobile experience
- Maintain: All existing functionality

Create a Genesis-guided modernization plan.
```

**Expected:**
- ✅ Invokes: genesis-migration, genesis-core, genesis-supabase, genesis-testing
- ✅ Provides phased modernization strategy
- ✅ Creates parallel development plan
- ✅ Ensures zero-downtime transition
- ✅ Provides testing strategy

### Step 2: Implement Phase by Phase

Genesis provides a safe modernization path:

```bash
# Phase 1: New Genesis Project in Parallel
# [Create new Genesis project]

# Phase 2: Migrate Data Layer
# [Move to Supabase with Genesis patterns]

# Phase 3: Rebuild Features with Genesis
# [Feature by feature migration]

# Phase 4: Update Frontend
# [Modern React/Next.js with Genesis components]

# Phase 5: Switch Over
# [Cut over to new application]

# Phase 6: Retire Legacy
# [Deprecate old system]
```

---

# PART 3: MAXIMIZING GENESIS SKILLS

## 💎 Multi-Skill Orchestration

### Understanding Skill Combinations

Genesis skills work best when invoked together. Here are proven combinations:

**Landing Page Project (5 skills):**
```
genesis-core → genesis-landing-page → genesis-supabase → genesis-stack-setup → genesis-deployment
```

**SaaS Application (7 skills):**
```
genesis-core → genesis-saas-app → genesis-supabase → genesis-copilotkit → genesis-analytics → genesis-testing → genesis-deployment
```

**Feature Addition (3-4 skills):**
```
genesis-forms → genesis-supabase → genesis-analytics → genesis-seo-optimization
```

### Optimal Prompting for Multi-Skill

**Structure your prompts:**

```
[MAIN OBJECTIVE] using Genesis patterns:

[PROJECT CONTEXT]
- Current state: [...]
- Technology: [...]

[SPECIFIC REQUIREMENTS]
1. [Feature 1 - triggers skill A]
2. [Feature 2 - triggers skill B]
3. [Feature 3 - triggers skill C]

[INTEGRATIONS NEEDED]
- [Service 1]
- [Service 2]

[DELIVERABLES]
- [What you want to receive]

Please provide complete Genesis implementation.
```

**Example:**

```
Create a complete restaurant booking system using Genesis patterns:

Project Context:
- Business: Family Italian restaurant
- Current: Static website with phone bookings only
- Goal: Online reservation system

Specific Requirements:
1. Landing page with hero section and service showcase
2. Multi-step booking form (date, time, party size, contact info)
3. Database to store reservations
4. Email confirmations to customer and restaurant
5. Admin dashboard to manage bookings
6. SEO optimization for local search

Integrations Needed:
- Supabase (database and auth)
- SendGrid (email notifications)
- Google Analytics (booking funnel)
- Netlify (hosting)

Deliverables:
- Complete Next.js application
- Database schema with RLS
- All components and pages
- Deployment configuration
- Setup instructions

Please provide complete Genesis implementation.
```

**This prompt triggers:**
- genesis-core (project type)
- genesis-landing-page (page structure)
- genesis-forms (booking form)
- genesis-supabase (database + auth)
- genesis-analytics (funnel tracking)
- genesis-seo-optimization (local search)
- genesis-deployment (Netlify)

---

## 🎯 Skill-Specific Invocation

### When You Need Specific Patterns

**Explicit Skill Reference:**

```
Using genesis-[SKILL-NAME] patterns, [YOUR REQUEST]:

[DETAILS]
```

**Examples:**

```
Using genesis-forms patterns, create a multi-step lead capture form:
- Step 1: Contact info (name, email, phone)
- Step 2: Business details (company, industry, size)
- Step 3: Requirements (budget, timeline, services needed)
- Validation: Client and server-side with Zod
- Storage: Supabase with proper typing
- Analytics: Track form abandonment
```

```
Using genesis-supabase patterns, design a multi-tenant database schema for:
- Organizations (workspaces)
- Users (with roles: admin, member, viewer)
- Projects (belonging to organizations)
- Tasks (belonging to projects)
- Include: RLS policies for data isolation
- Include: Audit logging
- Include: Soft delete support
```

```
Using genesis-deployment patterns, set up Netlify deployment for:
- Next.js App Router application
- Environment variables for: Supabase, SendGrid, Stripe
- Serverless functions for API routes
- Preview deployments for pull requests
- Production deployment with custom domain
```

---

## 🔥 Advanced Genesis Usage

### Thread Transitions (Maintain Context)

**When to use:** Moving to a new Claude conversation but want to preserve context.

```
Using genesis-thread-transition patterns, create a comprehensive handoff:

Current Project: [Project name]
Repository: [GitHub URL]
Current Phase: [What you're working on]

Completed:
- [List what's done]

In Progress:
- [Current task]
- [Files being modified]
- [Last command run]

Next Steps:
- [What needs to be done next]

Technical Context:
- Stack: [Technologies]
- Issues: [Any current problems]
- Environment: [Setup details]

Please create a complete transition document for the next conversation.
```

**Genesis provides:**
- Complete project state summary
- File tree with status indicators
- Environment configuration snapshot
- Next action plan
- New thread starter prompt

### Testing Strategy

**Invoke testing patterns:**

```
Using genesis-testing patterns, create a comprehensive test strategy for:

Application: [Your app]
Testing Needs:
- Unit tests for: [Components/functions]
- Integration tests for: [User flows]
- E2E tests for: [Critical paths]
- Performance tests for: [Key pages]

Tech Stack:
- Testing framework: [Jest, Vitest, Cypress]
- Test environment: [Setup]

Please provide:
- Test file structure
- Example test implementations
- CI/CD integration
- Coverage targets
```

### Troubleshooting

**Get Genesis debugging help:**

```
Using genesis-troubleshooting patterns, help me debug:

Issue: [Description]
Error Message: [Full error]
Context: [When it happens]

Current Setup:
- [Technology versions]
- [Configuration]
- [What I've tried]

Expected Behavior: [What should happen]
Actual Behavior: [What's happening]

Please provide systematic debugging approach.
```

---

# PART 4: GENESIS WORKFLOW OPTIMIZATION

## 📊 Workflow Patterns

### Pattern 1: Plan → Implement → Deploy

**Step 1: Architecture (Claude Desktop)**
```
Plan architecture for Genesis [PROJECT TYPE]:
[REQUIREMENTS]
```

**Step 2: Implementation (Claude Code)**
```
Implement this Genesis architecture:
[PASTE PLAN]
```

**Step 3: Deployment (Claude Code)**
```
Using genesis-deployment, deploy to Netlify:
[PROJECT CONTEXT]
```

### Pattern 2: Feature → Test → Integrate

**Step 1: Feature Development**
```
Create [FEATURE] using Genesis patterns:
[REQUIREMENTS]
```

**Step 2: Testing**
```
Using genesis-testing, create tests for [FEATURE]:
[TEST REQUIREMENTS]
```

**Step 3: Integration**
```
Integrate [FEATURE] into existing Genesis project:
[INTEGRATION CONTEXT]
```

### Pattern 3: Migrate → Modernize → Enhance

**Step 1: Migration Plan**
```
Using genesis-migration, plan migration from [OLD] to Genesis:
[CURRENT STATE]
```

**Step 2: Modernize Stack**
```
Modernize to Genesis stack:
[MODERNIZATION GOALS]
```

**Step 3: Add Features**
```
Add Genesis features:
[NEW CAPABILITIES]
```

---

## 🎓 Best Practices

### DO ✅

1. **Be specific about business context**
   - Good: "Italian restaurant in downtown Seattle"
   - Bad: "A restaurant"

2. **List all integrations needed**
   - Mention: Supabase, GHL, CopilotKit, Netlify explicitly
   - Genesis will configure each properly

3. **State your deliverables**
   - "Provide: complete file structure, commands, config"
   - Genesis knows what to include

4. **Reference Genesis explicitly**
   - "Use Genesis patterns"
   - "Following Genesis architecture"
   - Ensures skills are invoked

5. **Provide context for existing projects**
   - Current tech stack
   - What exists already
   - What needs to change

### DON'T ❌

1. **Don't be vague**
   - Bad: "Make it work"
   - Good: "Implement authentication with Supabase following Genesis patterns"

2. **Don't assume Genesis knows your stack**
   - Always state: Next.js version, dependencies, current setup

3. **Don't skip business context**
   - Genesis patterns adapt to industry and use case

4. **Don't request everything at once**
   - Break complex projects into phases
   - Let Genesis guide the sequence

5. **Don't ignore Genesis recommendations**
   - Genesis suggests best practices based on proven patterns
   - Follow the guidance for optimal results

---

## 🚀 Quick Start Templates

### Restaurant Landing Page
```
Start a new Genesis landing page for [RESTAURANT NAME]:
- Type: [Italian/Mexican/Asian/etc.]
- Location: [City]
- Goal: Generate catering leads
- Features: Hero, menu showcase, testimonials, booking form
- Tech: Supabase + GHL + Netlify
- Timeline: [When needed]
```

### SaaS Dashboard
```
Start a new Genesis SaaS app for [APP NAME]:
- Purpose: [What it does]
- Users: [Who uses it]
- Features: Auth, dashboard, [key features]
- Tech: Supabase + CopilotKit + Stripe
- Complexity: [Simple/Medium/Complex]
```

### E-commerce Store
```
Start a new Genesis e-commerce project:
- Products: [What you sell]
- Features: Catalog, cart, checkout, admin
- Payments: Stripe
- Tech: Supabase + Netlify
- Inventory: [Managed how]
```

### Professional Service Site
```
Start a new Genesis landing page for [SERVICE]:
- Industry: [Legal/Consulting/Design/etc.]
- Services: [List services]
- Goal: Lead generation for consultations
- Features: Service pages, case studies, contact form
- Tech: Supabase + GHL + SEO optimization
```

---

## ✅ Success Checklist

After invoking Genesis, verify:

- [ ] Multiple Genesis skills mentioned in response
- [ ] Complete file structure provided
- [ ] Configuration files included
- [ ] Database schema designed (if applicable)
- [ ] Integration setup instructions clear
- [ ] Command sequence executable
- [ ] Deployment steps included
- [ ] Genesis patterns evident in code
- [ ] Best practices followed
- [ ] Documentation generated

---

## 🆘 Troubleshooting Genesis Invocation

### Skills Not Invoking

**Check:**
1. Settings.local.json has "Skill" in permissions
2. Claude Code fully restarted after skills installed
3. Using specific, detailed prompts
4. Mentioning "Genesis" explicitly in prompt

**Fix:** See TROUBLESHOOTING.md in Genesis repository

### Generic Response (Skills Not Recognized)

**Symptom:** Response doesn't mention Genesis skills or patterns

**Fix:** Be more explicit:
```
Using Genesis skills (genesis-core, genesis-landing-page, genesis-supabase), create a [PROJECT]
```

### Incomplete Response

**Symptom:** Only gets partial Genesis implementation

**Fix:** Request completeness:
```
Please provide the COMPLETE Genesis implementation including:
- All files needed
- Full configuration
- Database schema
- Command sequence
- Deployment steps
```

---

## 📚 Additional Resources

**In Genesis Repository:**
- `docs/PROJECT_KICKOFF_CHECKLIST.md` - Step-by-step guide
- `docs/STACK_SETUP.md` - Integration details
- `docs/CLAUDE_CODE_INSTRUCTIONS.md` - Claude Code specific guidance
- `docs/TROUBLESHOOTING.md` - Common issues and fixes

**Skills Location:**
- `~/.claude/skills/genesis/` - All 16 Genesis skills
- Check with: `ls ~/.claude/skills/genesis/*/SKILL.md`

---

## 🎉 You're Ready!

Genesis is now:
- ✅ Finalized and pushed to GitHub
- ✅ Skills working and verified
- ✅ Multi-skill orchestration tested
- ✅ Ready for production use

**Go build something amazing with Genesis!** 🚀

---

*Last Updated: October 23, 2025*
*Genesis Version: 2.0.1*
*Skills: 16 auto-loading skills verified working*
