# Genesis Skills Factory

## Purpose
You are operating within the Genesis Skills Factory, a systematic environment for generating high-quality AI skills from Genesis documentation.

## Your Role
Transform Genesis documentation into production-ready skills that:
1. Auto-load based on contextual triggers
2. Provide condensed, actionable guidance
3. Reference full documentation for deep dives
4. Compose with other Genesis skills
5. Target 300-500 tokens per skill

## Available Resources

### /docs/ - Genesis Documentation
Source of truth for all Genesis patterns:
- `PROJECT_KICKOFF_CHECKLIST.md` - Project type decision trees
- `LANDING_PAGE_TEMPLATE.md` - Lead generation patterns
- `SAAS_ARCHITECTURE.md` - Multi-tenant architecture
- `STACK_SETUP.md` - Integration sequences
- `CLAUDE_CODE_INSTRUCTIONS.md` - Development workflows
- `COPILOTKIT_PATTERNS.md` - AI features integration
- `ARCHON_PATTERNS.md` - Multi-service orchestration
- `DEPLOYMENT_GUIDE.md` - Deployment strategies
- `MILESTONE_COMPRESSION_CHECKLIST.md` - Context preservation

### /examples/ - Anthropic Skill Examples
Reference implementations showing:
- Skill structure (skill.md format)
- Trigger patterns
- Parameter definitions
- Tool usage patterns
- Best practices

### /generated/ - Output Directory
Where newly created skills are saved for review before production.

## Skill Generation Standards

### Structure
Every skill.md should contain:

```markdown
# [Skill Name]

## When to Use This Skill
[Clear description of when this skill should load]

## Key Patterns

### Pattern 1: [Name]
[Condensed pattern with essential code/steps]

### Pattern 2: [Name]
[Condensed pattern with essential code/steps]

### Pattern N: [Name]
[Condensed pattern with essential code/steps]

## Quick Reference
[Decision trees, checklists, or lookup tables]

## Command Templates (if applicable)
[Common command sequences]

## Integration with Other Skills
[How this skill composes with other Genesis skills]

## Deep Dive
For complex scenarios, reference:
- docs/[SOURCE_DOC].md
```

### Skill Qualities

**Trigger Patterns**:
- Clear keywords that indicate when skill is needed
- Natural language phrases users would say
- Technical terms that signal domain

**Token Budget**:
- Core skills: 300-500 tokens
- Specialized skills: 400-500 tokens
- Focus on condensed guidance, not exhaustive docs

**Actionability**:
- Quick decision trees
- "If X, then Y" patterns
- Code snippets (not full implementations)
- Command templates

**Composability**:
- Reference other Genesis skills
- Clear boundaries (when to use this vs. that)
- Integration points explicit

### Example: Good Skill Structure

```markdown
# genesis-landing-page

## When to Use This Skill
Load this skill when user mentions:
- "landing page"
- "lead generation"
- "lead capture"
- "GHL integration"
- "marketing page"

## Key Patterns

### Pattern 1: Standard Lead Capture Form
Components needed:
- React Hook Form + Zod validation
- API route → GHL integration
- Success/error handling

```typescript
// Quick reference pattern
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
});
```

### Pattern 2: GHL Integration
API route pattern:
```typescript
// app/api/leads/route.ts
POST → GHL API → Return success
```

Reference: LANDING_PAGE_TEMPLATE.md for full implementation

## Quick Reference

| Need | Solution | File Pattern |
|------|----------|--------------|
| Form | React Hook Form | components/forms/ |
| Validation | Zod schema | types/ |
| Submission | API route | app/api/leads/ |

## Integration
- Use with **genesis-stack-setup** for GHL configuration
- Use with **genesis-deployment** for Netlify setup
- For complex forms, reference LANDING_PAGE_TEMPLATE.md

## Command Template
```bash
# Standard setup
npx create-next-app@latest [name] --typescript --tailwind --app
npm install react-hook-form @hookform/resolvers/zod zod
```
```

## Generation Workflow

When asked to generate a skill:

1. **Read Source Documentation**
   - Identify source doc in /docs/
   - Extract key patterns, decision trees, code snippets
   - Note dependencies and integrations

2. **Study Example Skills**
   - Review examples/ for structure
   - Note skill.md format
   - Observe token efficiency techniques

3. **Draft Skill**
   - Use structure template above
   - Condense patterns (full code → snippets)
   - Create decision trees (prose → table/list)
   - Define clear trigger patterns

4. **Review & Refine**
   - Check token target (300-500)
   - Verify actionability
   - Ensure references to full docs
   - Test composability language

5. **Output to /generated/**
   - Create skill directory
   - Save as skill.md
   - Ready for review

## Typical Generation Request Format

```
"Using genesis-skills-factory-prompt.md, generate:

NAME: genesis-[domain]
PURPOSE: [Brief description]
CONTENT: [Key patterns to include]
TOKEN_TARGET: 400
TRIGGER_PATTERNS: [Keywords that load skill]
SOURCE: docs/[SOURCE_DOC].md"
```

## Quality Checklist

Before outputting a skill, verify:

- [ ] Clear "When to Use" section
- [ ] 3-5 key patterns (condensed)
- [ ] Quick reference (table/list/tree)
- [ ] References to full docs for complex scenarios
- [ ] Integration points with other skills
- [ ] Token count ~300-500
- [ ] Trigger patterns defined
- [ ] Command templates (if applicable)
- [ ] Actionable (not just informational)

## Meta-Prompt Development

When creating/refining the meta-prompt for systematic generation:

**Good Meta-Prompt**:
- Variables clearly defined (NAME, PURPOSE, SOURCE, etc.)
- Output format template
- Quality standards
- Examples of good vs. bad skills
- Token target enforcement
- Composability guidelines

**Test Meta-Prompt**:
1. Generate test skill
2. Review against quality checklist
3. Refine meta-prompt if needed
4. Iterate until consistent quality

## Genesis Skills Philosophy

**Skills as Interface Layer**:
- Skills = Condensed, actionable guidance
- Documentation = Deep reference
- Skills point to docs when needed
- Token efficiency is critical

**Auto-Loading Intelligence**:
- Claude detects keywords → loads appropriate skills
- Multiple skills can load together
- Skills compose naturally

**Systematic Evolution**:
- Docs are source of truth
- Skills generated from docs
- Update docs → regenerate skills
- Version control everything

## Common Patterns to Extract

When reading Genesis docs, look for:

1. **Decision Trees** - "If X, then Y" logic
2. **Code Patterns** - Reusable snippets
3. **Command Sequences** - Common workflows
4. **Integration Points** - How pieces connect
5. **Best Practices** - Rules of thumb
6. **Common Pitfalls** - What to avoid

These compress well into skills.

## Success Metrics

A well-generated skill:
- Loads automatically when relevant (good triggers)
- Provides immediate value (actionable patterns)
- Saves user from reading full docs (condensed)
- Points to docs when needed (references)
- Composes with other skills (integration language)
- Fits token budget (300-500 tokens)

Your goal: Generate skills that meet all these criteria systematically.
