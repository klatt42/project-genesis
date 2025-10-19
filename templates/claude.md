# Claude Project Instructions - [Project Name]

**Project Type**: [Landing Page / SaaS Application / Custom]
**Genesis Template**: [landing-page / saas-app]
**Repository**: [GitHub URL]
**Live Site**: [Netlify URL or TBD]
**Last Updated**: [Date]

---

## Project Identity & Context

### Quick Reference
```
Project: [Name]
Type: [Landing Page / SaaS App]
Genesis Boilerplate: [specific template used]
Stack: Supabase + [GHL/Stripe/etc] + CopilotKit + Archon + Netlify
Environment: WSL/Ubuntu
```

### Project Goals
- **Primary Objective**: [What this project accomplishes]
- **Success Metrics**: [How we measure success]
- **Timeline**: [Project timeline/milestones]
- **Current Phase**: [Discovery / Setup / Development / Testing / Deployment]

### Target Audience
[Brief description of who this is for and their primary needs]

---

## Genesis Integration

### Primary Genesis Documents
Following **Pattern 2: Progressive Context Loading** - these docs are loaded in sequence as needed:

**Phase 1: Setup & Architecture**
- `STACK_SETUP.md` - Integration configuration
- `[LANDING_PAGE_TEMPLATE.md or SAAS_ARCHITECTURE.md]` - Project pattern reference
- `PROJECT_KICKOFF_CHECKLIST.md` - Setup verification

**Phase 2: Development**
- `COPILOTKIT_PATTERNS.md` - AI feature implementation
- `CLAUDE_CODE_INSTRUCTIONS.md` - Development commands
- `COMPONENT_LIBRARY.md` - Reusable component patterns

**Phase 3: Deployment**
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `ARCHON_PATTERNS.md` - Orchestration & scaling

### Genesis Patterns in Use
Following **Pattern 1: Multi-Phase Task Breakdown**:

- ✅ **Template Selection**: Using [specific boilerplate]
- 🔄 **Current Implementation**: [Current pattern being followed]
- ⏳ **Upcoming Patterns**: [Next patterns to implement]

### Custom Modifications
**Pattern 4: Smart Context Compaction** - Documenting deviations for Genesis updates:

```
Modifications Made:
- [Modification 1]: [Why it was needed]
- [Modification 2]: [Why it was needed]

Genesis Update Candidates:
- [ ] [Pattern discovered during this project]
- [ ] [Improvement to existing Genesis pattern]
```

---

## Technical Stack Configuration

### Supabase
```
Project URL: [URL]
Project ID: [ID]
Tables Created: [List]
RLS Status: [Enabled/Disabled per table]
```

**Schema Overview**:
- `[table_name]`: [Purpose and key fields]
- `[table_name]`: [Purpose and key fields]

**Environment Variables**:
```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # Server-side only
```

### [Additional Service - e.g., GoHighLevel]
```
API Key Location: [Environment variable name]
Webhook Endpoint: [URL if applicable]
Integration Points: [Where it connects]
```

**Configuration**:
- [Key config detail 1]
- [Key config detail 2]

### CopilotKit (if applicable)
```
Runtime API: [URL]
Actions Implemented: [List]
Use Cases: [Specific AI features]
```

### Archon Deployment
```
Project ID: [ID if created]
Deployment Status: [Not configured / Configured / Deployed]
```

### Netlify
```
Site URL: [URL]
Build Command: npm run build
Publish Directory: dist
Functions: [List if any]
```

**Environment Variables** (Netlify):
```
[List all required env vars]
```

---

## Project Structure & File Organization

Following Genesis boilerplate structure:

```
project-root/
├── src/
│   ├── components/
│   │   ├── [Component].tsx          [Status: ✅🔄⏳]
│   │   └── [Component].tsx
│   ├── lib/
│   │   ├── supabase-client.ts       [✅ Genesis pattern]
│   │   └── [service]-integration.ts
│   ├── pages/
│   │   └── [routes]
│   └── types/
├── .genesis/                        [Pattern 3: Structured Notes]
│   ├── 1_discovery.md
│   ├── 2_decisions.md
│   ├── 3_prompts.md
│   ├── 4_commands.md
│   ├── 5_errors.md
│   ├── 6_learnings.md
│   └── 7_handoff.md
├── docs/
│   └── [project-specific docs]
└── claude.md                        [This file]
```

---

## Development Workflow

### Pattern 1: Multi-Phase Task Breakdown

**Phase 1: Foundation Setup** ⏳
```
1.1 Genesis Template
    - [ ] Clone from project-genesis
    - [ ] Select boilerplate
    - [ ] Initial configuration

1.2 Supabase Configuration
    - [ ] Project creation
    - [ ] Schema implementation
    - [ ] RLS policies

1.3 External Services
    - [ ] [Service] setup
    - [ ] Environment variables
    - [ ] Test connections
```

**Phase 2: Core Implementation** ⏳
```
2.1 Authentication (if SaaS)
    - [ ] Supabase Auth setup
    - [ ] Protected routes
    - [ ] User session management

2.2 Primary Features
    - [ ] [Feature 1]
    - [ ] [Feature 2]
    - [ ] [Feature 3]

2.3 Integration
    - [ ] External service connections
    - [ ] Webhook handlers
    - [ ] Data sync
```

**Phase 3: Polish & Deploy** ⏳
```
3.1 UI/UX Refinement
    - [ ] Responsive design
    - [ ] Loading states
    - [ ] Error handling

3.2 Testing
    - [ ] Integration tests
    - [ ] User flow testing
    - [ ] Performance check

3.3 Deployment
    - [ ] Netlify configuration
    - [ ] Environment variables
    - [ ] Production verification
```

### Current Position
```
📍 Current Phase: [Phase number and name]
📍 Current Task: [Specific task]
📍 Following: [Genesis doc section]
📍 Last Action: [What was just completed]
```

---

## Pattern 3: Structured Note-Taking System

### Quick Notes Location
See `.genesis/` directory for detailed notes:

- **Discovery Notes**: `.genesis/1_discovery.md` - Requirements, user needs, research
- **Decision Log**: `.genesis/2_decisions.md` - Technical choices and rationale
- **Prompt Library**: `.genesis/3_prompts.md` - Effective prompts for this project
- **Command History**: `.genesis/4_commands.md` - Sequential command log
- **Error Solutions**: `.genesis/5_errors.md` - Problems encountered and fixes
- **Learning Journal**: `.genesis/6_learnings.md` - Patterns and insights
- **Handoff Ready**: `.genesis/7_handoff.md` - Thread transition summaries

### Active Context Window
**Pattern 2: Progressive Context Loading** - Current loaded context:

```
Currently Active:
- [Doc 1] - [Sections loaded]
- [Doc 2] - [Sections loaded]

Next to Load:
- [Doc 3] - [When/why]
```

---

## Common Commands

### Claude Code Commands
Following `CLAUDE_CODE_INSTRUCTIONS.md`:

```bash
# Initialize Claude Code session
claude-code init

# Development tasks (examples - see .genesis/4_commands.md for full history)
claude-code "Implement [feature] following Genesis [pattern]"
claude-code "Add [component] using Genesis component library"
claude-code "Fix [issue] in [file]"
claude-code "Deploy to Netlify following DEPLOYMENT_GUIDE.md"
```

### Development Server
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
```

### Database Commands
```bash
# Supabase local development (if using)
supabase start
supabase db reset
supabase db push
```

---

## Testing & Validation

### Manual Testing Checklist
- [ ] [Key user flow 1]
- [ ] [Key user flow 2]
- [ ] Form submissions and validation
- [ ] Error states and handling
- [ ] Mobile responsiveness
- [ ] Loading states

### Integration Testing
- [ ] Supabase connection and queries
- [ ] [External service] API calls
- [ ] Webhook processing (if applicable)
- [ ] Authentication flows (if SaaS)

### Performance Checks
- [ ] Lighthouse score > 90
- [ ] Initial load < 3s
- [ ] Time to Interactive < 5s

---

## Deployment Checklist

Following `DEPLOYMENT_GUIDE.md`:

**Pre-Deployment**
- [ ] All environment variables configured in Netlify
- [ ] Production Supabase project configured
- [ ] External service production keys ready
- [ ] Build succeeds locally
- [ ] All tests passing

**Deployment**
- [ ] Push to main branch
- [ ] Netlify build triggers
- [ ] Production environment variables verified
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

**Post-Deployment**
- [ ] Verify all pages load
- [ ] Test all integrations in production
- [ ] Monitor error logs
- [ ] Performance check
- [ ] User acceptance testing

---

## Genesis Update Tracking

### Patterns to Contribute Back
**Pattern 4: Smart Context Compaction** - Documenting for Genesis:

```markdown
New Patterns Discovered:
- [ ] [Pattern Name]: [Description and value]
  - Code example: [location]
  - Applicable to: [Landing Page / SaaS / Both]

Improvements to Existing Patterns:
- [ ] [Genesis Doc]: [Section]
  - Current approach: [brief]
  - Improved approach: [brief]
  - Why better: [rationale]

Documentation Gaps:
- [ ] [Topic]: [What's missing or unclear]
```

---

## Project-Specific Notes

### Business Logic
[Document any unique business rules, workflows, or logic specific to this project]

### Design Decisions
[Key UI/UX decisions and rationale]

### External Dependencies
[Any external services, APIs, or integrations beyond the standard stack]

### Future Enhancements
[Features or improvements planned for future iterations]

---

## Thread Transition Quick Reference

When starting a new Claude conversation:

```
I'm continuing [Project Name] using Project Genesis.

Project Type: [Landing Page / SaaS App]
Repository: [URL]
Current Status: [One sentence summary]

Transition Summary: See .genesis/7_handoff.md
Current Position: [Specific task and Genesis doc section]

Please load the handoff notes and let's continue with [next action].
```

---

## Emergency Recovery

### If Context is Lost
1. Read this `claude.md` file
2. Check `.genesis/7_handoff.md` for latest transition
3. Review `.genesis/4_commands.md` for command history
4. Check `.genesis/5_errors.md` for known issues
5. Verify current position with: `git status` and `git log -1`

### If Build Breaks
1. Check `.genesis/5_errors.md` for similar issues
2. Verify all environment variables present
3. Check Supabase connection
4. Review recent commits: `git log --oneline -5`
5. Roll back if needed: `git revert [commit-hash]`

---

## WSL & Claude Code Environment

**Default Terminal**: WSL Ubuntu
**Claude Code Project Directory**: `/path/to/project`
**Restart Commands**:
```bash
# New WSL Terminal
cd /path/to/project

# New Claude Code Session
cd /path/to/project
claude-code init
```

---

## Contact & Resources

**Project Owner**: [Name/Contact]
**Repository**: [GitHub URL]
**Project Board**: [If using GitHub Projects/other PM tool]
**Design Files**: [Figma/other design tool links]
**Documentation**: [Any external docs]

---

**Template Version**: 1.0
**Genesis Version**: [Current Genesis version]
**Last Review**: [Date]

---

## Quick Start for New Thread

1. ✅ Load this `claude.md` file
2. ✅ Check `.genesis/7_handoff.md` for latest status
3. ✅ Review current phase in Development Workflow section
4. ✅ Reference relevant Genesis docs from Progressive Context Loading
5. ✅ Continue from 📍 Current Position

**Pattern Reference**: This template implements all 4 PastorAid patterns for optimal Claude workflow efficiency.
