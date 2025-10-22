# Docker MCP Setup for Project Genesis
## Complete Integration Guide

**Updated**: 2025-10-16
**Docker Version**: 28.4.0
**Docker Desktop**: 4.47.0
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Docker Desktop MCP Toolkit](#docker-desktop-mcp-toolkit)
3. [Installation & Setup](#installation--setup)
4. [Genesis-Critical MCPs](#genesis-critical-mcps)
5. [API Key Configuration](#api-key-configuration)
6. [Claude Code Integration](#claude-code-integration)
7. [Workflow Examples](#workflow-examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Docker MCP Toolkit?

Docker Desktop's MCP Toolkit provides container-based execution of Model Context Protocol (MCP) servers, making it significantly easier to manage and use multiple AI integrations.

**Key Benefits**:
- ✅ **Container Isolation**: Each MCP server runs in its own Docker container
- ✅ **One-Click Installation**: Visual catalog of pre-built MCP servers
- ✅ **Centralized Management**: Single interface for all MCP servers
- ✅ **Automatic Lifecycle**: Containers spin up/down as needed
- ✅ **No Manual Configuration**: GUI-based setup, no JSON editing

### Docker MCP vs Claude Code MCP

**Two Separate Systems**:

1. **Docker Desktop MCP Toolkit**:
   - Managed through Docker Desktop GUI
   - Container-based execution
   - Shared across all Claude clients (Claude Code, Claude Desktop, Cursor, etc.)
   - Configuration stored in Docker Desktop settings
   - Install from visual catalog

2. **Claude Code CLI MCPs**:
   - Configured via `claude mcp add` command
   - Project-specific or global configuration
   - Stored in `~/.claude.json`
   - Manual JSON configuration possible
   - Direct stdio or HTTP connections

**Both can work together!** You can use Docker Desktop MCPs for shared services and Claude Code MCPs for project-specific tools.

---

## Docker Desktop MCP Toolkit

### Current Setup Status

Based on your Docker Desktop screenshots and configuration:

#### ✅ Connected Clients

1. **Claude Code** - CONNECTED
   - Status: Active
   - Usage: Development and coding tasks
   - Integration: Working with project-specific MCPs

2. **Claude Desktop** - CONNECTED
   - Status: Active
   - Usage: General AI tasks and workflows
   - Integration: Working with all Docker MCPs

#### ⏸️ Available Clients (Not Connected)

3. **Continue.dev** - NOT CONNECTED
   - Capability: VS Code integration
   - Benefit: In-IDE AI coding assistance
   - To Connect: Click "Connect" in Docker Desktop MCP Toolkit

4. **Cursor** - NOT CONNECTED
   - Capability: AI-powered code editor
   - Benefit: Alternative coding environment
   - To Connect: Click "Connect" in Docker Desktop MCP Toolkit

5. **Gemini CLI** - NO CONFIG FOUND
   - Capability: Terminal-based AI
   - Status: Requires download
   - Optional: Only if needed

#### 🔧 Configured MCP Servers (11 Total)

From your Docker Desktop MCP Toolkit:

| Server | Tools | Status | API Key Required |
|--------|-------|--------|------------------|
| **Brave Search** | 6 | ⚠️ Needs API key | Yes |
| **Docker Hub** | 13 | ✅ Active | No |
| **DuckDuckGo** | 2 | ✅ Active | No |
| **Firecrawl** | 6 | ⚠️ Needs API key | Yes |
| **GitHub (Archived)** | 26 | ⚠️ Verify status | Yes (token) |
| **Hugging Face** | 9 | ✅ Active | No |
| **LinkedIn MCP** | 6 | ⚠️ Needs API key | Yes (optional) |
| **4 Additional Servers** | ~20-30 | Unknown | Unknown |

**Estimated Total**: ~88-98 tools available (106-116 with API keys configured)

---

## Installation & Setup

### Prerequisites

```bash
# Verify Docker Desktop is running
docker --version
# Expected: Docker version 28.4.0, build d8eb465

# Check Docker Desktop version
docker version | grep "Docker Desktop"
# Expected: Server: Docker Desktop 4.47.0
```

### Step 1: Enable Docker MCP Toolkit

1. **Open Docker Desktop**
2. **Navigate to Settings**
3. **Go to Beta Features** (or Features)
4. **Enable "Docker MCP Toolkit"**
5. **Click "Apply & Restart"**

### Step 2: Access MCP Toolkit

1. **Open Docker Desktop**
2. **Click "MCP Toolkit" tab** (should be in left sidebar)
3. **You'll see**:
   - **My Servers** tab - Your configured servers (11)
   - **Catalog** tab - Available servers to install
   - **Clients** tab - Connected applications

### Step 3: Verify Client Connections

1. **Go to "Clients" tab**
2. **Verify these are connected**:
   - ✅ Claude Code (should show "Disconnect" button)
   - ✅ Claude Desktop (should show "Disconnect" button)
3. **Optional**: Connect additional clients (Continue.dev, Cursor)

---

## Genesis-Critical MCPs

### Priority 1: Essential for Genesis Stack

These MCPs are critical for Project Genesis workflows:

#### 1. **Supabase MCP** - CRITICAL

**Status**: Not visible in your Docker MCP list - needs installation
**Priority**: Highest
**Why**: Genesis stack uses Supabase for database, auth, storage

**Installation**:
```bash
# Check if available in Docker MCP Catalog
# Docker Desktop → MCP Toolkit → Catalog → Search "Supabase"

# If not in catalog, install via Claude Code
cd ~/Developer/projects/project-genesis
claude mcp add supabase npx -y @supabase/mcp-server-supabase
```

**Configuration** (API keys to add later):
- `SUPABASE_URL`: Your project URL
- `SUPABASE_KEY`: Service role key

**Tools Provided** (~15-20):
- Database queries and mutations
- Auth management
- Storage operations
- RLS policy management
- Real-time subscriptions

#### 2. **Netlify MCP** - HIGH PRIORITY

**Status**: Not visible in your Docker MCP list - needs installation
**Priority**: High
**Why**: Genesis deployment target

**Installation**:
```bash
# Check Docker MCP Catalog first
# If not available, manual setup may be needed

# Alternative: Use GitHub Actions for Netlify deployment
# Document Netlify CLI usage in workflows
```

**Configuration** (API keys to add later):
- `NETLIFY_AUTH_TOKEN`: Personal access token
- `NETLIFY_SITE_ID`: Site ID for deployment

**Tools Needed**:
- Site deployment
- Function management
- Environment variables
- Build status monitoring

#### 3. **GoHighLevel MCP** - HIGH PRIORITY

**Status**: Not visible - likely needs custom implementation
**Priority**: High
**Why**: Genesis CRM and lead management

**Note**: GoHighLevel MCP may not exist in public catalogs. Options:
1. **Check Docker MCP Catalog** for community implementations
2. **Build custom MCP** using GoHighLevel API
3. **Use direct API integration** in Genesis code

**Configuration** (API keys to add later):
- `GHL_API_KEY`: GoHighLevel API key
- `GHL_LOCATION_ID`: Location ID for multi-location setups

**Tools Needed**:
- Contact management
- Workflow automation
- Lead tracking
- Form submission handling
- Calendar integration

#### 4. **Slack MCP** - MEDIUM PRIORITY

**Status**: Referenced in docs but not in server list
**Priority**: Medium
**Why**: Team communication automation

**Installation**:
```bash
# Install from Docker MCP Catalog
# Docker Desktop → MCP Toolkit → Catalog → Search "Slack"
# Click "Install"
```

**Configuration** (API keys to add later):
- `SLACK_BOT_TOKEN`: Bot user OAuth token
- `SLACK_APP_TOKEN`: App-level token (for Socket Mode)

**Tools Provided** (~10):
- Send messages to channels
- Read channel history
- File uploads
- User management
- Workspace info

### Priority 2: Development Enhancement

#### 5. **Obsidian MCP** - MEDIUM PRIORITY

**Status**: Referenced in workflow examples
**Priority**: Medium
**Why**: Knowledge management and documentation

**Installation**:
```bash
# Check Docker MCP Catalog
# Docker Desktop → MCP Toolkit → Catalog → Search "Obsidian"
```

**Configuration** (to add later):
- `OBSIDIAN_VAULT_PATH`: Path to your Obsidian vault
- `OBSIDIAN_REST_API_KEY`: If using Obsidian REST API plugin

**Tools Provided**:
- Note creation and editing
- Vault search
- Link management
- Tag management

#### 6. **Postgres MCP** - MEDIUM PRIORITY

**Status**: Unknown
**Priority**: Medium
**Why**: Direct database operations (complements Supabase)

**Installation**:
```bash
# Check Docker MCP Catalog
# Docker Desktop → MCP Toolkit → Catalog → Search "Postgres" or "PostgreSQL"
```

**Configuration** (to add later):
- `DATABASE_URL`: PostgreSQL connection string
- Or individual: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

**Tools Provided**:
- SQL queries
- Schema inspection
- Table management
- Migration support

### Priority 3: Currently Configured (Needs API Keys)

#### 7. **Brave Search MCP**

**Status**: ⚠️ Installed but needs API key
**Tools**: 6
**Purpose**: Web search integration

**To Configure**:
1. Get API key from: https://brave.com/search/api/
2. Docker Desktop → MCP Toolkit → My Servers → Brave Search → Configure
3. Add: `BRAVE_API_KEY=your_key_here`
4. No restart needed - Docker handles it

#### 8. **Firecrawl MCP**

**Status**: ⚠️ Installed but needs API key
**Tools**: 6
**Purpose**: Web scraping and data extraction

**To Configure**:
1. Get API key from: https://firecrawl.dev/
2. Docker Desktop → MCP Toolkit → My Servers → Firecrawl → Configure
3. Add: `FIRECRAWL_API_KEY=your_key_here`

#### 9. **LinkedIn MCP** (Optional)

**Status**: ⚠️ Installed but needs API key
**Tools**: 6
**Purpose**: Professional network automation

**To Configure Later** (when needed):
1. LinkedIn Developer Portal: https://www.linkedin.com/developers/
2. Create app and get OAuth credentials
3. Docker Desktop → MCP Toolkit → My Servers → LinkedIn → Configure
4. Add: `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`

#### 10. **GitHub MCP**

**Status**: ⚠️ Shows "(Archived)" - needs verification
**Tools**: 26
**Purpose**: Repository management, issues, PRs

**To Verify and Fix**:
```bash
# Test in Claude Code
# "List my GitHub repositories using GitHub MCP"

# If broken, reinstall:
# 1. Docker Desktop → MCP Toolkit → My Servers → GitHub → Remove
# 2. Catalog → Search "GitHub" → Install
# 3. Configure with GitHub token (classic, repo scope)
```

---

## API Key Configuration

### Philosophy: Infrastructure Now, Keys Later

You can install and configure all MCP servers **without API keys**. Add keys when you're ready to use each service.

### Storage Options

#### Option 1: Docker Desktop GUI (Recommended)

**Pros**:
- Visual interface
- Centralized management
- Easy updates

**Steps**:
1. Docker Desktop → MCP Toolkit → My Servers
2. Click server name → Configure
3. Add environment variables
4. Save (auto-applies)

#### Option 2: Environment Variables

**Pros**:
- System-level security
- Can use `.env` files
- Version control friendly (with `.gitignore`)

**Setup**:
```bash
# Add to ~/.bashrc or ~/.zshrc
export BRAVE_API_KEY="your-key-here"
export FIRECRAWL_API_KEY="your-key-here"
export SUPABASE_URL="your-url-here"
export SUPABASE_KEY="your-key-here"
export NETLIFY_AUTH_TOKEN="your-token-here"
export GHL_API_KEY="your-key-here"
export SLACK_BOT_TOKEN="your-token-here"
export GITHUB_TOKEN="your-token-here"

# Reload shell
source ~/.bashrc  # or source ~/.zshrc
```

**In Docker MCP Config**:
```bash
# Reference environment variables
BRAVE_API_KEY=${BRAVE_API_KEY}
FIRECRAWL_API_KEY=${FIRECRAWL_API_KEY}
```

### API Key Acquisition Checklist

**Get these when ready**:

- [ ] **Brave Search**: https://brave.com/search/api/ (free tier: 2000 queries/month)
- [ ] **Firecrawl**: https://firecrawl.dev/ (free tier: 500 credits)
- [ ] **GitHub**: https://github.com/settings/tokens (classic token, repo scope)
- [ ] **Supabase**: Your Supabase project dashboard (service_role key)
- [ ] **Netlify**: https://app.netlify.com/user/applications (personal access token)
- [ ] **Slack**: https://api.slack.com/apps (bot token after app creation)
- [ ] **LinkedIn**: https://www.linkedin.com/developers/ (OAuth app credentials)
- [ ] **GoHighLevel**: GHL agency dashboard (API key)

---

## Claude Code Integration

### Project-Specific MCP Configuration

Claude Code can have project-specific MCPs alongside Docker Desktop MCPs.

#### Check Current Project MCPs

```bash
cd ~/Developer/projects/project-genesis

# View project MCP configuration
cat ~/.claude.json | jq '.projects."/home/klatt42/Developer/projects/project-genesis".mcpServers'

# Expected: empty {} or specific servers
```

#### Recommended Setup for Genesis

**Docker Desktop MCPs** (shared across all projects):
- Brave Search
- DuckDuckGo
- Firecrawl
- Docker Hub
- Hugging Face
- GitHub
- Slack
- LinkedIn

**Project-Specific MCPs** (in Genesis project):
- Archon OS (already configured at http://localhost:8051/mcp)
- Supabase (project-specific database)
- Superdesign (custom Genesis MCP)

#### Configure Archon MCP for Genesis

```bash
cd ~/Developer/projects/project-genesis

# Add Archon MCP (if not already present)
claude mcp add archon --url http://localhost:8051/mcp

# Verify
claude mcp list
```

#### Configure Supabase MCP for Genesis

```bash
cd ~/Developer/projects/project-genesis

# Add Supabase MCP
claude mcp add supabase npx -y @supabase/mcp-server-supabase

# Will prompt for configuration later when keys are available
```

### Testing MCP Access

```bash
# Start Claude Code in Genesis project
cd ~/Developer/projects/project-genesis
claude

# Test Docker Desktop MCP
# "Use DuckDuckGo to search for 'Claude Code best practices'"

# Test Archon MCP
# "List all tasks in Archon"

# Test project-specific MCP
# "Check Supabase database schema" (after keys configured)
```

---

## Workflow Examples

### Workflow 1: Genesis Landing Page Development

**Scenario**: Generate and deploy a landing page with quality validation

**MCPs Used**:
- Archon OS (project orchestration)
- Supabase (database setup)
- Chrome DevTools (quality validation - via Claude Code MCP)
- GitHub (version control)
- Netlify (deployment)

**Steps**:
```
1. "Create new Genesis landing page project for [client name]"
   → Archon MCP: Create project structure
   → GitHub MCP: Initialize repository

2. "Generate hero section with contact form"
   → Archon MCP: Use Genesis Agents to generate code
   → Supabase MCP: Create form submission table

3. "Setup database and auth"
   → Supabase MCP: Configure schema, RLS policies

4. "Run quality validation"
   → Chrome DevTools MCP: Test on localhost:3000
   → Generate quality report

5. "Deploy to Netlify"
   → GitHub MCP: Commit changes
   → Netlify MCP: Deploy and get URL
```

### Workflow 2: Content Research Pipeline

**Scenario**: Research topic, extract insights, document findings

**MCPs Used**:
- Brave Search (web research)
- Firecrawl (extract content)
- Obsidian (documentation)
- Slack (team notification)

**Steps**:
```
1. "Research latest Next.js 14 features"
   → Brave Search MCP: Find recent articles
   → Firecrawl MCP: Extract content from top 5 results

2. "Summarize findings"
   → Claude: Analyze and synthesize content

3. "Create documentation"
   → Obsidian MCP: Create note in Genesis vault
   → Add tags, links, formatting

4. "Notify team"
   → Slack MCP: Post summary to #genesis-updates channel
```

### Workflow 3: Client Onboarding Automation

**Scenario**: New client inquiry → project setup → first deliverable

**MCPs Used**:
- Slack (inquiry notification)
- Archon OS (project setup)
- Supabase (database)
- GoHighLevel (CRM)
- GitHub (repository)
- Netlify (deployment)

**Steps**:
```
1. Monitor for new client inquiries
   → Slack MCP: Read #new-clients channel

2. Create project infrastructure
   → GitHub MCP: Create new repository
   → Supabase MCP: Create new project
   → Archon MCP: Initialize Genesis project structure

3. Add to CRM
   → GoHighLevel MCP: Create contact
   → Add to onboarding workflow

4. Generate initial landing page
   → Archon MCP: Use Genesis patterns
   → Generate branded landing page

5. Deploy and share
   → Netlify MCP: Deploy to preview URL
   → Slack MCP: Share preview link with team
```

### Workflow 4: Code Review and Deployment

**Scenario**: PR created → review → test → deploy

**MCPs Used**:
- GitHub (PR management)
- Chrome DevTools (testing)
- Slack (notifications)
- Netlify (deployment)

**Steps**:
```
1. PR created trigger
   → GitHub MCP: Detect new PR

2. Automated code review
   → GitHub MCP: Read changed files
   → Claude: Analyze for quality, security, Genesis compliance

3. Test deployment
   → Netlify MCP: Create deploy preview
   → Chrome DevTools MCP: Run quality validation

4. Post review
   → GitHub MCP: Add review comments
   → Request changes if quality < 8.0

5. Notify team
   → Slack MCP: Post PR summary and quality score
```

---

## Troubleshooting

### Docker Desktop MCP Issues

#### Issue: "Docker Desktop is not running"

**Symptoms**: MCP commands fail, Docker Desktop shows offline

**Solutions**:
```bash
# 1. Verify Docker is actually running
docker ps

# 2. Check Docker context
docker context ls
# Should show "default" as active

# 3. Switch to default context if needed
docker context use default

# 4. Restart Docker Desktop
# Close Docker Desktop completely
# Restart from Windows Start menu or Applications folder

# 5. Verify connection
docker version
```

#### Issue: Claude Code Not Connecting to Docker MCPs

**Symptoms**: Docker MCPs not available in Claude Code

**Solutions**:
```bash
# 1. Check Docker Desktop MCP Toolkit
# Open Docker Desktop → MCP Toolkit → Clients
# Verify Claude Code shows "Connected" status

# 2. If "Connect" button visible, click it
# Docker Desktop will establish connection

# 3. Restart Claude Code
exit  # Exit Claude Code
claude  # Restart

# 4. Test connection
# In Claude Code: "Use DuckDuckGo to search for test query"
```

#### Issue: MCP Server Shows "Failed to Connect"

**Symptoms**: Specific MCP server failing health check

**Solutions**:
```bash
# 1. Check Docker containers
docker ps -a | grep mcp

# 2. Check container logs
docker logs [container-name]

# 3. Restart specific MCP in Docker Desktop
# MCP Toolkit → My Servers → [Server] → Restart

# 4. Remove and reinstall
# MCP Toolkit → My Servers → [Server] → Remove
# Catalog → Search for server → Install
```

#### Issue: API Key Not Working

**Symptoms**: MCP installed but tools return authentication errors

**Solutions**:
```bash
# 1. Verify API key is correct
# Copy from source, paste carefully

# 2. Check key format
# Some services need "Bearer " prefix
# Some need specific headers

# 3. Update in Docker Desktop
# MCP Toolkit → My Servers → [Server] → Configure
# Update environment variable
# Save (no restart needed)

# 4. Test with simple query
# "Use Brave Search to find 'test query'"
```

### WSL-Specific Issues

#### Issue: Docker Commands Timeout in WSL

**Solutions**:
```bash
# 1. Ensure Docker Desktop WSL integration is enabled
# Docker Desktop → Settings → Resources → WSL Integration
# Enable for your WSL distribution

# 2. Restart WSL
wsl --shutdown
# Reopen WSL terminal

# 3. Verify Docker socket
ls -la /var/run/docker.sock
# Should exist and be accessible

# 4. Check Docker Desktop is running in Windows
# Task Manager → Docker Desktop should be running
```

#### Issue: Chrome DevTools MCP Not Working in WSL

**Note**: Chrome DevTools MCP requires browser access, which can be tricky in WSL

**Solutions**:
```bash
# Option 1: Use Windows Chrome (Recommended)
export CHROME_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"

# Option 2: Install X Server and WSL Chrome
# Install VcXsrv or X410 in Windows
export DISPLAY=:0
sudo apt install google-chrome-stable

# Test
google-chrome --version
```

### Performance Issues

#### Issue: Docker Using Too Much Memory

**Solutions**:
```bash
# 1. Check Docker resource usage
docker stats --no-stream

# 2. Adjust in Docker Desktop
# Settings → Resources → Advanced
# Set reasonable limits:
# - Memory: 4-8GB (you have plenty)
# - CPU: 4 cores
# - Disk: 100GB

# 3. Prune unused containers
docker system prune -a

# 4. MCP containers are lightweight
# They spin up/down automatically
# Only active MCPs consume resources
```

#### Issue: Slow MCP Responses

**Solutions**:
```bash
# 1. Check network connectivity
ping google.com

# 2. Check container status
docker ps --format "table {{.Names}}\t{{.Status}}"

# 3. Restart slow container
# Docker Desktop → Containers → [MCP Container] → Restart

# 4. Check API rate limits
# Some services throttle requests
# Verify you're within free tier limits
```

### Getting Help

**Docker MCP Documentation**:
- Docker Desktop → Help → Documentation
- Docker MCP GitHub: https://github.com/docker/mcp-gateway

**Claude Code Support**:
- Docs: https://docs.claude.com/en/docs/claude-code
- Issues: https://github.com/anthropics/claude-code/issues

**Project Genesis**:
- Discussions: https://github.com/klatt42/project-genesis/discussions
- Issues: https://github.com/klatt42/project-genesis/issues

---

## Success Metrics

**You'll know Docker MCP is fully operational when**:

- [ ] All configured servers show green/active status (no "SECRETS REQUIRED")
- [ ] Can use MCPs from Claude Code: "Use DuckDuckGo to search..."
- [ ] Can use MCPs from Claude Desktop
- [ ] Genesis-critical MCPs installed (Supabase, Archon, GitHub)
- [ ] At least one multi-MCP workflow tested successfully
- [ ] API keys configured for services you're actively using
- [ ] No "Failed to connect" errors in `claude mcp list`
- [ ] Docker containers spin up/down automatically
- [ ] Quality validation workflow works (Chrome DevTools + Archon)

---

## Next Steps

### Immediate Actions (Today)

1. **Verify Docker MCP Toolkit is enabled**
   - Open Docker Desktop → MCP Toolkit tab
   - Confirm 11 servers are visible

2. **Check client connections**
   - Verify Claude Code and Claude Desktop are connected
   - Test: "Use DuckDuckGo to search for 'Project Genesis'"

3. **Identify missing Genesis MCPs**
   - Check for Supabase in catalog
   - Note if Netlify or GoHighLevel available

### This Week

4. **Install Genesis-critical MCPs**
   - Supabase (priority 1)
   - Check for Netlify/custom implementation
   - Document GoHighLevel integration approach

5. **Configure API keys for active services**
   - Start with Brave Search (web research)
   - Add GitHub token (repository management)
   - Add others as needed for workflows

6. **Test multi-MCP workflow**
   - Try "Content Research Pipeline" example
   - Document any issues
   - Refine workflow for Genesis use cases

### Next 2 Weeks

7. **Create Genesis-specific workflows**
   - Landing page generation + deployment
   - Quality validation pipeline
   - Client onboarding automation

8. **Document custom patterns**
   - Add workflow templates to Genesis docs
   - Create reusable prompt templates
   - Share with Genesis community

9. **Optimize performance**
   - Monitor Docker resource usage
   - Adjust container limits if needed
   - Profile MCP response times

---

## Appendix: MCP Server Recommendations

### For Genesis Landing Page Projects

**Essential**:
- ✅ Supabase (database, auth)
- ✅ GitHub (version control)
- ✅ Netlify (deployment)
- ✅ Chrome DevTools (quality validation)
- ✅ Archon OS (project orchestration)

**Highly Recommended**:
- 🔄 GoHighLevel (CRM, leads)
- 🔄 Slack (team communication)
- 🔄 Brave Search (research)
- 🔄 Firecrawl (competitive analysis)

### For SaaS Application Projects

**Essential**:
- ✅ Supabase (backend)
- ✅ GitHub (version control)
- ✅ Postgres (direct DB access)
- ✅ Stripe MCP (if available - payments)

**Highly Recommended**:
- 🔄 SendGrid MCP (email)
- 🔄 Twilio MCP (SMS)
- 🔄 Sentry MCP (error tracking)

### For Content & Research Projects

**Essential**:
- ✅ Brave Search or DuckDuckGo
- ✅ Firecrawl
- ✅ Obsidian

**Highly Recommended**:
- 🔄 YouTube Transcripts MCP
- 🔄 OpenAI MCP (multi-model)
- 🔄 Slack (sharing)

---

**Documentation Status**: Ready for Implementation
**Last Updated**: 2025-10-16
**Version**: 1.0
**Maintainer**: Project Genesis Team

**🚀 Ready to supercharge your Genesis development with Docker MCPs!**
