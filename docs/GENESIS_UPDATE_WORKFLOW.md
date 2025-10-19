# Genesis Update Workflow
## Systematic Process for Contributing Project Learnings to Genesis

**Purpose**: Capture project insights → Evaluate → Package → Contribute → Integrate
**Goal**: Make Genesis continuously better through real-world project feedback
**Principle**: Natural capture, systematic contribution

---

## 🎯 Workflow Overview

```
Project Work
     |
     v
Daily Notes (.genesis/)
     |
     v
Pattern Recognition
     |
     v
Evaluation (Should this be in Genesis?)
     |
     v
Packaging (Genesis-ready format)
     |
     v
Contribution (PR or direct update)
     |
     v
Integration into Genesis
     |
     v
All Projects Benefit
```

**Time Investment**:
- During project: 0 extra time (notes already being taken)
- Pattern identification: 5-10 min/day (part of daily compression)
- Packaging: 15-30 min per contribution
- Total overhead: <1% of project time for 100% Genesis improvement

---

## 📝 Phase 1: Capture During Projects

### What to Capture

**In .genesis/2_decisions.md**:
- Technical choices that worked particularly well
- Alternatives considered and why rejected
- When Genesis docs helped (and when they didn't)
- Decisions that could become Genesis patterns

**In .genesis/4_commands.md**:
- Command sequences that were used multiple times
- Successful automation scripts
- Time-saving command patterns
- Repeatable deployment/setup workflows

**In .genesis/5_errors.md**:
- Errors not covered in Genesis troubleshooting
- Common pitfalls with integrations
- Solutions that could help others
- Genesis doc clarifications needed

**In .genesis/6_learnings.md**:
- "Genesis Impact" field in every learning entry
- Patterns that could apply to other projects
- Improvements to existing Genesis patterns
- Missing Genesis documentation identified

**Tag Format**:
```markdown
**Genesis Impact**: [None / Minor / Major / Critical]
**Genesis Doc**: [Specific .md file that should be updated]
**Genesis Type**: [Pattern / Command / Integration / Troubleshooting / Clarification]
```

### Capture Examples

**Good - Actionable Genesis Impact**:
```markdown
## OAuth Integration Learning

Successfully integrated Google OAuth using oauth2-server package.
Pattern works for any OAuth provider with minimal changes.

**Genesis Impact**: Major
**Genesis Doc**: STACK_SETUP.md - Authentication Section
**Genesis Type**: Pattern + Commands
**Why**: Repeatable pattern missing from Genesis, would save 2-3 hours per project
```

**Good - Documentation Gap**:
```markdown
## Supabase RLS Policy Error

Documentation says to set up RLS but doesn't mention all 4 CRUD operations.
Only setting SELECT policy is common mistake.

**Genesis Impact**: Minor (but common issue)
**Genesis Doc**: STACK_SETUP.md - Supabase Section
**Genesis Type**: Clarification + Troubleshooting
**Why**: Prevents common 30-minute debugging session
```

**Not Genesis-worthy**:
```markdown
## Project-Specific API Integration

Integrated with client's custom API. Very specific to their system.
Authentication uses their proprietary tokens.

**Genesis Impact**: None
**Genesis Type**: N/A - Project-specific
**Why**: Won't help other projects
```

---

## ⚖️ Phase 2: Evaluate Genesis-Worthiness

### Evaluation Criteria

#### ✅ Definitely Genesis (Contribute These)

**Patterns**:
- Used successfully in 2+ projects
- Solves common problem across project types
- Has clear implementation steps
- Works with Genesis tech stack

**Commands/Scripts**:
- Reusable across projects
- Saves significant time (>30 minutes)
- Tested and reliable
- Clear documentation possible

**Integrations**:
- Common third-party service
- Works with Genesis stack
- Clear setup process
- Adds valuable functionality

**Troubleshooting**:
- Common error/issue
- Clear solution
- Helps others avoid debugging time
- Not already in Genesis docs

**Documentation**:
- Gap in current Genesis docs
- Clarification that prevents confusion
- Better organization/structure
- Missing examples or use cases

#### ⚠️ Maybe Genesis (Needs Review)

- Used successfully in 1 project (might become pattern)
- Somewhat common problem
- Requires significant context
- Partially overlaps with existing Genesis content
- Might be project-type specific (Landing Page only, etc.)

#### ❌ Not Genesis (Keep in Project)

- Project-specific customization
- Specific to one client/industry
- Requires proprietary tools/services
- One-off solution
- Already well-documented in Genesis

### Evaluation Decision Tree

```
                    Insight Identified
                           |
                    .------'------.
                    |             |
               First time     Seen before
              encountering?   (2+ projects)?
                    |             |
                    v             v
               MAYBE 📝      EVALUATE ➜
             (Track it)            |
                    |      .-------'-------.
                    |      |               |
                    |  Universal?    Project-type
                    |  (All projects)   specific?
                    |      |               |
                    |      v               v
                    |  CONTRIBUTE    MAYBE 📝
                    |   ✅ YES      (Tag clearly)
                    |
                    '------+-------'
                           |
                    Already in
                      Genesis?
                           |
                    .------'------.
                    |             |
                   No           Yes
                    |             |
                    v             v
              CONTRIBUTE    Improvement?
                ✅ YES             |
                            .-----'-----.
                            |           |
                           Yes         No
                            |           |
                            v           v
                      CONTRIBUTE   KEEP IN
                        ✅ YES     PROJECT
```

---

## 📦 Phase 3: Package for Genesis

### Package Format

Every Genesis contribution should include:

1. **Clear Title** - What pattern/solution this is
2. **Problem Statement** - What issue this solves
3. **Solution Overview** - High-level approach
4. **Implementation** - Step-by-step with code examples
5. **Integration Points** - Where this fits in Genesis workflow
6. **Testing/Validation** - How to verify it works
7. **Troubleshooting** - Common issues and solutions
8. **Related Patterns** - What else in Genesis connects

### Template: Pattern Contribution

```markdown
# [Pattern Name]
## [One-line description]

**Genesis Doc**: [Which .md file this belongs in]
**Pattern Type**: [Integration / Workflow / Technical / Deployment]
**Complexity**: [Low / Medium / High]
**Time Saved**: [Estimate per project]

---

## The Problem

[Clear description of what issue this pattern solves]
[Why existing Genesis approach was insufficient]

---

## The Solution

[High-level overview of the pattern]
[Key principles or concepts]

---

## Implementation

### Step 1: [First major step]

[Detailed instructions]

```[language]
[Code example]
```

**Checkpoint**: [How to verify this step worked]

### Step 2: [Second major step]

[Continue pattern...]

---

## Integration with Genesis

**Where to use**: [Which project types benefit]
**When to use**: [At what stage of project]
**Works with**: [Other Genesis patterns]
**Replaces**: [Old approach if applicable]

---

## Example Use Case

[Real example from project showing pattern in action]

---

## Testing & Validation

[How to verify pattern is working correctly]
[What success looks like]

---

## Common Issues

### Issue 1: [Description]
**Symptom**: [What user will see]
**Solution**: [How to fix]

[Continue for other common issues...]

---

## Related Documentation

- [Other Genesis docs that connect]
- [External resources if needed]

---

**Contributed by**: [Your name/identifier]
**Date**: [Contribution date]
**Tested on**: [Project(s) where validated]
```

### Template: Command/Script Contribution

```markdown
# [Command/Script Name]
## [One-line description of what it does]

**Genesis Doc**: CLAUDE_CODE_INSTRUCTIONS.md or relevant doc
**Use Case**: [When to use this]
**Time Saved**: [Estimate]

---

## Purpose

[What this command/script accomplishes]
[Why it's better than manual approach]

---

## Command Sequence

```bash
# Phase 1: [Description]
[commands]

# Checkpoint: [Verification step]

# Phase 2: [Description]
[commands]

# Final Checkpoint: [Success criteria]
```

---

## Script Version (Optional)

If command sequence is long, provide script:

```bash
#!/bin/bash
# [Script name and description]

[Full script with comments]
```

**Usage**:
```bash
bash scripts/[script-name].sh [args]
```

---

## Integration Points

**Before this**: [What should be done first]
**After this**: [What to do next]
**Genesis Checklist**: [Which PROJECT_KICKOFF_CHECKLIST items]

---

## Common Issues

[Troubleshooting guidance]

---

**Contributed by**: [Your name]
**Date**: [Date]
**Tested on**: [Projects/environments]
```

### Template: Documentation Improvement

```markdown
# Documentation Improvement: [Topic]

**Genesis Doc**: [Which .md file]
**Section**: [Specific section that needs work]
**Type**: [Clarification / Addition / Restructure / Fix]

---

## Current State

[What the documentation says now]
[Why it's unclear/incomplete]

---

## Proposed Change

[What should be changed/added]
[Why this improves clarity/completeness]

---

## Updated Content

[Provide the improved documentation ready to drop in]

---

## Impact

**Prevents**: [What confusion/errors this prevents]
**Helps with**: [What project phases this improves]
**Tested by**: [Projects where this would have helped]

---

**Contributed by**: [Your name]
**Date**: [Date]
```

---

## 📤 Phase 4: Contribution Methods

### Method 1: Direct Update (Fastest)

**When to use**: You maintain Genesis repository
**Process**:

```bash
# 1. Update Genesis locally
cd ~/project-genesis
git checkout -b feature/[pattern-name]

# 2. Add your packaged contribution to appropriate doc
# Example: Adding to STACK_SETUP.md
code docs/STACK_SETUP.md
# [Add your content in appropriate section]

# 3. Update CHANGELOG.md
code docs/CHANGELOG.md
# Add entry:
# ## [Version] - [Date]
# ### Added
# - [Your pattern]: [Brief description]

# 4. Commit with clear message
git add docs/STACK_SETUP.md docs/CHANGELOG.md
git commit -m "Add [pattern-name] to STACK_SETUP.md

- Solves [problem]
- Adds [functionality]
- Tested on [projects]"

# 5. Merge and tag
git checkout main
git merge feature/[pattern-name]
git tag v[new-version]
git push origin main --tags

# 6. Update Claude Projects with new Genesis docs
# Regenerate any changed .md files to Claude Projects
```

### Method 2: Contribution Document (Collaborative)

**When to use**: Team environment, want review
**Process**:

```bash
# 1. Create contribution document
cd ~/project-genesis
mkdir -p contributions/pending
code contributions/pending/[pattern-name].md
# [Use package template from Phase 3]

# 2. Add to contributions tracking
code contributions/INDEX.md
# Add entry:
# - [Pattern Name] - [Status] - [Contributor] - [Date]
#   - File: contributions/pending/[pattern-name].md
#   - Target: docs/[TARGET-DOC].md
#   - Review by: [Date]

# 3. Commit contribution
git add contributions/
git commit -m "Contribution: [pattern-name]"
git push

# 4. Request review (however your team handles this)
# Could be: PR, Slack message, email, etc.

# 5. After approval, integrator adds to Genesis docs
# Moves from pending/ to integrated/
# Updates CHANGELOG.md
# Notifies contributor
```

### Method 3: Genesis Update File (Asynchronous)

**When to use**: Working on projects, batch contributions
**Process**:

**During Projects**:
```bash
# In each project with Genesis insights:
# Create genesis_updates_[project-name].md

# Use template:
```

```markdown
# Genesis Updates from [Project Name]

**Project**: [Name]
**Date Range**: [Start] - [End]
**Contributor**: [Your name]

---

## Contributions Summary

- [X] patterns
- [X] commands
- [X] documentation improvements
- [X] troubleshooting entries

---

## Contribution 1: [Pattern Name]

[Full package using template from Phase 3]

---

## Contribution 2: [Command Name]

[Full package using template from Phase 3]

---

[Continue for all contributions...]
```

**Project Complete**:
```bash
# Submit genesis_updates_[project].md to Genesis
cp genesis_updates_[project].md ~/project-genesis/contributions/pending/
cd ~/project-genesis
git add contributions/pending/genesis_updates_[project].md
git commit -m "Genesis updates from [project-name]

[X] new patterns
[X] command improvements
[X] doc clarifications"
git push

# Process when you batch integrate multiple projects
```

---

## ✅ Phase 5: Integration into Genesis

### Integration Checklist

**Before Integration**:
- [ ] Contribution uses Genesis package template
- [ ] Code examples tested and working
- [ ] Fits Genesis tech stack
- [ ] No conflicts with existing patterns
- [ ] Clear documentation
- [ ] Troubleshooting section included

**During Integration**:
- [ ] Add to appropriate Genesis .md file(s)
- [ ] Update related Genesis docs with cross-references
- [ ] Add to CHANGELOG.md
- [ ] Update PROJECT_KICKOFF_CHECKLIST.md if applicable
- [ ] Test integration doesn't break existing docs
- [ ] Version bump (semantic versioning)

**After Integration**:
- [ ] Tag release in Git
- [ ] Update Claude Projects with new docs
- [ ] Notify team/contributors
- [ ] Move contribution from pending → integrated
- [ ] Update contributions INDEX.md

### Integration Locations

**Patterns & Integrations**:
- `docs/STACK_SETUP.md` - Third-party integrations, technical patterns
- `docs/LANDING_PAGE_TEMPLATE.md` - Landing page specific patterns
- `docs/SAAS_ARCHITECTURE.md` - SaaS app specific patterns
- `docs/GENESIS_KERNEL.md` - Core Genesis concepts/patterns

**Commands & Workflows**:
- `docs/CLAUDE_CODE_INSTRUCTIONS.md` - Claude Code commands
- `docs/PROJECT_KICKOFF_CHECKLIST.md` - Setup sequences
- `docs/DEPLOYMENT_GUIDE.md` - Deployment workflows

**Meta-Patterns**:
- `docs/CLAUDE_WORKFLOW_INSTRUCTIONS.md` - Claude usage patterns
- Create new docs for substantial new pattern categories

---

## 📊 Tracking & Metrics

### Track in Genesis

**contributions/INDEX.md**:
```markdown
# Genesis Contributions Index

## Pending Review
- [Pattern Name] - 📝 Review - [Contributor] - 2025-10-15
  - File: contributions/pending/[file].md
  - Target: docs/STACK_SETUP.md
  - Review by: 2025-10-20

## Integrated
- [Pattern Name] - ✅ Integrated - [Contributor] - 2025-10-18
  - Version: v1.5.0
  - File: docs/STACK_SETUP.md - OAuth Section
  - Projects Using: 5

## Statistics
- Total Contributions: 45
- Pending: 3
- Integrated: 42
- Contributors: 8
- Average Integration Time: 4 days
```

### Track in Projects

**In claude.md**:
```markdown
## Genesis Update Tracking

### Contributions Prepared
1. [Pattern Name] - Ready - [Date]
   - File: genesis_updates_[project].md
   - Genesis Doc: STACK_SETUP.md

2. [Command Sequence] - Ready - [Date]
   - File: genesis_updates_[project].md
   - Genesis Doc: CLAUDE_CODE_INSTRUCTIONS.md

### Submitted to Genesis
- [X] genesis_updates_[project].md submitted [Date]
- [ ] Integrated into Genesis (pending)
- [ ] Genesis version: TBD
```

---

## 💡 Best Practices

### Do's ✅

**During Projects**:
- Tag insights with "Genesis Impact" immediately
- Use standard Genesis terminology
- Think "Will this help others?" when solving problems
- Document why, not just what
- Keep Genesis examples simple and clear

**When Packaging**:
- Use Genesis package templates
- Include real examples from your project
- Add troubleshooting for issues you encountered
- Reference related Genesis patterns
- Make it drop-in ready

**When Contributing**:
- One contribution = one clear improvement
- Don't bundle unrelated changes
- Update CHANGELOG.md
- Test documentation is clear
- Provide context for reviewers

### Don'ts ❌

**Avoid**:
- Project-specific details in Genesis patterns
- Overly complex examples
- Assumptions about reader knowledge
- Contributing untested patterns
- Bundling multiple unrelated improvements
- Forgetting to update related docs
- Breaking existing Genesis workflows

**Never**:
- Add dependencies without discussion
- Change core Genesis structure without team input
- Submit without testing
- Override existing patterns without justification
- Forget CHANGELOG entries

---

## 🚀 Quick Start Guide

### Week 1: Start Tagging
1. Add "Genesis Impact" to your .genesis/6_learnings.md entries
2. Tag 2-3 insights per project as potential Genesis contributions
3. Don't worry about packaging yet, just identify

### Week 2: Practice Evaluation
1. Review your tagged insights
2. Apply evaluation criteria (Phase 2)
3. Identify 1-2 clear Genesis contributions
4. Discuss with team if collaborative

### Week 3: Package First Contribution
1. Choose your clearest Genesis improvement
2. Use package template (Phase 3)
3. Make it Genesis-ready
4. Don't submit yet, just practice packaging

### Week 4: Make First Contribution
1. Pick packaging from Week 3
2. Choose contribution method (Phase 4)
3. Submit to Genesis
4. Track through integration (Phase 5)

**Goal**: Natural part of project workflow, not extra burden

---

## 📚 Related Documentation

- `docs/patterns/STACK_SETUP.md` - Pattern 4: Smart Context Compaction
- `docs/GENESIS_NOTE_SYSTEM.md` - .genesis/ system guide
- `.genesis/6_learnings.md` - Primary Genesis impact tracking file
- `CHANGELOG.md` - Genesis version history

---

## 🎯 Success Criteria

**Workflow is working when**:
- Identifying Genesis patterns feels natural during projects
- Packaging contributions takes <30 minutes
- 80% of packaged contributions get integrated
- Genesis continuously improves from real project feedback
- All team members contribute regularly

**Metrics**:
- Genesis contributions per project: Target 3-5
- Time from insight to Genesis integration: Target <2 weeks
- Contribution acceptance rate: Target >80%
- Projects using contributed patterns: Track and measure

---

**Workflow Status**: ✅ Complete - Ready for Genesis Integration
**Last Updated**: October 19, 2025
**Version**: 1.0
