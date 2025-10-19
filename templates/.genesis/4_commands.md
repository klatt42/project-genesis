# Command History - [Project Name]

**Created**: [Date]  
**Project Type**: [Landing Page / SaaS App]  
**Environment**: WSL/Ubuntu  
**Claude Code Project**: [Directory path]

---

## Command History Purpose

This file maintains a **chronological log of all commands** executed for this project:
- Terminal commands (bash, git, npm, etc.)
- Claude Code commands
- Manual steps that can't be automated
- Checkpoints and verification steps

**Pattern 1: Multi-Phase Task Breakdown** - Tracking progress through project phases.

---

## Progress Indicators

- ⏳ Not started / Queued
- 🔄 In progress / Running
- ✅ Completed successfully
- ❌ Failed (see error details)
- ⏸️ Paused (waiting for input/decision)
- 🔍 Needs verification
- 📍 Current position marker

---

## Command Log Format

```bash
### Phase X.Y: [Task Name]
**Status**: [⏳🔄✅❌⏸️]
**Started**: [Timestamp]
**Completed**: [Timestamp]
**Genesis Reference**: [Relevant Genesis doc section]

# Commands
command-1
command-2

# Verification
[How to verify success]

# Notes
[Any important observations]
```

---

## Phase 1: Project Setup

### Phase 1.1: Genesis Template Clone
**Status**: ✅  
**Started**: [Date/Time]  
**Completed**: [Date/Time]  
**Genesis Reference**: PROJECT_KICKOFF_CHECKLIST.md - GitHub Setup

```bash
# Clone Genesis template to new project
gh repo create [project-name] --template project-genesis --private

# Clone locally
git clone https://github.com/[username]/[project-name]
cd [project-name]

# Verify structure
ls -la
```

**Verification**: 
- ✅ Repository created
- ✅ Genesis structure present (boilerplate/, docs/, etc.)
- ✅ README.md with Genesis template content

**Notes**:
[Any observations about template setup]

---

### Phase 1.2: Boilerplate Selection
**Status**: ✅  
**Started**: [Date/Time]  
**Completed**: [Date/Time]  
**Genesis Reference**: PROJECT_KICKOFF_CHECKLIST.md

```bash
# Remove unused boilerplate
# For Landing Page project:
rm -rf boilerplate/saas-app

# OR for SaaS project:
rm -rf boilerplate/landing-page

# Verify deletion
ls boilerplate/
```

**Verification**:
- ✅ Only relevant boilerplate remains
- ✅ Correct template selected for project type

**Notes**:
Selected [landing-page/saas-app] because [reason]

---

### Phase 1.3: Initial Dependencies
**Status**: ✅  
**Started**: [Date/Time]  
**Completed**: [Date/Time]

```bash
# Install dependencies
npm install

# Verify installation
npm list --depth=0

# Check for vulnerabilities
npm audit
```

**Verification**:
- ✅ node_modules/ created
- ✅ No critical vulnerabilities
- ✅ All packages installed successfully

**Notes**:
[Any package issues or version conflicts]

---

### Phase 1.4: Environment Configuration
**Status**: ✅  
**Started**: [Date/Time]  
**Completed**: [Date/Time]  
**Genesis Reference**: STACK_SETUP.md

```bash
# Create environment file
cp .env.example .env.local

# Edit with actual values
nano .env.local
# (or use code editor)
```

**Environment Variables Configured**:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
# [List other variables]
```

**Verification**:
- ✅ .env.local created
- ✅ .env.local in .gitignore
- ✅ All required variables present

**Notes**:
[Any special configuration notes]

---

## Phase 2: Service Setup

### Phase 2.1: Supabase Project Creation
**Status**: ✅  
**Started**: [Date/Time]  
**Completed**: [Date/Time]  
**Genesis Reference**: STACK_SETUP.md - Supabase Setup

```bash
# Manual step: Create Supabase project at supabase.com
# Project name: [project-name]
# Region: [selected region]
# Password: [stored in password manager]

# Note credentials:
# Project URL: [URL]
# Anon key: [key]
# Service role key: [key]
```

**Verification**:
- ✅ Supabase project created
- ✅ Credentials saved securely
- ✅ Environment variables updated

**Notes**:
Project ID: [project-id]

---

### Phase 2.2: Database Schema Implementation
**Status**: ✅  
**Started**: [Date/Time]  
**Completed**: [Date/Time]  
**Genesis Reference**: [Specific Genesis pattern or custom]

```sql
-- Run in Supabase SQL Editor

-- Table 1: [table_name]
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  [columns]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: [table_name]
[SQL]

-- RLS Policies
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "[policy_name]"
  ON [table_name]
  FOR [SELECT/INSERT/UPDATE/DELETE]
  TO authenticated
  USING ([condition]);
```

**Verification**:
- ✅ All tables created
- ✅ RLS enabled on all tables
- ✅ Policies tested

**Notes**:
[Schema design decisions or deviations from Genesis]

---

### Phase 2.3: [External Service] Setup
**Status**: 🔄  
**Started**: [Date/Time]  
**Genesis Reference**: STACK_SETUP.md - [Service] Integration

```bash
# Service account creation
# Manual: Create account at [service-url]
# Note API key: [location stored]

# Test connection (if applicable)
curl -X GET [test-endpoint] \
  -H "Authorization: Bearer [api-key]"

# Add to environment variables
echo "SERVICE_API_KEY=[key]" >> .env.local
```

**Verification**:
- ✅ Account created
- ✅ API key obtained
- 🔍 Connection test pending

**Notes**:
[Service-specific setup notes]

---

## Phase 3: Development

### Phase 3.1: Claude Code Initialization
**Status**: ✅  
**Started**: [Date/Time]  
**Completed**: [Date/Time]  
**Genesis Reference**: CLAUDE_CODE_INSTRUCTIONS.md

```bash
# Initialize Claude Code in project
cd /path/to/project
claude-code init

# Verify initialization
ls -la .claude/
```

**Verification**:
- ✅ .claude/ directory created
- ✅ Claude Code config present

---

### Phase 3.2: Component Development
**Status**: 🔄  
**Started**: [Date/Time]  
**Genesis Reference**: COMPONENT_LIBRARY.md

```bash
# Claude Code command for component creation
claude-code "Create [ComponentName] component following Genesis patterns from COMPONENT_LIBRARY.md with [requirements]"

# After generation, review and test
npm run dev
# Test component at http://localhost:5173
```

**Components Created**:
- ✅ [Component1]: [Purpose]
- 🔄 [Component2]: [Purpose] - In progress
- ⏳ [Component3]: [Purpose] - Queued

**Verification**:
- 🔍 Component renders correctly
- 🔍 Responsive on mobile
- 🔍 TypeScript types correct

**Notes**:
📍 CURRENT POSITION: Implementing [Component2]

---

### Phase 3.3: Supabase Integration
**Status**: ⏳  
**Genesis Reference**: STACK_SETUP.md - Supabase Client

```bash
# Create Supabase client utilities
claude-code "Create Supabase client configuration in lib/supabase-client.ts following STACK_SETUP.md pattern"

# Create database query functions
claude-code "Create database query functions for [table_name] with TypeScript types"
```

**Integration Points**:
- ⏳ Client setup
- ⏳ Query functions
- ⏳ Real-time subscriptions (if needed)
- ⏳ Error handling

---

### Phase 3.4: Form Implementation
**Status**: ⏳  
**Genesis Reference**: LANDING_PAGE_TEMPLATE.md - Lead Capture Form

```bash
# Create form component
claude-code "Create [FormName] form that collects [fields], validates input, submits to Supabase [table], and shows success/error states following Genesis form pattern"

# Test form submission
# Manual: Fill out form and verify:
# - Validation works
# - Data appears in Supabase
# - Success message displays
```

**Forms to Implement**:
- ⏳ [Form1]: [Purpose]
- ⏳ [Form2]: [Purpose]

---

### Phase 3.5: [External Service] Integration
**Status**: ⏳  
**Genesis Reference**: STACK_SETUP.md - [Service] Integration

```bash
# Create integration module
claude-code "Create [service] integration in lib/[service]-integration.ts with API client, error handling, and TypeScript types"

# Create webhook handler (if applicable)
claude-code "Create Netlify function for [service] webhook at netlify/functions/[service]-webhook.ts with signature verification and event processing"
```

**Integration Steps**:
- ⏳ API client created
- ⏳ Error handling implemented
- ⏳ Webhook handler (if needed)
- ⏳ Test with real data

---

## Phase 4: Testing

### Phase 4.1: Manual Testing
**Status**: ⏳  
**Started**: [Date/Time]

```bash
# Start development server
npm run dev

# Manual test checklist:
# - [ ] All pages load
# - [ ] Forms submit correctly
# - [ ] Data appears in Supabase
# - [ ] External integrations work
# - [ ] Mobile responsive
# - [ ] Error states display
```

**Test Results**:
[Document test outcomes]

---

### Phase 4.2: Integration Testing
**Status**: ⏳

```bash
# If using automated tests
npm run test

# Or manual integration testing
# - [ ] End-to-end user flows
# - [ ] Supabase RLS working
# - [ ] API integrations functional
# - [ ] Webhook processing correct
```

---

### Phase 4.3: Performance Testing
**Status**: ⏳

```bash
# Build production version
npm run build

# Preview production build
npm run preview

# Run Lighthouse audit
# Manual: Open Chrome DevTools > Lighthouse
# Target: Score > 90

# Check bundle size
npm run build
# Review dist/ size
```

**Performance Metrics**:
- ⏳ Lighthouse Score: [score]
- ⏳ Bundle Size: [size]
- ⏳ Initial Load Time: [time]

---

## Phase 5: Deployment

### Phase 5.1: Netlify Setup
**Status**: ⏳  
**Genesis Reference**: DEPLOYMENT_GUIDE.md

```bash
# Connect repository to Netlify (manual step)
# 1. Log in to Netlify
# 2. New site from Git
# 3. Select repository
# 4. Configure build settings:
#    - Build command: npm run build
#    - Publish directory: dist

# Or use Netlify CLI
npm install -g netlify-cli
netlify login
netlify init
```

**Netlify Configuration**:
- ⏳ Site connected
- ⏳ Build settings configured
- ⏳ Environment variables added
- ⏳ Custom domain configured (optional)

---

### Phase 5.2: Environment Variables (Production)
**Status**: ⏳  
**Genesis Reference**: DEPLOYMENT_GUIDE.md - Environment Variables

```bash
# Add environment variables in Netlify dashboard
# Navigate to: Site Settings > Environment Variables

# Required variables:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - [SERVICE]_API_KEY
# - [Other variables]

# Or use Netlify CLI
netlify env:set VITE_SUPABASE_URL "[value]"
netlify env:set VITE_SUPABASE_ANON_KEY "[value]"
```

**Verification**:
- ⏳ All variables added
- ⏳ No typos in variable names
- ⏳ Values match production services

---

### Phase 5.3: Initial Deployment
**Status**: ⏳

```bash
# Push to main branch triggers deployment
git add .
git commit -m "Initial production deployment"
git push origin main

# Monitor deployment
# Check Netlify dashboard for build progress

# Or manual deployment
netlify deploy --prod
```

**Deployment Checklist**:
- ⏳ Build successful
- ⏳ Site accessible at Netlify URL
- ⏳ All features working in production
- ⏳ No console errors
- ⏳ External integrations connected

**Production URL**: [URL when deployed]

---

### Phase 5.4: Post-Deployment Verification
**Status**: ⏳

```bash
# Test production site
# - [ ] All pages load correctly
# - [ ] Forms submit to production Supabase
# - [ ] External services working
# - [ ] Mobile responsive
# - [ ] No browser console errors

# Check analytics (if configured)
# - [ ] Tracking code firing
# - [ ] Events recording

# Monitor errors
# Check Netlify functions logs for any issues
```

---

## Phase 6: Monitoring & Maintenance

### Phase 6.1: Error Monitoring Setup
**Status**: ⏳

```bash
# If using error tracking service
npm install @sentry/react
# Configure in application

# Or rely on Netlify function logs
# Check at: Netlify Dashboard > Functions > Logs
```

---

### Phase 6.2: Performance Monitoring
**Status**: ⏳

```bash
# Regular Lighthouse audits
# Schedule: [frequency]

# Check Netlify Analytics
# Monitor: Traffic, bandwidth, function invocations
```

---

## Utility Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Git Commands
```bash
# Check status
git status

# Create feature branch
git checkout -b feature/[feature-name]

# Commit changes
git add .
git commit -m "[descriptive message]"

# Push to remote
git push origin [branch-name]

# Pull latest changes
git pull origin main
```

### Supabase (if using CLI)
```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Stop local Supabase
supabase stop
```

### Claude Code Common Commands
```bash
# Initialize
claude-code init

# Run task
claude-code "[task description following Genesis pattern]"

# Common task patterns:
claude-code "Implement [feature] following [GENESIS_DOC.md] pattern"
claude-code "Fix [issue] in [file]"
claude-code "Add [component] with [requirements]"
claude-code "Deploy to Netlify following DEPLOYMENT_GUIDE.md"
```

---

## Command Execution Notes

### Failed Commands Log
Document any commands that failed and how they were resolved:

```bash
### Failed: [Date/Time]
Command: [command that failed]
Error: [error message]
Cause: [root cause]
Solution: [how it was fixed]
Reference: .genesis/5_errors.md for details
```

---

### Commands Requiring Manual Steps
Some tasks can't be fully automated:

- [ ] **Supabase project creation**: Must use web dashboard
- [ ] **Netlify site connection**: Must use web dashboard initially
- [ ] **External service accounts**: Manual signup required
- [ ] **Custom domain DNS**: Manual DNS configuration
- [ ] **[Other manual steps]**

---

## Current Position Tracker

**📍 CURRENT PHASE**: Phase [X.Y]  
**📍 CURRENT TASK**: [Specific task name]  
**📍 LAST COMMAND**: [Last executed command]  
**📍 NEXT ACTION**: [What needs to happen next]  
**📍 GENESIS REFERENCE**: [Currently following this doc/section]

**Last Updated**: [Date/Time]

---

## Command History Summary

**Total Commands Executed**: [Count]  
**Phases Completed**: [X] / [Total]  
**Current Phase Progress**: [X]%  
**Estimated Remaining**: [Time estimate]

**Most Common Commands**:
1. [Command] - Used [X] times
2. [Command] - Used [X] times
3. [Command] - Used [X] times

---

## Quick Reference: Commands by Phase

| Phase | Key Commands |
|-------|-------------|
| Setup | `gh repo create`, `npm install`, `cp .env.example` |
| Development | `claude-code "..."`, `npm run dev` |
| Testing | `npm run build`, `npm run preview` |
| Deployment | `git push`, `netlify deploy` |

---

## Terminal Sessions

### Session 1: [Date]
**Duration**: [Start - End]  
**Tasks Completed**: [List]  
**Commands Run**: [Count]

### Session 2: [Date]
**Duration**: [Start - End]  
**Tasks Completed**: [List]  
**Commands Run**: [Count]

[Continue logging sessions]

---

## WSL & Claude Code Environment Info

**WSL Terminal Path**: 
```bash
cd /mnt/c/Users/[username]/projects/[project-name]
# Or wherever project is located
```

**Claude Code Project Path**:
```bash
cd /path/to/[project-name]
claude-code init
```

**Restart Commands** (for new terminal):
```bash
# WSL Terminal
cd /path/to/project
npm run dev  # If continuing development

# Claude Code
cd /path/to/project
claude-code init
```

---

**Last Command Executed**: [Command]  
**Timestamp**: [Date/Time]  
**Execution Status**: [Success/Failure]
