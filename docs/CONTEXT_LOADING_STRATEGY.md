# Context Loading Strategy

Priority-based context management for optimal Claude Code token usage. Achieve 50-60% token reduction through strategic context loading.

## Overview

**Problem**: Loading entire project context wastes tokens and reduces Claude Code effectiveness.

**Solution**: Priority-based loading system that loads only necessary context:
- **P0**: Critical, always load
- **P1**: Important, load if referenced
- **P2**: Supporting, load when needed
- **P3**: Extended, load on-demand

**Result**: 50-60% token savings, better responses, longer conversations

## Priority Levels

### P0 - Critical Context (Always Load)
**What**: Core project files essential for any work
**When**: Load at session start
**Size**: <50KB total

**Landing Page P0**:
```
app/layout.tsx
app/page.tsx
components/Hero.tsx
components/Navigation.tsx
lib/config.ts
tailwind.config.ts
package.json
```

**SaaS App P0**:
```
app/layout.tsx
app/(auth)/login/page.tsx
app/(dashboard)/dashboard/page.tsx
lib/auth/config.ts
lib/db/schema.ts
middleware.ts
package.json
```

### P1 - Important Context (Load if Referenced)
**What**: Feature-specific files needed for most tasks
**When**: Load when feature is mentioned or related work starts
**Size**: <100KB total

**Landing Page P1**:
```
components/Features.tsx
components/Pricing.tsx
components/CTA.tsx
components/Footer.tsx
lib/analytics.ts
lib/seo.ts
```

**SaaS App P1**:
```
components/dashboard/*
lib/api/client.ts
lib/auth/session.ts
lib/payments/stripe.ts
app/api/*/route.ts
```

### P2 - Supporting Context (Load When Needed)
**What**: Documentation, tests, utilities
**When**: Load for specific tasks (testing, documentation, etc.)
**Size**: <150KB total

**Common P2**:
```
README.md
docs/*.md
__tests__/*.test.ts
lib/utils/*.ts
components/ui/*
```

### P3 - Extended Context (Load On-Demand)
**What**: Deep implementation details, dependencies
**When**: Load only when explicitly needed
**Size**: Unlimited, but load selectively

**Common P3**:
```
node_modules/*/README.md
.next/**/*
dist/**/*
coverage/**/*
documentation/archives/*
```

## Implementation

### Session Start Protocol

```typescript
// 1. User starts Claude Code
// 2. Auto-load P0 context
const p0Files = [
  'app/layout.tsx',
  'app/page.tsx',
  'lib/config.ts',
  'package.json'
];

// 3. Wait for user request
// 4. Load P1 based on request
if (request.includes('pricing')) {
  load('components/Pricing.tsx');
  load('lib/stripe.ts');
}

// 5. Load P2/P3 on-demand
if (needsTests) {
  load('__tests__/Pricing.test.tsx');
}
```

### Manual Context Loading

**Load specific section**:
```bash
# Using custom command
/load-context FILE_NAME "Section Name"

# Example
/load-context README.md "Authentication Setup"
```

**Check current context**:
```bash
/context-status
```

**Optimize context**:
```bash
/context-optimize
```

### Automatic Context Loading

Claude Code will automatically load context based on:
- File mentions in conversation
- Related files (imports/exports)
- Test files for components
- Documentation for APIs

## Configuration

### Project-Specific Configuration

Create `.claude/context-config.json`:

```json
{
  "version": "2.0",
  "strategy": "priority-based",
  "priorities": {
    "P0": {
      "auto_load": true,
      "max_size_kb": 50,
      "files": [
        "app/layout.tsx",
        "app/page.tsx",
        "lib/config.ts",
        "package.json"
      ]
    },
    "P1": {
      "auto_load": false,
      "load_on_mention": true,
      "max_size_kb": 100,
      "patterns": [
        "components/**/*.tsx",
        "lib/**/*.ts",
        "app/api/**/*.ts"
      ]
    },
    "P2": {
      "auto_load": false,
      "load_on_demand": true,
      "max_size_kb": 150,
      "patterns": [
        "docs/**/*.md",
        "__tests__/**/*.test.ts",
        "components/ui/**/*.tsx"
      ]
    },
    "P3": {
      "auto_load": false,
      "explicit_only": true,
      "patterns": [
        "node_modules/**/*"
      ]
    }
  },
  "exclusions": [
    ".next/**/*",
    "dist/**/*",
    "coverage/**/*",
    "*.log"
  ]
}
```

### Landing Page Configuration

**Optimized for marketing sites**:

```json
{
  "project_type": "landing-page",
  "priorities": {
    "P0": [
      "app/layout.tsx",
      "app/page.tsx",
      "components/Hero.tsx",
      "components/Navigation.tsx",
      "tailwind.config.ts"
    ],
    "P1": [
      "components/Features.tsx",
      "components/Pricing.tsx",
      "components/CTA.tsx",
      "components/Testimonials.tsx",
      "components/Footer.tsx"
    ],
    "P2": [
      "lib/analytics.ts",
      "lib/seo.ts",
      "docs/DESIGN.md"
    ]
  },
  "expected_usage": {
    "tokens_per_session": "15000-25000",
    "savings_vs_full_load": "55-65%"
  }
}
```

### SaaS App Configuration

**Optimized for complex applications**:

```json
{
  "project_type": "saas-app",
  "priorities": {
    "P0": [
      "app/layout.tsx",
      "app/(auth)/login/page.tsx",
      "app/(dashboard)/dashboard/page.tsx",
      "lib/auth/config.ts",
      "lib/db/schema.ts",
      "middleware.ts"
    ],
    "P1": [
      "components/dashboard/**/*.tsx",
      "lib/api/client.ts",
      "lib/auth/session.ts",
      "lib/payments/stripe.ts",
      "app/api/*/route.ts"
    ],
    "P2": [
      "lib/utils/**/*.ts",
      "components/ui/**/*.tsx",
      "__tests__/**/*.test.ts",
      "docs/**/*.md"
    ]
  },
  "expected_usage": {
    "tokens_per_session": "20000-35000",
    "savings_vs_full_load": "45-55%"
  }
}
```

## Context Management Commands

### Check Context Status
```bash
/context-status

# Output:
# Loaded: P0 (5 files, 45KB)
# Available P1: 12 files
# Available P2: 28 files
# Total tokens used: 12,500 / 200,000
```

### Load Specific Priority
```bash
/load-priority P1

# Loads all P1 files
```

### Load Specific File
```bash
/load-file components/Pricing.tsx

# Loads single file
```

### Optimize Context
```bash
/context-optimize

# Analyzes loaded context
# Unloads unused files
# Reloads frequently referenced files
```

### Reload Context
```bash
/context-reload --current-task

# Unloads all context
# Reloads only P0 + task-relevant files
```

## Best Practices

### ✅ Do
- Start with P0 only
- Load P1 when feature mentioned
- Load P2/P3 explicitly when needed
- Monitor token usage
- Optimize between phases
- Use context commands

### ❌ Don't
- Load entire project at start
- Keep unused files loaded
- Load node_modules unless necessary
- Ignore token warnings
- Skip optimization
- Load archives/old code

## Scout-Plan-Build Integration

### Scout Phase
**Context**: P0 + relevant P1 for feature being scouted
```bash
# Scout authentication
# Load: P0 + lib/auth/* + components/Auth*
```

### Plan Phase
**Context**: P0 + Scout report + patterns
```bash
# Planning implementation
# Load: P0 + scout-report.md + docs/patterns/
```

### Build Phase
**Context**: P0 + Plan + files being modified
```bash
# Building feature
# Load: P0 + plan.md + specific component files
```

## Token Usage Examples

### Full Project Load (❌ Inefficient)
```
Total files: 150
Total size: 2.5MB
Tokens used: 85,000
Remaining: 115,000
Efficiency: Poor
```

### Priority-Based Load (✅ Efficient)
```
P0 loaded: 7 files, 45KB
P1 loaded: 3 files, 25KB
P2 loaded: 0 files
Total tokens: 20,000
Remaining: 180,000
Efficiency: Excellent (76% savings)
```

## Monitoring & Metrics

### Track Context Efficiency
```typescript
interface ContextMetrics {
  session_start: Date;
  p0_loaded: number;
  p1_loaded: number;
  p2_loaded: number;
  p3_loaded: number;
  total_tokens: number;
  tokens_available: number;
  efficiency_percent: number;
}

// Goal: >50% efficiency
```

### Performance Indicators
- **Excellent**: >60% token savings
- **Good**: 50-60% token savings
- **Acceptable**: 40-50% token savings
- **Poor**: <40% token savings (optimize!)

## Troubleshooting

### Context Not Loading
```bash
# Check configuration
cat .claude/context-config.json

# Verify file exists
ls -la path/to/file.tsx

# Force reload
/context-reload
```

### Too Many Tokens Used
```bash
# Check what's loaded
/context-status

# Optimize
/context-optimize

# Reload minimal
/context-reload --minimal
```

### Missing Context
```bash
# Load missing file
/load-file path/to/file.tsx

# Load pattern
/load-pattern "lib/auth/**/*.ts"

# Load priority level
/load-priority P1
```

---

**Remember**: Context is Claude Code's working memory. Load strategically, monitor usage, and optimize regularly for best results.

## References

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [Scout-Plan-Build Workflow](SCOUT_PLAN_BUILD.md)
- [Thread Transitions](../templates/THREAD_TRANSITION_V2.md)
