# Genesis Agents MCP Server

Model Context Protocol server that exposes Genesis autonomous agents as tools for Claude Code.

## Features

Provides 5 MCP tools:

1. **detect_project_type** - Detect if a project is a landing page or SaaS app
2. **match_pattern** - Match feature descriptions to Genesis patterns
3. **generate_code** - Generate production-ready code from patterns
4. **list_patterns** - List all available Genesis patterns
5. **estimate_time** - Estimate implementation time for features

## Setup

### Option 1: Global MCP Configuration

Add to `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "genesis-agents": {
      "command": "python3",
      "args": [
        "/home/klatt42/Developer/projects/project-genesis/genesis-agents-mcp/server.py"
      ]
    }
  }
}
```

### Option 2: Project-Level MCP Configuration

Copy `mcp.json` to your project root and Claude Code will discover it automatically.

## Usage

### From Claude Code

The MCP tools are automatically available in Claude Code once configured:

```
Please detect what type of project this is: "Build a landing page for product launch"

Can you list all available Genesis patterns?

Generate code for the hero section pattern

Estimate how long it would take to build: authentication, dashboard, and settings
```

### Testing the Server

```bash
# Test directly
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | python3 server.py

# Test detect_project_type
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"detect_project_type","arguments":{"description":"Build a landing page"}}}' | python3 server.py
```

## Available Tools

### 1. detect_project_type

Detects whether a project is a landing page or SaaS app.

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

### 2. match_pattern

Matches a feature description to a Genesis pattern.

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

### 3. generate_code

Generates production-ready code from a Genesis pattern.

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

### 4. list_patterns

Lists all available Genesis patterns.

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
    }
  ]
}
```

### 5. estimate_time

Estimates implementation time for a list of features.

**Input**:
```json
{
  "features": ["hero section", "contact form", "pricing"],
  "project_type": "landing_page",
  "max_parallel": 3
}
```

**Output**:
```json
{
  "success": true,
  "features_count": 3,
  "sequential_time_minutes": 65,
  "parallel_time_minutes": 35,
  "speedup": "1.86x"
}
```

## Requirements

- Python 3.8+
- Genesis agents (in parent directory)
- Dependencies from `agents/requirements.txt`

## Troubleshooting

**Server not starting**:
- Check Python path in mcp.json
- Verify agents directory is accessible
- Check for import errors

**Tools not appearing**:
- Restart Claude Code after configuration
- Check MCP server logs
- Verify mcp.json syntax

**Import errors**:
- Install dependencies: `pip3 install -r ../agents/requirements.txt`
- Check PYTHONPATH includes project root

## Development

Run server in debug mode:

```bash
export DEBUG=1
python3 server.py
```

Test individual tools:

```bash
# List patterns
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_patterns","arguments":{}}}' | python3 server.py

# Generate code (dry run)
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"generate_code","arguments":{"pattern_id":"lp_hero_section","feature_name":"hero","dry_run":true}}}' | python3 server.py
```

## Architecture

```
genesis-agents-mcp/
├── server.py           # MCP server implementation
├── mcp.json           # MCP configuration
└── README.md          # This file

Integrates with:
../agents/
├── genesis_setup/     # Project type detection
├── genesis_feature/   # Pattern matching and code generation
└── shared/            # Shared utilities
```

## License

Same as Project Genesis
