# Thread Transition Template V2.0

Use this template when using `/generate-transition` command or manually creating thread transitions. Enables <2 minute context restoration.

## Template

```markdown
# Thread Transition: [Project Name] - [Feature/Phase]

**Date**: [YYYY-MM-DD HH:MM]
**Session Duration**: [Duration]
**Phase**: Scout / Plan / Build
**Status**: ✅ Complete / 🔄 In Progress / ⏸️ Paused / ❌ Blocked

---

## Executive Summary

[2-3 sentences describing what was accomplished and current state]

---

## Work Completed

### Phase: [Current Phase]

#### Accomplishments
1. **[Task Name]**
   - Files: `path/to/file.ts`, `path/to/file2.ts`
   - Result: [What was achieved]
   - Tests: [Test status]

2. **[Task Name]**
   - Files: `path/to/file.ts`
   - Result: [What was achieved]
   - Tests: [Test status]

#### Files Modified
| File | Changes | Status |
|------|---------|--------|
| `path/to/file.ts` | [Brief description] | ✅ Complete |
| `path/to/file.ts` | [Brief description] | 🔄 In Progress |

#### Commits
```bash
abc1234 feat: [commit message]
def5678 test: [commit message]
```

---

## Current State

### ✅ Working
- [Component/Feature]: [Status/description]

### 🔄 In Progress
- [Task]: [Current state]
  - Next: [Next step]
  - Blockers: [If any]

### ⏸️ Pending
- [Task]: [Why pending]
  - Effort: [Estimated time]
  - Dependencies: [What's needed]

---

## Key Decisions

### Architecture
1. **[Decision]**
   - Rationale: [Why]
   - Alternatives: [What was considered]
   - Impact: [Consequences]

### Genesis Patterns
- **[Pattern]**: [How applied]

### Deviations
- **[Deviation]**: [Reason]

---

## Dependencies & Config

### Added/Updated
```json
{
  "dependencies": {
    "package": "version"
  }
}
```

### Environment
```bash
NEW_VAR=value  # Purpose
```

### Configuration
- `config/file`: [Changes]

---

## Testing

### Coverage
- Unit: ✅ 45/45
- Integration: 🔄 12/15
- E2E: ⏸️ Pending

### Known Issues
1. **[Issue]**: [Description]
   - Impact: High/Medium/Low
   - Fix: [Approach]

---

## Next Session Context

### Priority Tasks
1. **[Task]** 🔥 High
   - Why: [Importance]
   - How: [Approach]
   - Files: `path/to/file.ts`

2. **[Task]** ⚡ Medium
   - Why: [Importance]
   - How: [Approach]

3. **[Task]** 💡 Low
   - Why: [Importance]
   - How: [Approach]

### Files to Review
**Must Review**:
1. `path/to/file.ts` - [Why critical]
2. `path/to/file.ts` - [Why important]

**Reference**:
- Scout Report: `docs/scout-[date].md`
- Plan: `docs/plan-[date].md`

### Context Priority
**P0** (Load immediately):
- `path/to/core.ts`

**P1** (Load if referenced):
- `path/to/related.ts`

**P2** (Load if needed):
- `docs/*.md`

---

## Blockers & Questions

### Blockers
1. **[Blocker]**
   - Impact: [Severity]
   - Workaround: [If available]
   - Resolution: [How to fix]

### Questions
1. **[Question]**
   - Context: [Background]
   - Options: [Approaches]
   - Recommendation: [Preferred]

---

## Resume Prompt

**Copy this to new thread**:

\`\`\`
# Resume: [Project] - [Feature]

## Context
Continuing [feature/project] work after break.

## Last Session
Completed:
- [Major accomplishment 1]
- [Major accomplishment 2]

Current:
- ✅ [Component] working
- 🔄 [Component] in progress

## Next Steps
1. [First task]
2. [Second task]

## Load Files
- `path/to/file1.ts` - [Why]
- `path/to/file2.ts` - [Why]

## Docs
- Plan: `docs/plan-[date].md`
- Transition: `docs/transition-[date].md`

## Start With
[Specific action]
\`\`\`

---

## Metrics

### Time
- Scout: [Duration]
- Plan: [Duration]
- Build: [Duration]

### Productivity
- Tasks: [Completed]
- Tests: [Written]
- Files: [Modified]
- LOC: +[Added] -[Deleted]

---

## Recommendations

### Next Session
1. [Recommendation]
2. [Recommendation]

### Future
1. [Long-term consideration]

---

**Saved**: `docs/transitions/transition-[YYYY-MM-DD-HHMM].md`
```

## Usage Example

### Ending Session
```bash
# Run transition command
/generate-transition

# Review generated transition
cat docs/transitions/transition-$(date +%Y-%m-%d-%H%M).md

# Copy "Resume Prompt" section
```

### Starting New Session
```bash
# Paste Resume Prompt into new Claude Code thread

# Verify context loaded
/context-status

# Begin work
[Follow next steps from transition]
```

## Benefits

- **<2 minute restoration**: Quick context recovery
- **No information loss**: Complete state preserved
- **Clear next steps**: Know exactly what to do
- **Pattern continuity**: Maintain architectural decisions
- **Efficiency**: Minimal re-analysis needed

## Version History

- **V2.0**: Priority-based context loading, metrics, blockers
- **V1.0**: Basic transition template

---

**Remember**: Good transitions enable seamless continuity. Take 2-3 minutes at session end to create quality transition.
