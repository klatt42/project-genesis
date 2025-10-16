# MCP Setup Complete ✅

**Date**: 2025-10-16
**Status**: Claude Desktop and Claude Code configured with Genesis Agents MCP

---

## What Was Configured

### 1. Claude Desktop MCP Connection ✅

**Config File**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "perplexity-mcp": { ... },
    "genesis-agents": {
      "command": "/home/klatt42/Developer/projects/project-genesis/venv/bin/python",
      "args": [
        "/home/klatt42/Developer/projects/project-genesis/genesis-agents-mcp/server.py"
      ],
      "env": {}
    }
  }
}
```

### 2. Claude Code MCP Connection ✅

**Config File**: `~/.config/claude-code/mcp_settings.json`

```json
{
  "mcpServers": {
    "genesis-agents": {
      "command": "/home/klatt42/Developer/projects/project-genesis/venv/bin/python",
      "args": [
        "/home/klatt42/Developer/projects/project-genesis/genesis-agents-mcp/server.py"
      ],
      "env": {}
    }
  }
}
```

### 3. MCP Server Verified ✅

**Test Results**:
- ✅ Server initializes correctly
- ✅ Protocol version: `2024-11-05`
- ✅ 5 tools registered and working:
  1. `detect_project_type`
  2. `match_pattern`
  3. `generate_code`
  4. `list_patterns`
  5. `estimate_time`

---

## How to Use

### In Claude Desktop

**Restart Claude Desktop** first to load the new MCP server.

Then you can use natural language commands:

```
Can you list all available Genesis patterns?

Please detect what type of project this is: "Build a landing page for product launch"

Match this feature to a pattern: "hero section with CTA buttons"

Generate code for the hero section pattern

Estimate implementation time for: hero section, contact form, and pricing page
```

### In Claude Code

**Restart Claude Code** (exit and restart) to load the new MCP server.

Then use the same natural language commands as above. The MCP tools will be automatically available.

### Manual Testing

Test the server directly:

```bash
cd ~/Developer/projects/project-genesis

# Test initialization
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | \
  venv/bin/python genesis-agents-mcp/server.py

# List all tools
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | \
  venv/bin/python genesis-agents-mcp/server.py

# List patterns
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_patterns","arguments":{"category":"landing_page"}}}' | \
  venv/bin/python genesis-agents-mcp/server.py
```

---

## Available Tools

### 1. **detect_project_type**
Detect if a project is a landing page or SaaS app.

**Example**:
```
Detect project type: "Build a marketing website for my product"
```

**Returns**:
- Project type (landing_page or saas_app)
- Confidence level
- Reasoning
- Recommended template

### 2. **match_pattern**
Match a feature description to a Genesis pattern.

**Example**:
```
Match this feature: "hero section with headline and CTA buttons"
```

**Returns**:
- Matched pattern details
- Pattern ID
- Estimated implementation time
- Complexity level

### 3. **generate_code**
Generate production-ready code from a pattern.

**Example**:
```
Generate code for pattern "lp_hero_section" named "hero"
```

**Returns**:
- Files generated
- Total lines of code
- Files written to disk

### 4. **list_patterns**
List all available Genesis patterns.

**Example**:
```
List all landing page patterns
```

**Returns**:
- List of patterns with details
- IDs, names, descriptions
- Time estimates and complexity

### 5. **estimate_time**
Estimate implementation time for multiple features.

**Example**:
```
Estimate time for: hero, features, contact form, and pricing
```

**Returns**:
- Sequential time
- Parallel time (with 3 agents)
- Speedup factor

---

## Troubleshooting

### Claude Desktop Not Showing Tools

1. **Restart Claude Desktop** completely
2. Check config file syntax:
   ```bash
   cat ~/.config/Claude/claude_desktop_config.json | python3 -m json.tool
   ```
3. Verify Python path:
   ```bash
   /home/klatt42/Developer/projects/project-genesis/venv/bin/python --version
   ```

### Claude Code Not Showing Tools

1. **Exit and restart Claude Code**
2. Check config file:
   ```bash
   cat ~/.config/claude-code/mcp_settings.json
   ```
3. Try the `claude mcp list` command:
   ```bash
   claude mcp list
   ```

### MCP Server Errors

Check if the server runs manually:

```bash
cd ~/Developer/projects/project-genesis
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | \
  venv/bin/python genesis-agents-mcp/server.py
```

If errors occur:
- Check Python dependencies: `venv/bin/pip list`
- Check agent imports: `cd agents && ls`
- Review logs in Claude Desktop/Code

### "Tools not found" or "Connection failed"

1. Verify venv exists:
   ```bash
   ls /home/klatt42/Developer/projects/project-genesis/venv/bin/python
   ```

2. Test server directly (shown above)

3. Check file permissions:
   ```bash
   ls -l ~/Developer/projects/project-genesis/genesis-agents-mcp/server.py
   ```

---

## Connection Architecture

```
┌─────────────────────────┐
│   Claude Desktop        │
│   (MCP Client)          │
└───────────┬─────────────┘
            │ stdio
            ├─────────────────────┐
            │                     │
┌───────────▼─────────────┐      │
│   Claude Code           │      │
│   (MCP Client)          │      │
└───────────┬─────────────┘      │
            │ stdio              │
            │                    │
┌───────────▼────────────────────▼──┐
│   genesis-agents-mcp/server.py    │
│   (MCP Server - stdio-based)      │
│                                   │
│   Tools:                          │
│   - detect_project_type           │
│   - match_pattern                 │
│   - generate_code                 │
│   - list_patterns                 │
│   - estimate_time                 │
└───────────┬───────────────────────┘
            │ Python imports
┌───────────▼───────────────────────┐
│   Genesis Agents                  │
│   - ProjectTypeDetector           │
│   - PatternMatcher                │
│   - CodeGenerator                 │
│   - GenesisPatternLibrary         │
└───────────────────────────────────┘
```

---

## Next Steps

### 1. Test in Claude Desktop
- Restart Claude Desktop
- Try: `List all Genesis patterns`
- Verify tools appear and work

### 2. Test in Claude Code
- Restart Claude Code
- Try: `Detect project type: "landing page for startup"`
- Verify MCP tools are available

### 3. Use in Development
- Use MCP tools to detect project types
- Match features to patterns
- Generate code automatically
- Estimate implementation time

---

## About Archon MCP (Port 8051)

**Note**: The Archon MCP server (running on port 8051 in Docker) is separate from the Genesis Agents MCP server.

- **Archon MCP**: Task and project management (HTTP-based, port 8051)
- **Genesis Agents MCP**: Code generation and pattern matching (stdio-based, local)

If you want to connect to Archon MCP as well, we would need to create an additional stdio-based bridge that translates between stdio MCP protocol and Archon's HTTP/SSE endpoints.

---

## Backup Files

**Claude Desktop Config Backup**:
```bash
~/.config/Claude/claude_desktop_config.json.backup
```

To restore:
```bash
cp ~/.config/Claude/claude_desktop_config.json.backup \
   ~/.config/Claude/claude_desktop_config.json
```

---

## Summary

✅ **Claude Desktop**: Configured with genesis-agents MCP
✅ **Claude Code**: Configured with genesis-agents MCP
✅ **MCP Server**: Tested and working (5 tools available)
✅ **Communication**: stdio-based (standard MCP protocol)

**Ready to use!** Just restart both Claude clients.

---

**Last Updated**: 2025-10-16
**Maintainer**: Project Genesis Team
