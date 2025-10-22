# Genesis Skills Factory Meta-Prompt

## Purpose
This meta-prompt systematically generates Genesis skills from documentation with consistent quality, structure, and token efficiency.

---

## Input Variables

When generating a skill, you will receive:

```
NAME: genesis-[domain]
PURPOSE: [Brief description of what the skill does]
CONTENT: [Key patterns/concepts to include]
TOKEN_TARGET: [300-500]
TRIGGER_PATTERNS: [Keywords that should load this skill]
SOURCE: docs/[SOURCE_DOC].md
```

---

## Generation Process

### Step 1: Read Source Documentation
- Locate and read `docs/[SOURCE_DOC].md`
- Identify key patterns, decision trees, code snippets
- Note dependencies and integration points
- Extract command sequences and best practices

### Step 2: Condense to Essential Patterns
Extract only the most actionable elements:
- **Decision trees** → Simple if/then logic
- **Code examples** → Key snippets (not full implementations)
- **Workflows** → Command sequences
- **Best practices** → Checklist format
- **Common patterns** → Quick reference tables

Remove:
- Detailed explanations (point to docs instead)
- Full code listings (use snippets)
- Historical context
- Redundant information

### Step 3: Structure the Skill

Use this exact template:

```markdown
---
name: [SKILL_NAME]
description: [One-line description from PURPOSE]
---

# [Skill Name in Title Case]

## When to Use This Skill

Load this skill when user mentions:
- "[trigger keyword 1]"
- "[trigger keyword 2]"
- "[trigger keyword 3]"
- "[trigger keyword 4]"
- "[related concept or phrase]"

## Key Patterns

### Pattern 1: [Pattern Name]
[2-4 sentence description]

[Optional: Minimal code snippet or command]

### Pattern 2: [Pattern Name]
[2-4 sentence description]

[Optional: Minimal code snippet or command]

### Pattern 3: [Pattern Name]
[2-4 sentence description]

[Optional: Minimal code snippet or command]

[Add 3-5 patterns total - the most essential patterns from source doc]

## Quick Reference

[Decision tree, table, or checklist format]

Example formats:
- Decision tree: "If X → use Y"
- Table: "| Need | Solution | Pattern |"
- Checklist: "- [ ] Step 1"

## Command Templates (if applicable)

```bash
# Common command sequence 1
[commands]

# Common command sequence 2
[commands]
```

## Integration with Other Skills

[How this skill composes with other Genesis skills]

Examples:
- "Use with **genesis-stack-setup** for [integration]"
- "After completing this, use **genesis-deployment** for [next step]"
- "For [advanced scenario], combine with **genesis-[other]**"

## Deep Dive

For complex implementations, reference:
- [SOURCE_DOC].md (full patterns and detailed examples)
- [Related doc if applicable]

---

**Token Target**: Approximately [TOKEN_TARGET] tokens
```

### Step 4: Apply Quality Standards

Ensure the generated skill meets these criteria:

**Trigger Patterns**:
- [ ] 4-5 clear trigger keywords/phrases defined
- [ ] Natural language phrases users would say
- [ ] Technical terms that signal domain

**Token Efficiency**:
- [ ] Target: 300-500 tokens total
- [ ] Focus on condensed guidance, not exhaustive docs
- [ ] Code snippets only (not full implementations)
- [ ] Use tables/lists instead of prose

**Actionability**:
- [ ] Quick decision trees included
- [ ] "If X, then Y" patterns clear
- [ ] Command templates ready to use
- [ ] Immediately applicable without reading full docs

**Composability**:
- [ ] References other Genesis skills explicitly
- [ ] Clear boundaries (when to use this vs. that)
- [ ] Integration points specified

**Structure**:
- [ ] Follows template exactly
- [ ] YAML frontmatter included
- [ ] 3-5 key patterns (not more)
- [ ] Quick reference section present
- [ ] References full docs for deep dives

### Step 5: Output Format

Save the generated skill to:
```
generated/[NAME]/skill.md
```

Create the directory if it doesn't exist.

---

## Example: Good vs. Bad

### ❌ BAD - Too Verbose, Low Actionability

```markdown
# genesis-example

This skill helps with examples. Examples are important because they demonstrate
patterns and best practices. When you need an example, this skill provides
guidance.

## Background
[Long historical context about why examples matter...]

## Full Implementation
```typescript
// 100 lines of complete implementation code
[Full working application...]
```

[Continues with excessive detail...]
```

**Problems**:
- No clear trigger patterns
- Too much prose
- Full code listings (not snippets)
- No quick reference
- Way over token budget
- Not actionable without reading everything

### ✅ GOOD - Concise, Actionable, Composable

```markdown
---
name: genesis-example
description: Quick reference patterns for common examples
---

# Genesis Example Patterns

## When to Use This Skill

Load this skill when user mentions:
- "example"
- "show me how"
- "pattern for"
- "template"

## Key Patterns

### Pattern 1: Basic Example Structure
```typescript
// Key snippet
const example = {
  setup: 'minimal',
  pattern: 'reusable'
};
```

Reference: EXAMPLE_DOC.md for full implementation

### Pattern 2: Common Use Case
If [condition] → use [approach]
Otherwise → use [alternative approach]

### Pattern 3: Integration Pattern
Connect to [system] via [method]
See STACK_SETUP.md for configuration

## Quick Reference

| Need | Pattern | File |
|------|---------|------|
| Basic | Pattern 1 | components/ |
| Advanced | Pattern 2 | lib/ |

## Command Templates

```bash
# Setup example
npm install example-package
```

## Integration

- Use with **genesis-stack-setup** for configuration
- After setup, use **genesis-deployment** for deployment

## Deep Dive

Reference: docs/EXAMPLE_DOC.md
```

**Strengths**:
- Clear trigger patterns
- Concise patterns with snippets
- Quick reference table
- Command template ready
- Integration points specified
- References docs for details
- ~250 tokens (within budget)

---

## Token Efficiency Techniques

### 1. Use Tables Instead of Prose

**Before** (verbose):
```
When you need to create a form, you should use React Hook Form for the
form management, and you should use Zod for validation. The form should
be placed in the components/forms directory...
```

**After** (table):
```
| Need | Tool | Location |
|------|------|----------|
| Form | React Hook Form | components/forms/ |
| Validation | Zod | types/ |
```

### 2. Code Snippets, Not Full Implementations

**Before**:
```typescript
// Full 50-line implementation
export function CompleteFormComponent() {
  // ... entire implementation
}
```

**After**:
```typescript
// Key pattern
const schema = z.object({
  field: z.string().min(2)
});
```
Reference: FULL_DOC.md for complete implementation

### 3. Decision Trees Over Explanations

**Before**:
```
There are several approaches to deployment. For simple single-service
applications, Netlify is usually the best choice because it's easy to
set up. However, if you have multiple services...
```

**After**:
```
Deployment decision:
- Single service → genesis-deployment (Netlify)
- Multiple services → genesis-archon (orchestration)
```

### 4. Reference Docs for Details

**Always end with**:
```
## Deep Dive
For complex scenarios, reference:
- docs/[SOURCE_DOC].md (complete implementation)
```

---

## Special Cases

### Core Skills (Always-On)
- Target: 300 tokens
- Focus: Decision trees, project selection
- Pattern count: 3-4 essential patterns
- Integration: Point to specialized skills

### Specialized Skills (On-Demand)
- Target: 400-500 tokens
- Focus: Deep patterns for specific domains
- Pattern count: 4-5 patterns
- Integration: Compose with core skills

### Complex Topics (e.g., Archon)
- Target: 500 tokens (maximum)
- Focus: When to use, basic setup, key patterns
- Always reference full docs
- Clear boundaries vs. simpler alternatives

---

## Validation Checklist

Before finalizing a generated skill, verify:

**Structure**:
- [ ] YAML frontmatter present
- [ ] "When to Use" section with 4-5 triggers
- [ ] 3-5 "Key Patterns" sections
- [ ] "Quick Reference" section (table/list/tree)
- [ ] "Integration" section with other skills
- [ ] "Deep Dive" references to full docs

**Content**:
- [ ] Patterns are condensed and actionable
- [ ] Code snippets only (not full implementations)
- [ ] Decision trees clear and simple
- [ ] Command templates ready to use
- [ ] Integration points explicit

**Quality**:
- [ ] Token count: 300-500 words
- [ ] No redundant information
- [ ] Immediately actionable
- [ ] Composes with other Genesis skills
- [ ] References docs for complex scenarios

**Test Questions**:
1. Can a user apply this without reading full docs? (Should be YES)
2. Is it clear when this skill should load? (Trigger patterns clear)
3. Does it point users to other skills/docs when needed? (Integration section)
4. Is it under token budget? (300-500 tokens)

If all answers are YES and all checkboxes checked → Skill is ready!

---

## Usage Example

### Input Request
```
Using genesis-skills-factory-prompt.md, generate:

NAME: genesis-landing-page
PURPOSE: Landing page architecture and lead generation patterns
CONTENT: Form patterns, GHL integration, SEO, conversion optimization
TOKEN_TARGET: 500
TRIGGER_PATTERNS: landing page, lead generation, lead capture, GHL
SOURCE: docs/LANDING_PAGE_TEMPLATE.md
```

### Generation Steps
1. Read `docs/LANDING_PAGE_TEMPLATE.md`
2. Extract key patterns:
   - Lead capture form pattern
   - GHL API integration
   - SEO configuration
   - Conversion optimization checklist
3. Condense to essential snippets
4. Create decision trees (when to use what)
5. Structure using template
6. Add integration points (genesis-stack-setup, genesis-deployment)
7. Validate against checklist
8. Save to `generated/genesis-landing-page/skill.md`

### Expected Output
A 450-500 token skill with:
- 4-5 trigger patterns
- 4 key patterns (form, GHL, SEO, deployment)
- Quick reference table
- Command templates
- Integration with other skills
- Reference to full LANDING_PAGE_TEMPLATE.md

---

## Success Metrics

A well-generated skill achieves:

1. **Auto-loads appropriately** - Trigger patterns are natural
2. **Immediate value** - User can act without reading docs
3. **Token efficient** - 300-500 tokens, no bloat
4. **Composable** - Clear integration with other skills
5. **Accurate** - References correct docs and patterns
6. **Maintainable** - Can be regenerated from updated docs

---

## Notes for Generator (You)

When you receive a skill generation request:

1. **Always start** by reading the source doc
2. **Focus on extraction** - What are the 3-5 most essential patterns?
3. **Think in snippets** - Not full code, just key examples
4. **Use structure** - Follow template exactly
5. **Stay under budget** - 300-500 tokens, period
6. **Reference docs** - Always point to full documentation
7. **Test composability** - How does this work with other Genesis skills?

Your goal: Generate skills that a developer can use **immediately** without reading full documentation, while knowing where to go for **details** when needed.

Quality over quantity. Actionability over completeness. Composition over isolation.

---

**This meta-prompt is the system that ensures every Genesis skill meets the same high standard.**
