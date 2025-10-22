# Genesis Skills Factory

The Skills Factory is a systematic environment for generating high-quality AI skills from Genesis documentation.

## 🎯 Purpose

Transform Genesis documentation into production-ready skills that:
- Auto-load based on contextual triggers
- Provide condensed, actionable guidance
- Reference full documentation for deep dives
- Compose with other Genesis skills
- Target 300-500 tokens per skill

## 📁 Directory Structure

```
factory/
├── genesis-skills-factory-prompt.md   # Meta-prompt for systematic generation
├── docs/                              # Source Genesis documentation (9 files)
│   ├── PROJECT_KICKOFF_CHECKLIST.md
│   ├── LANDING_PAGE_TEMPLATE.md
│   ├── SAAS_ARCHITECTURE.md
│   ├── STACK_SETUP.md
│   ├── CLAUDE_CODE_INSTRUCTIONS.md
│   ├── COPILOTKIT_PATTERNS.md
│   ├── ARCHON_PATTERNS.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── MILESTONE_COMPRESSION_CHECKLIST.md
├── examples/                          # Anthropic skill examples (reference)
└── generated/                         # Output directory (gitignored)
```

## 🏭 How to Generate Skills

### Step 1: Prepare Source Documentation

Ensure the pattern is documented in `docs/[PATTERN_NAME].md`:

```markdown
# Pattern Name

## Overview
[What this pattern solves]

## Key Concepts
[Core ideas]

## Implementation
[Step-by-step guide with code]

## Best Practices
[Rules of thumb]

## Common Pitfalls
[What to avoid]
```

### Step 2: Use the Meta-Prompt

With Claude Code in this directory:

```
"Using genesis-skills-factory-prompt.md, generate:

NAME: genesis-[domain]
PURPOSE: [Brief description of what this skill provides]
SOURCE: docs/[SOURCE_DOC].md
TOKEN_TARGET: 400
TRIGGER_PATTERNS:
- "[keyword 1]"
- "[keyword 2]"
- "[keyword 3]"
"
```

### Step 3: Review Generated Skill

```bash
# Check generated skill
cat generated/genesis-[domain]/skill.md

# Verify structure
- [ ] YAML frontmatter (name, description)
- [ ] "When to Use This Skill" section
- [ ] 3-5 Key Patterns
- [ ] Quick Reference (table/list/tree)
- [ ] Command Templates (if applicable)
- [ ] Integration with Other Skills
- [ ] Deep Dive references

# Check token count
wc -w generated/genesis-[domain]/skill.md
# Target: 300-500 words (~400-650 tokens)
```

### Step 4: Move to Production

```bash
# Core skill (always-on)
cp -r generated/genesis-[domain] ../core/

# OR Specialized skill (on-demand)
cp -r generated/genesis-[domain] ../specialized/

# Install
cd ..
./install.sh
```

### Step 5: Test Loading

In Claude Desktop:
```
"I need to [trigger phrase for new skill]"
```

Verify skill loads and provides appropriate guidance.

## 📋 Quality Standards

### Skill Structure Template

```markdown
---
name: genesis-[domain]
description: [One-line description]
---

# Genesis [Domain]

## When to Use This Skill

Load this skill when user mentions:
- "[trigger 1]" OR "[variation 1]"
- "[trigger 2]" OR "[variation 2]"
- "[trigger 3]"

## Key Patterns

### Pattern 1: [Name]
[2-4 sentence description]

**Code snippet** (not full implementation):
```language
// Essential code pattern
```

### Pattern 2: [Name]
[Decision tree or step sequence]

1. Check [condition]
2. If [X] → Use [Y]
3. Otherwise → Use [Z]

### Pattern N: [Name]
[Condensed actionable guidance]

## Quick Reference

| Use Case | Solution | Reference |
|----------|----------|-----------|
| [Need] | [Pattern] | [File/doc] |

## Command Templates

```bash
# Common workflow
command 1
command 2
command 3
```

## Integration with Other Skills

- Use **genesis-[other]** for [specific task]
- Combine with **genesis-[another]** when [scenario]
- Reference **genesis-[third]** for [deeper topic]

## Deep Dive

For complex scenarios, reference:
- docs/[SOURCE_DOC].md ([Specific topics covered])
```

### Token Efficiency Techniques

**Use tables instead of prose:**
```markdown
❌ Bad (verbose):
When you need to create a form, you should use React Hook Form. For validation,
use Zod. The files should go in components/forms/.

✅ Good (condensed):
| Need | Solution | Location |
|------|----------|----------|
| Form | React Hook Form | components/forms/ |
| Validation | Zod | types/ |
```

**Use code snippets instead of full implementations:**
```markdown
❌ Bad (full code):
[50 lines of complete implementation]

✅ Good (pattern):
```typescript
// Standard pattern
const schema = z.object({ ... });
const form = useForm<Schema>({ resolver: zodResolver(schema) });
```
Reference: LANDING_PAGE_TEMPLATE.md for complete implementation
```

**Use decision trees instead of explanations:**
```markdown
❌ Bad (prose):
You should use a landing page when your goal is lead generation and you need
a simple conversion flow. However, if you need user management...

✅ Good (tree):
**Landing Page** → Choose when:
- Goal: Lead generation
- Timeline: Days
- Need: Forms + CRM

**SaaS App** → Choose when:
- Goal: User management
- Timeline: Weeks
- Need: Auth + database
```

## 🔍 Skill Quality Checklist

Before moving to production, verify:

- [ ] **Clear triggers** - 4-5 specific phrases that load skill
- [ ] **Actionable patterns** - Can user immediately apply?
- [ ] **Token efficient** - 300-500 words (~400-650 tokens)
- [ ] **Composable** - References other Genesis skills
- [ ] **Referenced** - Points to full docs for deep dives
- [ ] **Tested** - Skill loads correctly with trigger phrases
- [ ] **Unique** - Doesn't duplicate existing skill content

## 🧪 Testing Generated Skills

### Test 1: Trigger Loading
```
Test phrase: "[One of the trigger patterns]"
Expected: Skill loads, provides relevant patterns
```

### Test 2: Actionability
```
Can a user complete a task using ONLY the skill?
- Yes → Good condensation
- No, needs full docs → Expected (skill should reference docs)
- No, skill unclear → Needs revision
```

### Test 3: Composability
```
Does skill reference other Genesis skills appropriately?
- Core skills → Reference specialized skills for advanced topics
- Specialized skills → Reference core for context
```

### Test 4: Token Budget
```bash
wc -w generated/genesis-[domain]/skill.md
# Core skills: 300-500 words target
# Specialized: 400-500 words target
# Acceptable range: Up to ~650 words if complexity demands
```

## 🔄 Updating Existing Skills

### Minor Updates (Quick Fixes)

Edit skill directly:
```bash
vim ../core/genesis-[domain]/skill.md
# Make changes
cd ..
./install.sh  # Reinstall
```

### Major Updates (Pattern Changes)

Regenerate from updated docs:
```bash
# 1. Update source docs
vim docs/[SOURCE_DOC].md

# 2. Regenerate skill using meta-prompt
claude-code "Regenerate genesis-[domain] from updated [SOURCE_DOC].md"

# 3. Review changes
diff generated/genesis-[domain]/skill.md ../core/genesis-[domain]/skill.md

# 4. Replace
rm -rf ../core/genesis-[domain]
cp -r generated/genesis-[domain] ../core/

# 5. Reinstall
cd ..
./install.sh
```

## 📊 Current Skills Status

### Core Skills (5) - Production Ready ✅
- genesis-core (415 words)
- genesis-landing-page (471 words)
- genesis-saas-app (659 words)
- genesis-stack-setup (612 words)
- genesis-commands (742 words)

**Total**: 2,899 words (~3,770 tokens)

### Specialized Skills (6) - Production Ready ✅
- genesis-copilotkit (733 words)
- genesis-supabase (861 words)
- genesis-deployment (681 words)
- genesis-archon (815 words)
- genesis-testing (1,012 words)
- genesis-thread-transition (923 words)

**Total**: 5,025 words (~6,530 tokens)

### Overall Statistics
- **Total Skills**: 11
- **Total Words**: 7,924
- **Total Tokens**: ~10,300
- **Efficiency**: 80% reduction vs full docs (~50k tokens)

## 🎯 Generation Examples

### Example 1: Core Skill

**Input:**
```
"Using genesis-skills-factory-prompt.md, generate:

NAME: genesis-landing-page
PURPOSE: Lead generation patterns with GoHighLevel integration
SOURCE: docs/LANDING_PAGE_TEMPLATE.md
TOKEN_TARGET: 400
TRIGGER_PATTERNS:
- "landing page"
- "lead generation"
- "lead capture"
- "GHL integration"
```

**Output**: `generated/genesis-landing-page/skill.md` (471 words)

### Example 2: Specialized Skill

**Input:**
```
"Using genesis-skills-factory-prompt.md, generate:

NAME: genesis-deployment
PURPOSE: Netlify deployment patterns and production hosting
SOURCE: docs/DEPLOYMENT_GUIDE.md
TOKEN_TARGET: 450
TRIGGER_PATTERNS:
- "deploy"
- "deployment"
- "netlify"
- "production"
- "go live"
```

**Output**: `generated/genesis-deployment/skill.md` (681 words)

## 🚀 Best Practices

### 1. Source Documentation First
Always create/update comprehensive docs BEFORE generating skills. Skills are condensed views, not replacements.

### 2. Clear Trigger Patterns
Use natural language phrases users would actually say:
- ✅ "landing page", "lead generation"
- ❌ "genesis_landing_page_module"

### 3. Composability Language
Skills should reference each other:
```markdown
## Integration with Other Skills
- Use **genesis-stack-setup** for initial Supabase configuration
- Combine with **genesis-deployment** for production hosting
```

### 4. Progressive Depth
- Skill = Quick patterns (90% of use cases)
- Docs = Full implementation (edge cases, learning)

### 5. Consistent Structure
Follow the template exactly. Users should know where to find:
- Triggers → Top
- Patterns → Middle
- Commands → Near bottom
- References → Bottom

## 🐛 Troubleshooting

**Skill doesn't load with trigger phrase:**
- Check trigger patterns are natural language
- Try variations: "landing page" vs "create landing page"
- Ensure skill installed correctly (check ~/.claude/skills/genesis/)

**Skill too long (>500 words):**
- Use tables instead of prose
- Code snippets instead of full implementations
- Decision trees instead of explanations
- Split into multiple skills if truly complex

**Skill not actionable enough:**
- Add code snippets
- Add command templates
- Add decision trees
- Test: Can user complete task using only skill?

**Skill duplicates others:**
- Check existing skills for overlap
- Consider combining or referencing instead
- Clarify boundaries in "When to Use This Skill"

## 📚 Resources

### Meta-Prompt
- **File**: `genesis-skills-factory-prompt.md`
- **Purpose**: Systematic skill generation template
- **Usage**: Paste content + generation request to Claude

### Source Documentation
- **Location**: `docs/` (9 comprehensive guides)
- **Purpose**: Source of truth for all Genesis patterns
- **Keep updated**: Regenerate skills when docs change

### Examples
- **Location**: `examples/` (Anthropic skill examples)
- **Purpose**: Reference implementations
- **Study**: See skill.md format, trigger patterns, best practices

## 🎉 Success Metrics

A well-generated Genesis skill:
- ✅ Loads automatically when relevant (good triggers)
- ✅ Provides immediate value (actionable patterns)
- ✅ Saves user from reading full docs (condensed)
- ✅ Points to docs when needed (references)
- ✅ Composes with other skills (integration language)
- ✅ Fits token budget (300-500 tokens)
- ✅ Tested and production-ready

---

**Skills Factory v2.0** - Systematic Genesis skill generation 🏭
