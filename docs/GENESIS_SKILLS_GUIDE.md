# Genesis Skills Guide - When and How to Use Skills

## Overview
Comprehensive guide on Genesis Skills invocation patterns, trigger recognition, and multi-skill workflows.

## Skills Invocation Pattern

### Correct Pattern (Use Skill Tool)
```typescript
// Correct: Invoke skill using Skill tool
Skill({ command: 'genesis-core' })
Skill({ command: 'genesis-saas-app' })
```

### Incorrect Pattern (Don't Use Task Tool)
```typescript
// Incorrect: Using generic Task tool
Task({ subagent_type: 'general-purpose', description: '...' })
```

## Skills Catalog & Trigger Recognition

### 1. genesis-core P ALWAYS START HERE
**When to invoke**: At project start, any mention of 'Genesis project' or 'new project'
**Trigger phrases**: 'Genesis', 'new project', 'start project', 'Genesis template'
**What it provides**:
- Project type decision tree (SaaS vs Landing Page)
- Master workflow guidance
- Points to next appropriate skills

**Invocation**:
```typescript
Skill({ command: 'genesis-core' })
```

### 2. genesis-saas-app PPP CRITICAL FOR SAAS
**When to invoke**: Building multi-tenant SaaS applications
**Trigger phrases**: 'saas', 'multi-tenant', 'dashboard', 'user accounts', 'authentication'
**What it provides**:
- Multi-tenant database patterns with user_id + RLS
- Authentication flow patterns (Supabase Auth)
- Protected route patterns (middleware)
- CRUD operation templates with automatic RLS filtering
- Dashboard structure and file organization

**Critical patterns**:
```sql
-- Pattern: User-isolated RLS policy
create policy 'Users can CRUD own projects'
  on projects for all
  using (auth.uid() = user_id);
```

**Invocation**:
```typescript
Skill({ command: 'genesis-saas-app' })
```

### 3. genesis-landing-page PPP CRITICAL FOR LANDING PAGES
**When to invoke**: Building lead generation or marketing sites
**Trigger phrases**: 'landing page', 'lead generation', 'marketing site', 'lead capture'
**What it provides**:
- Landing page component patterns (Hero, Lead Form, Social Proof, Features, FAQ, CTA)
- Form submission with CRM integration
- Conversion optimization patterns
- Thank you page flows

**Invocation**:
```typescript
Skill({ command: 'genesis-landing-page' })
```

### 4. genesis-supabase PP ESSENTIAL FOR DATABASE
**When to invoke**: Creating database schema, tables, RLS policies
**Trigger phrases**: 'database', 'schema', 'table', 'RLS', 'supabase', 'migration'
**What it provides**:
- Schema-first design patterns for multi-tenant
- Standard RLS policy templates (SELECT, INSERT, UPDATE, DELETE)
- Common field type patterns
- Supabase CLI migration commands
- RLS troubleshooting patterns

**Critical patterns**:
```sql
-- Pattern: Insert policy with user_id check
create policy 'Users can insert own data'
  on [table] for insert
  with check (auth.uid() = user_id);
```

**Invocation**:
```typescript
Skill({ command: 'genesis-supabase' })
```

### 5. genesis-troubleshooting PP USE IMMEDIATELY ON ERRORS
**When to invoke**: ANY error, bug, or unexpected behavior
**Trigger phrases**: 'error', 'not working', 'debug', '403', '401', 'infinite recursion', 'policy issue'
**What it provides**:
- Supabase RLS debugging SQL commands
- Common error fixes (infinite recursion, policy conflicts)
- Service role vs anon key patterns
- Systematic debugging workflows

**Critical debugging SQL**:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- View existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test policy as specific user
SET request.jwt.claims = '{"sub":"user-id-here"}';
SELECT * FROM your_table;
```

**Invocation**:
```typescript
// Invoke IMMEDIATELY when encountering errors
Skill({ command: 'genesis-troubleshooting' })
```

### 6. genesis-stack-setup P USE FOR ENVIRONMENT SETUP
**When to invoke**: Setting up .env, configuring Supabase client, initial project setup
**Trigger phrases**: 'setup', 'configuration', 'environment', '.env', 'credentials'
**What it provides**:
- Environment variable configuration patterns
- Supabase client setup (client, server, middleware)
- Proper credential management
- Initial Next.js + Supabase integration

**Invocation**:
```typescript
Skill({ command: 'genesis-stack-setup' })
```

### 7. genesis-copilotkit P USE FOR AI FEATURES
**When to invoke**: Adding AI capabilities, chat interfaces, AI-powered features
**Trigger phrases**: 'AI', 'copilot', 'chat', 'AI-powered', 'LLM integration'
**What it provides**:
- CopilotKit integration patterns
- AI action patterns
- Chat interface patterns
- AI use case patterns

**Invocation**:
```typescript
Skill({ command: 'genesis-copilotkit' })
```

### 8. genesis-testing P USE IN PHASE 2+
**When to invoke**: Setting up tests, test patterns, quality assurance
**Trigger phrases**: 'test', 'testing', 'quality', 'QA', 'validation'
**What it provides**:
- Test setup patterns (Jest, React Testing Library)
- Unit test patterns
- Integration test patterns
- E2E test patterns

**Invocation**:
```typescript
Skill({ command: 'genesis-testing' })
```

### 9. genesis-deployment P USE FOR PRODUCTION
**When to invoke**: Deploying to Netlify, Vercel, or other platforms
**Trigger phrases**: 'deploy', 'deployment', 'production', 'netlify', 'vercel'
**What it provides**:
- Netlify deployment patterns
- Environment configuration for production
- CI/CD setup
- Deployment checklists

**Invocation**:
```typescript
Skill({ command: 'genesis-deployment' })
```

### Skills NOT Typically Needed
- **genesis-forms**: Use if complex form validation needed (otherwise use react-hook-form directly)
- **genesis-analytics**: Use in Phase 4+ for analytics integration
- **genesis-seo-optimization**: Use post-launch for SEO
- **genesis-migration**: For migrating between platforms (advanced)
- **genesis-commands**: Provides command templates (usually covered in other docs)
- **genesis-archon**: Advanced orchestration features
- **genesis-thread-transition**: For thread context management (meta-usage)

## Multi-Skill Workflows

### Workflow 1: New SaaS Project (COMPLETE SEQUENCE)
```typescript
// Step 1: Determine project type
Skill({ command: 'genesis-core' })
// Response: 'This is a SaaS application'

// Step 2: Get SaaS patterns
Skill({ command: 'genesis-saas-app' })
// Response: Multi-tenant patterns, auth flows, RLS templates

// Step 3: Set up database
Skill({ command: 'genesis-supabase' })
// Response: Schema patterns, RLS policies, migration commands

// Step 4: Configure environment
Skill({ command: 'genesis-stack-setup' })
// Response: .env setup, Supabase clients

// During development - if error occurs:
Skill({ command: 'genesis-troubleshooting' })
// Response: Systematic debugging steps
```

### Workflow 2: New Landing Page Project
```typescript
// Step 1: Determine project type
Skill({ command: 'genesis-core' })
// Response: 'This is a Landing Page'

// Step 2: Get landing page patterns
Skill({ command: 'genesis-landing-page' })
// Response: Component patterns, lead capture, CRM integration

// Step 3: Set up lead capture database
Skill({ command: 'genesis-supabase' })
// Response: Simple leads table schema

// Step 4: Configure environment
Skill({ command: 'genesis-stack-setup' })
// Response: .env setup, Supabase + CRM credentials
```

### Workflow 3: Adding AI Features to Existing Project
```typescript
// Step 1: Get AI integration patterns
Skill({ command: 'genesis-copilotkit' })
// Response: CopilotKit setup, AI action patterns

// Step 2: If adding AI-generated data to database
Skill({ command: 'genesis-supabase' })
// Response: Schema for AI-generated content

// Step 3: Add tests for AI features
Skill({ command: 'genesis-testing' })
// Response: Test patterns for AI actions
```

## Recognition Triggers Table

| Your Words                                  | Auto-Invoke Skill           |
|---------------------------------------------|-----------------------------|
| 'Genesis project', 'new project'            | genesis-core                |
| 'saas', 'multi-tenant', 'dashboard'         | genesis-saas-app            |
| 'landing page', 'lead generation'           | genesis-landing-page        |
| 'database', 'schema', 'RLS', 'supabase'     | genesis-supabase            |
| 'error', 'not working', 'debug', '403'      | genesis-troubleshooting     |
| 'setup', 'configuration', '.env'            | genesis-stack-setup         |
| 'AI', 'copilot', 'chat', 'AI-powered'       | genesis-copilotkit          |
| 'test', 'testing', 'QA'                     | genesis-testing             |
| 'deploy', 'production', 'netlify'           | genesis-deployment          |

## When Skills ARE Working Correctly

You'll see this output:
```
<command-message>The 'genesis-saas-app' skill is loading...</command-message>
```

Then the skill's patterns will expand and provide detailed instructions.

## Benefits of Proper Skill Usage

### Time Savings
- **Without skills**: 3+ hours debugging RLS with 6 migrations
- **With skills**: ~2 hours with 2-3 migrations (proven from my-erp-plan analysis)

### Code Quality
- Pre-built patterns = fewer bugs
- Battle-tested RLS policies = secure by default
- Systematic troubleshooting = faster debugging

### Consistency
- All projects use same proven patterns
- Easier to maintain multiple projects
- Knowledge transfers between projects

## Common Mistakes to Avoid

### L Mistake 1: Using Task Tool Instead of Skill Tool
```typescript
// WRONG
Task({ subagent_type: 'general-purpose', description: 'Build SaaS app' })

// CORRECT
Skill({ command: 'genesis-saas-app' })
```

### L Mistake 2: Not Invoking Troubleshooting Skill on Errors
```typescript
// WRONG: Trying to debug manually
// 'Hmm, getting 403 error, let me try changing the policy...'

// CORRECT: Invoke troubleshooting skill immediately
Skill({ command: 'genesis-troubleshooting' })
```

### L Mistake 3: Skipping genesis-core at Project Start
```typescript
// WRONG: Jumping directly to implementation
Skill({ command: 'genesis-saas-app' })

// CORRECT: Start with core for project type decision
Skill({ command: 'genesis-core' })
Skill({ command: 'genesis-saas-app' })
```

### L Mistake 4: Not Using Multi-Skill Sequences
```typescript
// WRONG: Only using one skill
Skill({ command: 'genesis-saas-app' })
// Then manually figuring out database schema

// CORRECT: Use skill sequence
Skill({ command: 'genesis-saas-app' })
Skill({ command: 'genesis-supabase' })
Skill({ command: 'genesis-stack-setup' })
```

## Quick Reference: 'I Need To...' ’ 'Invoke This Skill'

- **'I need to start a new Genesis project'** ’ genesis-core
- **'I need to build a SaaS app'** ’ genesis-saas-app
- **'I need to create a landing page'** ’ genesis-landing-page
- **'I need to set up the database'** ’ genesis-supabase
- **'I'm getting an error'** ’ genesis-troubleshooting
- **'I need to configure environment variables'** ’ genesis-stack-setup
- **'I need to add AI features'** ’ genesis-copilotkit
- **'I need to deploy'** ’ genesis-deployment
- **'I need to add tests'** ’ genesis-testing

## Advanced: Custom Skill Invocation Patterns

### Pattern: Error Recovery Workflow
```typescript
// 1. Error occurs during development
Skill({ command: 'genesis-troubleshooting' })

// 2. If RLS-related error
Skill({ command: 'genesis-supabase' })  // Get correct RLS patterns

// 3. Apply fix and test
// 4. If still broken, invoke troubleshooting again
Skill({ command: 'genesis-troubleshooting' })
```

### Pattern: Feature Addition Workflow
```typescript
// 1. Determine feature type
// 'I want to add AI-powered report generation'

// 2. Invoke relevant skills in sequence
Skill({ command: 'genesis-copilotkit' })      // AI patterns
Skill({ command: 'genesis-supabase' })        // Database schema for reports
Skill({ command: 'genesis-saas-app' })        // CRUD patterns for reports

// 3. Implement feature using patterns from all skills
```

## Summary: Skills-First Development

### The Golden Rule
**ALWAYS check Genesis Skills BEFORE writing custom code**

### The Workflow
1. **Start**: Invoke genesis-core
2. **Build**: Invoke project-type skill (genesis-saas-app OR genesis-landing-page)
3. **Database**: Invoke genesis-supabase
4. **Configure**: Invoke genesis-stack-setup
5. **On Error**: Invoke genesis-troubleshooting IMMEDIATELY
6. **Add Features**: Invoke relevant skills (copilotkit, testing, etc.)
7. **Deploy**: Invoke genesis-deployment

### The Mindset Shift
- **Old way**: 'Let me write this from scratch'
- **New way**: 'Which Genesis Skill has the pattern I need?'

The skills exist to save you time and provide battle-tested patterns. Use them liberally and early in every project.
