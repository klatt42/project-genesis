# Project Genesis - Claude Code Context

## Genesis MCP Server

This project has access to the Genesis MCP Server, which provides programmatic access to all Genesis patterns and documentation.

### Available MCP Tools

1. **genesis_get_stack_pattern** - Get integration patterns for specific technologies
   - Parameters: `integration` (supabase, ghl, copilotkit, netlify, archon)
   - Use when: Implementing technology integrations
   - Example: Get Supabase authentication setup

2. **genesis_get_project_template** - Get complete project templates
   - Parameters: `type` (landing-page, saas-app)
   - Use when: Starting new projects or referencing architecture
   - Example: Get landing page template structure

3. **genesis_search_patterns** - Search across all Genesis documentation
   - Parameters: `query` (search string)
   - Use when: Looking for specific patterns or best practices
   - Example: Search for "authentication" or "deployment"

### When to Use Genesis MCP Tools

- **Before implementing features**: Use `genesis_search_patterns` to find relevant patterns
- **During Scout phase**: Use MCP tools instead of reading docs manually (50% context reduction)
- **For integrations**: Use `genesis_get_stack_pattern` for step-by-step setup guides
- **For architecture**: Use `genesis_get_project_template` for complete boilerplate reference

### Scout-Plan-Build Workflow

Genesis follows Anthropic's Scout-Plan-Build pattern:

1. **Scout**: Explore and understand (use MCP tools to query patterns)
2. **Plan**: Create detailed strategy (reference Genesis templates)
3. **Build**: Implement with validation (follow Genesis patterns)

### Context Optimization

When the MCP server is available, prefer MCP tool calls over reading documentation files directly. This reduces context usage by ~50% while maintaining access to all Genesis knowledge.

## Project Standards

- Follow Genesis patterns for all implementations
- Use Scout-Plan-Build workflow for complex features
- Validate with Chrome DevTools MCP (quality score ≥ 8.0)
- Test at all breakpoints (mobile, tablet, desktop)
