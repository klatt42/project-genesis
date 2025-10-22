# Prompt Library - [Project Name]

**Created**: [Date]  
**Project Type**: [Landing Page / SaaS App]  
**Genesis Template**: [Boilerplate used]

---

## Prompt Library Purpose

This file captures **prompts that worked exceptionally well** for this specific project. These prompts:
- Generated high-quality code or solutions
- Saved significant debugging time
- Solved complex problems elegantly
- Can be reused for similar features

**Pattern 3: Structured Note-Taking** - Building a reusable knowledge base for this project and future Genesis projects.

---

## How to Use This Library

1. **Find Similar Task**: Look for prompts matching your current need
2. **Customize Context**: Replace [placeholders] with your specifics
3. **Add Genesis Reference**: Include relevant Genesis doc if applicable
4. **Document Results**: Note what the prompt generated
5. **Add New Prompts**: When Claude generates great output, capture the prompt

---

## Setup & Configuration Prompts

### Prompt: Initial Genesis Setup
```
I'm starting a new [Landing Page / SaaS App] project using Project Genesis.

Project: [Name]
Goal: [Brief description]
Stack: Supabase + [other services]

Please:
1. Identify which Genesis template to use
2. Create comprehensive setup commands artifact
3. Include all checkpoints from PROJECT_KICKOFF_CHECKLIST.md
4. Reference relevant Genesis documentation

I'll be working in WSL/Ubuntu environment.
```

**When to Use**: Beginning any new Genesis project  
**Result Expected**: Complete setup command sequence with Genesis references  
**Genesis Docs Referenced**: All primary docs

---

### Prompt: Supabase Schema Design
```
I need a Supabase schema for [describe feature/data needs].

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Please:
1. Design the schema following Genesis best practices
2. Include RLS policies
3. Provide migration SQL
4. Explain the design decisions
5. Note any Genesis pattern deviations

Reference: STACK_SETUP.md - Supabase section
```

**When to Use**: Designing database tables  
**Result Expected**: Complete schema with RLS policies and rationale  
**What Worked**: Being specific about requirements and requesting explanation

---

### Prompt: Environment Variable Setup
```
I need to configure environment variables for:
- Supabase (anon key, URL, service role key)
- [External service]
- [External service]

Please create:
1. .env.local template with all required variables
2. Netlify environment variable checklist
3. Documentation for team members
4. Security notes for each variable

Follow Genesis security best practices.
```

**When to Use**: Setting up environment configuration  
**Result Expected**: Complete .env template with security guidance  
**Genesis Reference**: DEPLOYMENT_GUIDE.md

---

## Component Development Prompts

### Prompt: Create Component Following Genesis Pattern
```
Create a [component name] component following Genesis patterns.

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Please:
1. Check COMPONENT_LIBRARY.md for existing patterns
2. Use TypeScript with proper typing
3. Include loading and error states
4. Add comments referencing Genesis source
5. Make it responsive using Tailwind

If no Genesis pattern exists, note this for Genesis update.
```

**When to Use**: Creating any new component  
**Result Expected**: Production-ready component with Genesis references  
**Success Factor**: Explicitly requesting Genesis pattern check first

---

### Prompt: Form with Supabase Integration
```
Create a [form purpose] form that:
- Collects: [list fields]
- Validates: [validation requirements]
- Submits to Supabase table: [table name]
- Shows success/error states
- [Optional: Integrates with external service]

Following Genesis form patterns from LANDING_PAGE_TEMPLATE.md.

Please include:
1. Form component with validation
2. Supabase insert function
3. Error handling
4. Loading states
5. Success feedback to user
```

**When to Use**: Any form creation  
**Result Expected**: Complete form with validation and database integration  
**What Worked**: Specifying all states (loading, error, success)

---

## Integration Prompts

### Prompt: External Service Integration
```
I need to integrate [Service Name] API.

Use Case: [What we're trying to accomplish]
API Documentation: [Link if available]

Please:
1. Check STACK_SETUP.md for Genesis integration pattern
2. Create integration file: lib/[service]-integration.ts
3. Include error handling and retry logic
4. Add TypeScript types for API responses
5. Provide usage examples
6. Document rate limits and security considerations

If this is a new integration, document for Genesis update.
```

**When to Use**: Integrating any external API  
**Result Expected**: Complete integration module with error handling  
**Genesis Update**: Note if pattern should be added to STACK_SETUP.md

---

### Prompt: Webhook Handler
```
Create a webhook handler for [service] that:
- Receives: [event type]
- Validates: [signature/security check]
- Processes: [what to do with data]
- Updates: [which Supabase table]

Please include:
1. Netlify function for webhook endpoint
2. Signature verification
3. Event processing logic
4. Error handling and logging
5. Response format

Reference Genesis webhook patterns if available.
```

**When to Use**: Setting up webhooks  
**Result Expected**: Secure webhook handler with validation  
**Security Focus**: Explicitly requesting signature verification

---

## CopilotKit Integration Prompts

### Prompt: CopilotKit Action Implementation
```
Implement a CopilotKit action for [feature description].

User Goal: [What user wants to accomplish]
Context Needed: [What data/state the action needs]

Following COPILOTKIT_PATTERNS.md - [specific pattern section]

Please:
1. Create the action definition
2. Implement the handler logic
3. Add proper TypeScript types
4. Include error handling
5. Provide usage example in component
6. Document expected behavior

Note any deviations from Genesis patterns.
```

**When to Use**: Adding AI-powered features  
**Result Expected**: Complete CopilotKit action with usage example  
**Genesis Reference**: COPILOTKIT_PATTERNS.md

---

## Debugging Prompts

### Prompt: Debug Supabase Query Issue
```
I'm getting an error with this Supabase query:

[Paste error message]

Query code:
[Paste code]

Context:
- Table: [table name]
- RLS enabled: [yes/no]
- Expected: [what should happen]
- Actual: [what's happening]

Please:
1. Diagnose the issue
2. Check if it's RLS-related
3. Provide corrected code
4. Explain what was wrong
5. Add to .genesis/5_errors.md
```

**When to Use**: Supabase query errors  
**Result Expected**: Fixed query with explanation  
**Success Factor**: Including full context (table, RLS status, expected behavior)

---

### Prompt: Fix TypeScript Type Error
```
I have a TypeScript error:

[Paste error message]

Code:
[Paste code snippet]

Please:
1. Identify the type mismatch
2. Provide corrected types
3. Explain the fix
4. Suggest if types should be added to types/ directory
```

**When to Use**: TypeScript errors  
**Result Expected**: Corrected types with explanation  
**Learning Opportunity**: Understanding type system better

---

## Deployment Prompts

### Prompt: Pre-Deployment Checklist
```
I'm ready to deploy [project name] to production.

Please create a comprehensive pre-deployment checklist covering:
1. Environment variables verification
2. Supabase production configuration
3. Security checks
4. Performance validation
5. Testing confirmation
6. External service production keys

Follow DEPLOYMENT_GUIDE.md checklist and add project-specific items.
```

**When to Use**: Before first deployment or major updates  
**Result Expected**: Complete checklist with Genesis + project-specific items  
**Genesis Reference**: DEPLOYMENT_GUIDE.md

---

### Prompt: Netlify Configuration
```
Create Netlify configuration for this project:

Build: [command]
Publish: [directory]
Functions: [if needed]
Redirects: [if needed]

Please provide:
1. netlify.toml file
2. Environment variable setup instructions
3. Custom domain configuration (if applicable)
4. Build settings explanation

Follow Genesis Netlify patterns.
```

**When to Use**: Setting up Netlify deployment  
**Result Expected**: Complete netlify.toml with documentation  
**Genesis Reference**: DEPLOYMENT_GUIDE.md - Netlify section

---

## Testing Prompts

### Prompt: Integration Test Coverage
```
Create integration tests for [feature name].

Test scenarios:
- [Scenario 1]
- [Scenario 2]
- [Scenario 3]

Please:
1. Write tests using [testing library]
2. Mock external services
3. Test happy path and error cases
4. Include setup and teardown
5. Document test data requirements
```

**When to Use**: Adding test coverage  
**Result Expected**: Comprehensive test file  
**Best Practice**: Testing both success and failure paths

---

## Optimization Prompts

### Prompt: Performance Optimization
```
Analyze performance of [specific feature/page] and optimize.

Current issues:
- [Issue 1: e.g., slow load time]
- [Issue 2: e.g., large bundle size]

Please:
1. Identify performance bottlenecks
2. Suggest optimizations
3. Implement improvements
4. Measure before/after impact
5. Document changes for team

Target: Lighthouse score > 90
```

**When to Use**: Performance issues  
**Result Expected**: Optimized code with measurements  
**Metrics Focus**: Including target scores

---

## Documentation Prompts

### Prompt: Feature Documentation
```
Document the [feature name] implementation for team handoff.

Include:
1. Feature overview and purpose
2. Architecture/design decisions
3. Key files and their roles
4. API/integration details
5. Testing approach
6. Known limitations
7. Future enhancement possibilities

This will go in project docs/ directory.
```

**When to Use**: Completing a major feature  
**Result Expected**: Comprehensive feature documentation  
**Handoff Ready**: Makes knowledge transfer easy

---

### Prompt: API Documentation
```
Generate API documentation for [endpoint/service].

Include:
1. Endpoint URL and method
2. Request parameters (query, body)
3. Response format
4. Error responses
5. Authentication requirements
6. Rate limits
7. Example requests/responses

Format as OpenAPI/Swagger spec if possible.
```

**When to Use**: Documenting APIs for internal or external use  
**Result Expected**: Complete API specification  
**Standard Format**: Requesting OpenAPI format ensures consistency

---

## Thread Transition Prompts

### Prompt: Generate Thread Transition Summary
```
Create a comprehensive thread transition summary for [project name].

Current status:
- Phase: [current phase]
- Last completed: [last task]
- In progress: [current work]
- Next up: [upcoming tasks]

Please generate complete transition artifact following Genesis pattern:
1. Project identity and context
2. Genesis documentation status
3. Technical environment state
4. File structure and completion status
5. Checklist progress
6. Completed tasks with Genesis references
7. Current position and next steps
8. Genesis update notes

Save to .genesis/7_handoff.md
```

**When to Use**: Before closing this thread  
**Result Expected**: Complete handoff document  
**Genesis Pattern**: Pattern 3 - Structured Note-Taking

---

## Project-Specific Effective Prompts

### Prompt: [Feature/Task Name]
```
[Exact prompt that worked well]
```

**When to Use**: [Situation]  
**Result Expected**: [What it generated]  
**Why It Worked**: [What made this prompt effective]  
**Genesis Reference**: [If applicable]

---

[Add more prompts as you discover what works well]

---

## Prompt Patterns That Work Well

### General Best Practices (learned from this project)

1. **Be Specific About Context**
   - Always mention project type (Landing Page / SaaS)
   - Reference Genesis docs explicitly
   - Include current state/position

2. **Request Structured Output**
   - Ask for artifacts when appropriate
   - Specify desired format (checklist, code, docs)
   - Include "Please provide:" list

3. **Include Success Criteria**
   - Define what "done" looks like
   - Specify testing requirements
   - Request documentation alongside code

4. **Reference Genesis Patterns**
   - Explicitly mention Genesis docs to check
   - Ask to note deviations for Genesis updates
   - Request Genesis-compliant implementations

5. **Ask for Explanations**
   - Request rationale for decisions
   - Ask for comparison of approaches
   - Get learning alongside solutions

---

## Prompts That Didn't Work Well

### Anti-Pattern: Too Vague
```
❌ "Create a form for the app"
```
**Problem**: Lacks context, requirements, integration needs  
**Better**: Use "Form with Supabase Integration" prompt above

---

### Anti-Pattern: No Genesis Reference
```
❌ "How do I set up authentication?"
```
**Problem**: Doesn't leverage Genesis patterns  
**Better**: "Following SAAS_ARCHITECTURE.md authentication pattern, implement..."

---

### Anti-Pattern: Asking vs. Directing
```
❌ "Would you help me with deployment?"
```
**Problem**: Too open-ended, Claude doesn't know what you need  
**Better**: "Create Netlify configuration following DEPLOYMENT_GUIDE.md for..."

---

## Prompt Improvement Notes

**Patterns to Add to Genesis**:
- [ ] [Prompt pattern that should be in Genesis instructions]
- [ ] [Effective template that's reusable]

**Project-Specific Learnings**:
- [What worked especially well for this project type]
- [Prompts that saved significant time]
- [Approaches to avoid]

---

## Quick Reference: Best Prompts for Common Tasks

| Task | Use This Prompt |
|------|----------------|
| Start new Genesis project | "Initial Genesis Setup" |
| Create database schema | "Supabase Schema Design" |
| Build a form | "Form with Supabase Integration" |
| Add external API | "External Service Integration" |
| Add AI feature | "CopilotKit Action Implementation" |
| Deploy to production | "Pre-Deployment Checklist" |
| Close this thread | "Generate Thread Transition Summary" |

---

**Last Updated**: [Date]  
**Prompts Captured**: [Count]  
**Most Used**: [Which prompts were most valuable]
