# Claude Code 2 Integration

Complete integration of Project Genesis Phase 2 autonomous agents with Claude Code.

## Overview

Project Genesis now provides **two ways** to use autonomous code generation from Claude Code:

1. **MCP Server** (Model Context Protocol) - Programmatic access via 5 tools
2. **Slash Commands** - Natural language interface via 3 commands

This integration enables Claude Code to directly invoke Genesis agents for:
- Project type detection (landing page vs SaaS app)
- Pattern matching (85-95% confidence)
- Code generation (production-ready React/TypeScript)
- Time estimation (with parallel execution speedup)

## Architecture

```
Claude Code
    ↓
┌───────────────────────────────────────┐
│  Slash Commands Layer                 │
│  - /autonomous-project                │
│  - /autonomous-generate                │
│  - /detect-project                     │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  MCP Server Layer                      │
│  - detect_project_type                 │
│  - match_pattern                       │
│  - generate_code                       │
│  - list_patterns                       │
│  - estimate_time                       │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Genesis Agents (Python)               │
│  - ProjectTypeDetector                 │
│  - PatternMatcher                      │
│  - CodeGenerator                       │
│  - GenesisPatternLibrary (13 patterns) │
└───────────────────────────────────────┘
```

## Setup

### Prerequisites

1. **Python 3.11+** with virtual environment
2. **Genesis agents** installed (this repository)
3. **Claude Code** (latest version)

### Installation

1. **Create virtual environment and install dependencies**:
```bash
cd /home/klatt42/Developer/projects/project-genesis
python3 -m venv venv
venv/bin/pip install -r agents/requirements.txt
```

2. **Configure MCP server** (choose one):

**Option A: Project-level** (recommended)
- Copy `genesis-agents-mcp/mcp.json` to your project root
- Claude Code will auto-discover it

**Option B: Global**
- Add to `~/.config/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "genesis-agents": {
      "command": "/home/klatt42/Developer/projects/project-genesis/venv/bin/python",
      "args": [
        "/home/klatt42/Developer/projects/project-genesis/genesis-agents-mcp/server.py"
      ]
    }
  }
}
```

3. **Restart Claude Code** to load the MCP server

4. **Verify installation**:
```bash
# Test MCP server
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | venv/bin/python genesis-agents-mcp/server.py
# Should return: {"jsonrpc":"2.0","id":1,"result":{...}}
```

## Usage

### Method 1: Slash Commands (Easiest)

Slash commands provide a natural language interface to Genesis agents.

#### `/autonomous-project` - Generate Complete Projects

Generate entire applications with multiple features in parallel.

**Examples**:
```bash
# Landing page
/autonomous-project "Build a landing page for product launch with hero, features, and contact form"

# SaaS app
/autonomous-project "Create a task management SaaS with authentication, dashboard, and team features"

# With options
/autonomous-project "SaaS app" --features="auth,dashboard,settings,billing" --parallel=3
```

**Options**:
- `--features` - Comma-separated feature list
- `--parallel` - Max parallel agents (default: 3)
- `--project-type` - Force type: `landing_page` or `saas_app`
- `--output` - Output directory

**Performance**:
- Landing page (5 features): ~40 min (vs 100 min baseline) = 60% faster
- SaaS app (7 features): ~75 min (vs 205 min baseline) = 63% faster

#### `/autonomous-generate` - Generate Single Features

Generate individual features from descriptions.

**Examples**:
```bash
# From description
/autonomous-generate "hero section with CTA buttons"

# With specific pattern
/autonomous-generate "authentication system" --pattern=saas_authentication

# To specific directory
/autonomous-generate "contact form" --output=./src

# Dry run (preview)
/autonomous-generate "pricing table" --dry-run
```

**Available Patterns** (13 total):

**Landing Page** (6):
- `lp_hero_section` - Hero with headline and CTAs (15 min)
- `lp_features_showcase` - Features grid (20 min)
- `lp_contact_form` - Lead capture form (30 min)
- `lp_social_proof` - Testimonials (15 min)
- `lp_pricing_table` - Pricing tiers (20 min)
- `lp_faq` - FAQ accordion (15 min)

**SaaS App** (7):
- `saas_authentication` - Login/signup with NextAuth.js (45 min)
- `saas_dashboard` - User dashboard (30 min)
- `saas_settings` - User settings (25 min)
- `saas_team_management` - Team/org management (40 min)
- `saas_api_routes` - RESTful API endpoints (35 min)
- `saas_notifications` - Toast notifications (30 min)
- `saas_billing` - Stripe subscription (50 min)

#### `/detect-project` - Detect Project Type

Analyze project descriptions to determine type.

**Examples**:
```bash
/detect-project "Build a landing page for our product launch"
/detect-project "Create an app with user authentication and dashboards"
```

**Output**:
- Project type (landing_page or saas_app)
- Confidence score (0-100%)
- Reasoning
- Recommended template

**Confidence Levels**:
- **90%+**: Highly confident - proceed
- **75-90%**: Confident - reliable recommendation
- **60-75%**: Moderate - review needed
- **<60%**: Low - manual classification recommended

### Method 2: MCP Tools (Most Powerful)

MCP tools provide programmatic access for complex workflows.

#### Tool 1: `detect_project_type`

Detect whether a project is a landing page or SaaS app.

**Input**:
```json
{
  "description": "Build a landing page for product launch"
}
```

**Output**:
```json
{
  "success": true,
  "project_type": "landing_page",
  "confidence": "85%",
  "reasoning": "Landing page indicators found...",
  "recommended_template": "boilerplate/landing-page"
}
```

#### Tool 2: `match_pattern`

Match a feature description to a Genesis pattern.

**Input**:
```json
{
  "feature_name": "hero section",
  "description": "Hero with headline and CTA",
  "project_type": "landing_page"
}
```

**Output**:
```json
{
  "success": true,
  "pattern": {
    "id": "lp_hero_section",
    "name": "Hero Section",
    "category": "landing_page",
    "estimated_time_minutes": 15,
    "complexity": "simple"
  },
  "confidence": "90%"
}
```

#### Tool 3: `generate_code`

Generate production-ready code from a Genesis pattern.

**Input**:
```json
{
  "pattern_id": "lp_hero_section",
  "feature_name": "hero",
  "output_dir": "./src",
  "dry_run": false
}
```

**Output**:
```json
{
  "success": true,
  "pattern_used": "Hero Section",
  "files_generated": 1,
  "files_written": ["components/Hero.tsx"],
  "total_lines": 160
}
```

#### Tool 4: `list_patterns`

List all available Genesis patterns.

**Input**:
```json
{
  "category": "landing_page"
}
```

**Output**:
```json
{
  "success": true,
  "count": 6,
  "patterns": [
    {
      "id": "lp_hero_section",
      "name": "Hero Section",
      "category": "landing_page",
      "estimated_time_minutes": 15,
      "complexity": "simple"
    },
    ...
  ]
}
```

#### Tool 5: `estimate_time`

Estimate implementation time for a list of features.

**Input**:
```json
{
  "features": ["hero", "contact", "pricing"],
  "project_type": "landing_page"
}
```

**Output**:
```json
{
  "success": true,
  "features_count": 3,
  "sequential_time_minutes": 65,
  "parallel_time_minutes": 38,
  "speedup": "1.71x"
}
```

## Workflows

### Workflow 1: New Project Generation

Generate a complete project from scratch:

```bash
# Step 1: Detect project type
/detect-project "Build a SaaS app for team collaboration"
# → Detected: saas_app (90% confidence)

# Step 2: Generate full project
/autonomous-project "SaaS app for team collaboration"
# → Generates: auth, dashboard, team management, settings
# → Time: ~75 minutes
# → Files: 12 files, ~1,400 lines
```

### Workflow 2: Add Feature to Existing Project

Add a single feature to an existing project:

```bash
# Detect best pattern
/autonomous-generate "billing and subscription management"
# → Matched: saas_billing pattern
# → Generates: billing page, Stripe integration, webhook handler
# → Files: 5 files, ~450 lines
```

### Workflow 3: Validate Before Generation

Check what would be generated before running:

```bash
# Dry run
/autonomous-generate "hero section" --dry-run
# → Preview: components/Hero.tsx (160 lines)
# → No files written

# If satisfied, generate for real
/autonomous-generate "hero section"
# → Generated: components/Hero.tsx
```

### Workflow 4: Parallel Multi-Feature Generation

Generate multiple features simultaneously:

```bash
/autonomous-project "landing page" --features="hero,features,pricing,faq" --parallel=3
# → Batch 1 (parallel): hero, features, pricing
# → Batch 2: faq
# → Total time: ~25 minutes (vs 70 minutes sequential)
# → Speedup: 2.8x
```

## Generated Code Quality

All generated code includes:

- ✅ **TypeScript** - Full type safety
- ✅ **React 18+** - Modern hooks (useState, useContext, useEffect)
- ✅ **Next.js App Router** - Latest routing conventions
- ✅ **Tailwind CSS** - Responsive design
- ✅ **Accessible** - ARIA attributes, semantic HTML
- ✅ **Error Handling** - Proper try/catch and error states
- ✅ **Loading States** - User feedback during async operations
- ✅ **Validation** - Form validation with clear error messages
- ✅ **TODO Markers** - Clear integration points for custom logic

## Performance

### Landing Page Project (5 features)
- **Baseline** (manual): 100 minutes
- **Genesis** (parallel): 40 minutes
- **Speedup**: 2.5x (60% faster)

### SaaS Application (7 features)
- **Baseline** (manual): 205 minutes
- **Genesis** (parallel): 75 minutes
- **Speedup**: 2.7x (63% faster)

### Code Generation Speed
- Pattern detection: <100ms
- Code generation: <1 second
- File writing: <1 second
- **Total**: <5 seconds per pattern

## Troubleshooting

### MCP Server Not Starting

**Symptom**: Tools not appearing in Claude Code

**Solutions**:
1. Check Python path in `mcp.json`
2. Verify virtual environment exists: `ls venv/bin/python`
3. Test server manually:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | venv/bin/python genesis-agents-mcp/server.py
```
4. Check for import errors in output
5. Restart Claude Code

### Missing Dependencies

**Symptom**: `ModuleNotFoundError: No module named 'httpx'`

**Solution**:
```bash
cd /home/klatt42/Developer/projects/project-genesis
venv/bin/pip install -r agents/requirements.txt
```

### Pattern Not Found

**Symptom**: "No pattern match found"

**Solutions**:
1. Use `/detect-project` to see available patterns
2. Be more specific in feature description
3. Use `--pattern` flag to specify pattern ID
4. Check pattern list: `/list-patterns`

### Low Confidence Match

**Symptom**: Pattern matched with <60% confidence

**Solutions**:
1. Add more keywords to feature description
2. Specify project type with `--project-type`
3. Manually specify pattern with `--pattern`
4. Use `/detect-project` to clarify project type first

### Files Already Exist

**Symptom**: "Files skipped (already exist)"

**Solutions**:
1. Use `--dry-run` to preview first
2. Use different output directory with `--output`
3. Delete existing files if you want to regenerate
4. Rename existing files to back them up

## Best Practices

### ✅ Do

1. **Start with detection**: Use `/detect-project` to understand your project type
2. **Preview first**: Use `--dry-run` to see what will be generated
3. **Provide context**: Give descriptive feature names (e.g., "hero section with gradient background and CTA buttons")
4. **Review code**: Always review generated code before committing
5. **Complete TODOs**: Fill in integration points marked with TODO comments
6. **Use parallel**: Let the system run features in parallel for 2-3x speedup
7. **Install dependencies**: Run `npm install` after generation

### ❌ Don't

1. **Skip detection**: Don't guess project type - let the system detect it
2. **Generate blindly**: Don't skip `--dry-run` for unfamiliar patterns
3. **Overwrite without backup**: Don't generate into existing files without backup
4. **Skip testing**: Don't deploy without testing generated code
5. **Forget env vars**: Don't skip environment variable configuration
6. **Exceed 5 parallel**: Diminishing returns beyond 5 parallel agents

## Examples

### Example 1: Complete Landing Page

```bash
# Detect type
/detect-project "Product launch landing page with hero, features, pricing, and contact form"
# → landing_page (90%)

# Generate full project
/autonomous-project "Product launch landing page" --features="hero,features,pricing,contact,faq"
# → Generated: 8 files, ~1,100 lines
# → Time: ~40 minutes
# → Files:
#   - components/Hero.tsx
#   - components/Features.tsx
#   - components/Pricing.tsx
#   - components/ContactForm.tsx
#   - components/FAQ.tsx
#   - app/page.tsx
#   - app/api/contact/route.ts
#   - README.md

# Next steps:
# 1. npm install
# 2. Configure .env (email API keys)
# 3. Customize content
# 4. npm run dev
```

### Example 2: Add Authentication to Existing SaaS

```bash
# Add auth feature
/autonomous-generate "user authentication with login and signup"
# → Matched: saas_authentication (95%)
# → Generated: 4 files, ~600 lines
# → Files:
#   - app/(auth)/login/page.tsx
#   - app/(auth)/signup/page.tsx
#   - lib/auth/config.ts
#   - middleware.ts

# Next steps:
# 1. npm install next-auth bcrypt
# 2. Configure NextAuth.js in lib/auth/config.ts
# 3. Set up database schema
# 4. Test login/signup flows
```

### Example 3: Multi-Feature SaaS Dashboard

```bash
# Generate complete SaaS
/autonomous-project "Task management SaaS" --features="auth,dashboard,settings,team,notifications" --parallel=3
# → Batch 1 (parallel): auth, dashboard, settings
# → Batch 2 (parallel): team, notifications
# → Time: ~75 minutes
# → Files: 12 files, ~1,400 lines

# Next steps:
# 1. npm install (all dependencies)
# 2. Set up Prisma database
# 3. Configure NextAuth.js
# 4. Customize dashboard widgets
# 5. npm run dev
```

## Integration Points

After generation, customize these integration points:

### Landing Page Projects
- **Hero CTA**: Update CTA buttons to link to your signup/product
- **Contact Form**: Configure email service (Resend, SendGrid, etc.)
- **Pricing**: Update pricing tiers and Stripe links
- **Content**: Replace placeholder text with your copy

### SaaS Projects
- **Database**: Configure Prisma schema and migrations
- **Authentication**: Set up NextAuth providers (GitHub, Google, etc.)
- **Stripe**: Add Stripe keys and webhook endpoints
- **Business Logic**: Implement custom features in TODO sections
- **Styling**: Adjust colors/branding to match your design system

## Advanced Usage

### Custom Patterns

Create custom patterns by extending `GenesisPatternLibrary`:

```python
# agents/genesis_feature/core/pattern_library.py
patterns["custom_analytics"] = GenesisPattern(
    id="custom_analytics",
    name="Analytics Dashboard",
    category="saas_app",
    description="Custom analytics with charts and metrics",
    keywords=["analytics", "charts", "metrics", "dashboard"],
    components=["AnalyticsDashboard", "ChartCard"],
    files_to_create=["components/Analytics.tsx"],
    dependencies=["recharts"],
    estimated_time_minutes=35,
    complexity="medium"
)
```

### Extending Code Generator

Add custom code generation logic:

```python
# agents/genesis_feature/core/code_generator.py
def _generate_custom_feature(self, feature_spec):
    """Generate custom feature."""
    # Your custom generation logic
    return [GeneratedFile(...)]
```

## API Reference

See individual documentation:
- **MCP Server**: `genesis-agents-mcp/README.md`
- **Slash Commands**: `.claude/commands/*.md`
- **Pattern Library**: `agents/genesis_feature/core/pattern_library.py`
- **Code Generator**: `agents/genesis_feature/core/code_generator.py`

## Testing

Test the integration:

```bash
# Run end-to-end tests
cd agents/examples
python3 test_e2e.py

# Test MCP server
cd genesis-agents-mcp
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | ../venv/bin/python server.py

# Test individual tools
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_patterns","arguments":{}}}' | ../venv/bin/python server.py
```

## Roadmap

Future enhancements:
- [ ] Pattern auto-detection from existing code
- [ ] Custom pattern wizard
- [ ] Real-time progress streaming
- [ ] Integration with Genesis Blocks (future)
- [ ] AI-powered pattern suggestions
- [ ] Code refactoring patterns
- [ ] Database schema generation
- [ ] API documentation generation

## Support

**Documentation**:
- Phase 2 completion: `PHASE_2_COMPLETE.md`
- Step-by-step guide: `PHASE_2_STEP6_COMPLETE.md`
- Pattern library: `agents/genesis_feature/core/pattern_library.py`

**Testing**:
- Test suite: `agents/examples/test_e2e.py`
- MCP testing: `genesis-agents-mcp/README.md`

**Issues**:
- Check GitHub issues
- Review troubleshooting section above
- Test with `--dry-run` first

---

**Quick Start**: Just use `/autonomous-project "your idea"` and let Genesis build it autonomously!

**Status**: ✅ Phase 2 Complete - Claude Code 2 Integration Fully Operational
