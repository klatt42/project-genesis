# Claude Code Instructions for Genesis Projects

**Version**: 2.1
**Last Updated**: October 19, 2025 (Phase 1A Day 2)
**Purpose**: Command patterns and workflows for Claude Code with Genesis

---

## Table of Contents

1. [Project Setup Commands](#project-setup-commands)
2. [Genesis Note-Taking System](#genesis-note-taking-system)
3. [Schema Modification Workflow](#schema-modification-workflow)
4. [Feature Development Commands](#feature-development-commands)
5. [Database Operations](#database-operations)
6. [Testing & Validation](#testing--validation)
7. [Deployment Commands](#deployment-commands)

---

## Project Setup Commands

### Initialize New Genesis Project

```bash
# Create project from template
claude-code "Create new Genesis project with Next.js, TypeScript, Tailwind, and Supabase setup"

# Expected actions:
# 1. npx create-next-app@latest --typescript --tailwind --app
# 2. npm install @supabase/supabase-js @supabase/ssr
# 3. Create .env.local template
# 4. Set up Supabase client files
# 5. Create initial directory structure
```

### Configure Type Generation

```bash
# Set up TypeScript type generation from Supabase schema
claude-code "Configure Supabase type generation with npm script and environment variable"

# Expected actions:
# 1. Add npm run db:types script to package.json
# 2. Create lib/types directory
# 3. Add SUPABASE_PROJECT_ID to .env.local
# 4. Generate initial types
# 5. Update Supabase client to use generated types
```

---

## Genesis Note-Taking System

### Overview

Genesis projects use a **structured note-taking system** (Pattern 3) to maintain context, track progress, and enable seamless thread transitions. All notes are stored in the `.genesis/` directory.

**Complete Documentation**: See [GENESIS_NOTE_SYSTEM.md](./GENESIS_NOTE_SYSTEM.md)

### The 7 Note Files

Every Genesis project should include these files in `.genesis/`:

1. **1_discovery.md** - Requirements, user research, project planning
2. **2_decisions.md** - Technical decisions with rationale and alternatives
3. **3_prompts.md** - Effective prompts that generated great results
4. **4_commands.md** - Sequential command history with progress tracking
5. **5_errors.md** - Error solutions database (searchable reference)
6. **6_learnings.md** - Insights, patterns, and discoveries
7. **7_handoff.md** - Thread transition handoffs (critical for context continuity)

### Quick Setup for New Projects

```bash
# Copy Genesis note templates to your project
mkdir .genesis
cp ~/Developer/projects/project-genesis/templates/.genesis/*.md ./.genesis/

# Copy claude.md template
cp ~/Developer/projects/project-genesis/templates/claude.md ./claude.md

# Customize claude.md with your project details
# [Edit placeholders like [Project Name], [Repository URL], etc.]
```

### Using Notes During Development

**Update notes in real-time**:
- **4_commands.md**: After every command sequence
- **5_errors.md**: Immediately when errors occur
- **3_prompts.md**: When Claude produces excellent output
- **7_handoff.md**: BEFORE closing any thread
- **6_learnings.md**: At end of session or major milestones
- **2_decisions.md**: After architecture/technical decisions

**Before ending a Claude thread**:
```bash
# CRITICAL: Update handoff before closing thread
# Edit .genesis/7_handoff.md with:
# - Current position (exact file, line, task)
# - Next 3 actions
# - Recent command history
# - Known issues
# - New thread starter prompt
```

### Note Templates Location

All templates available at:
- **Templates**: `~/Developer/projects/project-genesis/templates/`
- **Documentation**: `~/Developer/projects/project-genesis/docs/GENESIS_NOTE_SYSTEM.md`

---

## Schema Modification Workflow

### ⭐ CRITICAL: Type Regeneration Pattern

**EVERY schema change MUST regenerate types**

#### Add New Table

```bash
claude-code "Add events table with columns: id (uuid), title (text), start_time (timestamptz), location (text), description (text). Deploy to Supabase and regenerate types."

# Expected workflow:
# 1. Create/update schema.sql
# 2. Deploy schema to Supabase (via CLI or dashboard)
# 3. Run: npm run db:types
# 4. Verify: git diff lib/types/database.ts
# 5. Commit both schema.sql and database.ts together

# Git commit message format:
# "feat: Add events table with type generation"
```

#### Add Column to Existing Table

```bash
claude-code "Add 'status' enum column to events table with values: draft, published, archived. Update schema, regenerate types, and commit changes."

# Expected workflow:
# 1. Add column to schema.sql or via Supabase dashboard
# 2. Deploy schema change
# 3. Run: npm run db:types
# 4. Verify types updated: git diff lib/types/database.ts
# 5. Update API routes to use new column (with type safety)
# 6. Commit schema + types + code together
```

#### Modify Column Type

```bash
claude-code "Change events.event_date from date to timestamptz (start_time). Update all queries, regenerate types, test, and commit."

# Expected workflow:
# 1. Rename/modify column in schema
# 2. Deploy migration
# 3. Run: npm run db:types
# 4. Fix TypeScript errors in code (types now show correct field)
# 5. Test all affected queries
# 6. Commit together
```

#### Remove Column

```bash
claude-code "Remove 'event_date' column from events table, update queries to use 'start_time', regenerate types, and commit."

# Expected workflow:
# 1. Update schema to remove column
# 2. Deploy change
# 3. Run: npm run db:types
# 4. Fix TypeScript errors (compiler shows removed field)
# 5. Remove all references to old field
# 6. Test
# 7. Commit
```

---

## Feature Development Commands

### Create New Feature with Database

```bash
claude-code "Create hymn finder feature:
1. Add hymns table (id, title, author, lyrics, themes array)
2. Create /api/hymns route with search
3. Create /dashboard/hymn-finder page
4. Include save to user_hymns functionality
5. Regenerate types and test"

# Expected workflow:
# 1. Create schema for hymns and user_hymns tables
# 2. Deploy schema
# 3. npm run db:types (auto-generate types)
# 4. Create API route using generated types
# 5. Create UI component
# 6. Test CRUD operations
# 7. Commit all changes together
```

### Add API Route with Type Safety

```bash
claude-code "Create /api/notes GET and POST endpoints using generated Supabase types with full type safety"

# Expected output:
import type { Database } from '@/lib/types/database'

type Note = Database['public']['Tables']['notes']['Row']
type NoteInsert = Database['public']['Tables']['notes']['Insert']

export async function POST(request: Request) {
  const body: NoteInsert = await request.json()
  const { data, error } = await supabase
    .from('notes')
    .insert(body)  // ✅ Type-safe insert
  // ...
}
```

---

## Database Operations

### Query with Full Type Safety

```bash
claude-code "Create function to fetch user events with type safety, filtering by date range and status"

# Expected code pattern:
import type { Database } from '@/lib/types/database'

type Event = Database['public']['Tables']['events']['Row']

async function getUserEvents(userId: string, startDate: string, endDate: string): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .returns<Event[]>()  // ✅ Explicit type return

  return data || []
}
```

### Complex Joins with Types

```bash
claude-code "Fetch user hymns with related hymn details using join and generated types"

# Expected pattern:
type UserHymnWithDetails = Database['public']['Tables']['user_hymns']['Row'] & {
  hymns: Database['public']['Tables']['hymns']['Row']
}

const { data } = await supabase
  .from('user_hymns')
  .select('*, hymns(*)')
  .eq('user_id', userId)
  .returns<UserHymnWithDetails[]>()
```

---

## Testing & Validation

### Validate Type Safety

```bash
claude-code "Add TypeScript compilation check to CI and verify all database queries use generated types"

# Expected actions:
# 1. Add "type-check": "tsc --noEmit" to package.json
# 2. Run npm run type-check
# 3. Fix any type errors
# 4. Verify all queries use Database types
# 5. Add to CI pipeline
```

### Test Type Generation

```bash
claude-code "Test type generation workflow: add test table, regenerate types, verify types exist, then remove table"

# Workflow test:
# 1. Add test_table to schema
# 2. npm run db:types
# 3. Verify Database['public']['Tables']['test_table'] exists
# 4. Remove test_table
# 5. npm run db:types
# 6. Verify test_table removed from types
```

---

## Deployment Commands

### Pre-Deployment Type Check

```bash
claude-code "Before deploying, verify schema is synced, types are regenerated, and no TypeScript errors exist"

# Checklist verification:
# 1. Schema deployed to Supabase
# 2. npm run db:types (ensure latest)
# 3. npm run type-check (no errors)
# 4. git diff lib/types/database.ts (should be clean)
# 5. npm run build (successful)
```

### Deploy with Type Validation

```bash
claude-code "Deploy to production ensuring types match deployed schema"

# Expected workflow:
# 1. Merge schema changes to main
# 2. Deploy schema to production Supabase
# 3. Regenerate types from production schema
# 4. Deploy application
# 5. Verify types match production DB
```

---

## Troubleshooting Commands

### Fix Type Mismatch

```bash
claude-code "Types don't match database schema - diagnose and fix"

# Diagnostic steps:
# 1. Check SUPABASE_PROJECT_ID is correct
# 2. Verify schema deployed: check Supabase dashboard
# 3. Force regenerate: rm lib/types/database.ts && npm run db:types
# 4. Compare schema.sql with Supabase Table Editor
# 5. Fix any drift
```

### Column Name Mismatch Error

```bash
# Example error: "Could not find the 'event_date' column"

claude-code "Fix column name mismatch: check schema, regenerate types, and update all queries"

# Resolution workflow:
# 1. Check actual column name in Supabase dashboard
# 2. npm run db:types (get latest schema)
# 3. Search codebase for old column name
# 4. Replace with correct name (TypeScript will show it)
# 5. Test queries
```

---

## Best Practices for Claude Code

### DO ✅

```bash
# Always include type regeneration in schema commands
claude-code "Add users table to schema, deploy, and regenerate types"

# Commit schema and types together
claude-code "Commit schema.sql and database.ts with descriptive message"

# Use generated types in all new code
claude-code "Create API route using Database types from lib/types/database"

# Verify types after changes
claude-code "Run npm run db:types and show git diff of database.ts"
```

### DON'T ❌

```bash
# Don't manually write database types
❌ claude-code "Create interface for Events table"
✅ claude-code "Use generated Database['public']['Tables']['events']['Row'] type"

# Don't skip type regeneration
❌ claude-code "Add column to schema and update code"
✅ claude-code "Add column to schema, regenerate types, then update code"

# Don't commit schema without types
❌ git add schema.sql && git commit
✅ npm run db:types && git add schema.sql lib/types/database.ts && git commit
```

---

## Command Templates

### Schema Change Template

```bash
claude-code "
1. [Describe schema change]
2. Deploy schema change to Supabase
3. Run: npm run db:types
4. Verify types updated: git diff lib/types/database.ts
5. Update affected code to use new types
6. Run TypeScript check: npm run type-check
7. Test functionality
8. Commit schema.sql and database.ts together
"
```

### Feature Addition Template

```bash
claude-code "
Feature: [Feature Name]

Steps:
1. Design database schema (tables, columns, RLS)
2. Deploy schema to Supabase
3. Regenerate types: npm run db:types
4. Create API routes using generated types
5. Create UI components
6. Implement CRUD operations with type safety
7. Add error handling
8. Test all functionality
9. Commit changes (schema + types + code)
"
```

---

## Integration with Genesis Agents

### Coordination Agent Commands

```bash
# When using Genesis Coordination Agent for full rebuild:
claude-code "
Use Genesis Coordination Agent to:
1. Analyze requirements
2. Design complete schema
3. Deploy to Supabase
4. Generate TypeScript types (npm run db:types)
5. Build all features with type safety
6. Test and deploy

Ensure type generation happens after schema deployment.
"
```

### Setup Agent Commands

```bash
# When using Genesis Setup Agent:
claude-code "
Use Genesis Setup Agent to initialize project:
1. Set up Next.js + TypeScript + Tailwind
2. Install and configure Supabase
3. Add type generation npm script
4. Generate initial types from schema
5. Configure authentication
6. Set up deployment

Verify SUPABASE_PROJECT_ID is set for type generation.
"
```

---

## Quick Reference

### Type Generation One-Liners

```bash
# Generate types
npm run db:types

# Check what changed
git diff lib/types/database.ts

# Verify types work
npm run type-check

# Full workflow
npm run db:types && git diff lib/types/database.ts && npm run type-check
```

### Common Patterns

```typescript
// Import database types
import type { Database } from '@/lib/types/database'

// Table row type
type Event = Database['public']['Tables']['events']['Row']

// Insert type (optional fields)
type EventInsert = Database['public']['Tables']['events']['Insert']

// Update type (all optional)
type EventUpdate = Database['public']['Tables']['events']['Update']

// Use in Supabase client
import { createClient } from '@supabase/supabase-js'
const supabase = createClient<Database>(url, key)
```

---

## Related Documentation

- [Schema-to-TypeScript Sync Pattern](./patterns/STACK_SETUP.md#schema-to-typescript-sync-pattern-auto-generate-types) - Complete implementation guide
- [Project Kickoff Checklist](./PROJECT_KICKOFF_CHECKLIST.md) - Full project setup with type generation
- [Genesis Kernel](../GENESIS_KERNEL.md) - Core Genesis patterns

---

**Pattern Source**: PastorAid Project (October 2025)
**Time Savings**: 40 minutes per project (prevents type-related debugging)
**Status**: ✅ Production-Ready
**Recommended**: All Genesis projects with Supabase
