# API Key Setup Guide
## Add Keys When You're Ready

**Philosophy**: Set up the infrastructure now, add API keys later when you need each service.

---

## 🔑 API Key Status Tracker

**Last Updated**: 2025-10-16

Use this checklist to track which API keys you've configured:

### Priority 1: Genesis Critical

- [ ] **Supabase**
  - Service: Database, Auth, Storage
  - Required for: Genesis landing pages and SaaS apps
  - Status: ⏸️ Not configured
  - Keys needed: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **GitHub**
  - Service: Repository management, Issues, PRs
  - Required for: Version control and deployment workflows
  - Status: ⏸️ Verify existing configuration
  - Keys needed: `GITHUB_TOKEN` (classic, repo scope)

- [ ] **Netlify**
  - Service: Deployment and hosting
  - Required for: Genesis project deployment
  - Status: ⏸️ Not configured
  - Keys needed: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

### Priority 2: Business Automation

- [ ] **GoHighLevel** (Optional until CRM workflows needed)
  - Service: CRM, Lead management
  - Required for: Client onboarding automation
  - Status: ⏸️ Not configured
  - Keys needed: `GHL_API_KEY`, `GHL_LOCATION_ID`

- [ ] **Slack** (Optional until team workflows needed)
  - Service: Team communication
  - Required for: Notification workflows
  - Status: ⏸️ Not configured
  - Keys needed: `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`

### Priority 3: Research & Enhancement

- [ ] **Brave Search**
  - Service: Web search
  - Required for: Research workflows
  - Status: ⏸️ Not configured
  - Keys needed: `BRAVE_API_KEY`
  - Free tier: 2,000 queries/month

- [ ] **Firecrawl**
  - Service: Web scraping
  - Required for: Competitive analysis, content extraction
  - Status: ⏸️ Not configured
  - Keys needed: `FIRECRAWL_API_KEY`
  - Free tier: 500 credits

- [ ] **LinkedIn** (Optional - for professional network automation)
  - Service: LinkedIn integration
  - Required for: Professional network workflows
  - Status: ⏸️ Not configured
  - Keys needed: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

---

## 📋 Quick Setup Instructions

### How to Add API Keys

**Two methods available**:

#### Method 1: Docker Desktop GUI (Easiest)

1. Open Docker Desktop
2. Go to **MCP Toolkit** → **My Servers**
3. Click on the server name (e.g., "Brave Search")
4. Click **Configure** or **Settings**
5. Add environment variables:
   ```
   BRAVE_API_KEY=your-actual-key-here
   ```
6. Click **Save**
7. ✅ Done! No restart needed

#### Method 2: Environment Variables (System-level)

```bash
# Add to ~/.bashrc or ~/.zshrc

# Supabase (Priority 1)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# GitHub (Priority 1)
export GITHUB_TOKEN="ghp_your-token-here"

# Netlify (Priority 1)
export NETLIFY_AUTH_TOKEN="your-netlify-token"
export NETLIFY_SITE_ID="your-site-id"

# GoHighLevel (Priority 2 - add when ready)
# export GHL_API_KEY="your-ghl-key"
# export GHL_LOCATION_ID="your-location-id"

# Slack (Priority 2 - add when ready)
# export SLACK_BOT_TOKEN="xoxb-your-bot-token"
# export SLACK_APP_TOKEN="xapp-your-app-token"

# Brave Search (Priority 3 - add when ready)
# export BRAVE_API_KEY="your-brave-key"

# Firecrawl (Priority 3 - add when ready)
# export FIRECRAWL_API_KEY="your-firecrawl-key"

# LinkedIn (Optional - add when ready)
# export LINKEDIN_CLIENT_ID="your-client-id"
# export LINKEDIN_CLIENT_SECRET="your-client-secret"

# Reload configuration
source ~/.bashrc  # or source ~/.zshrc
```

---

## 🔗 Where to Get API Keys

### Priority 1: Genesis Critical

#### **Supabase**

1. **Go to**: https://supabase.com/dashboard
2. **Navigate to**: Your project → Settings → API
3. **Copy**:
   - `URL`: Listed as "Project URL"
   - `service_role key`: Listed as "service_role" (⚠️ Keep secret!)
4. **Scopes**: Full database access, auth, storage

**Free Tier**: 500MB database, 1GB file storage, 2GB bandwidth

---

#### **GitHub**

1. **Go to**: https://github.com/settings/tokens
2. **Click**: "Generate new token" → "Generate new token (classic)"
3. **Name**: "Genesis Docker MCP"
4. **Scopes**: Check these boxes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Actions workflows)
   - ✅ `read:org` (Read organization data)
5. **Generate token**: Copy immediately (won't be shown again!)

**Token format**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

#### **Netlify**

1. **Go to**: https://app.netlify.com/user/applications
2. **Click**: "New access token"
3. **Description**: "Genesis Docker MCP"
4. **Generate token**: Copy immediately
5. **Site ID**: Found in Site settings → General → Site information

**Token format**: Long alphanumeric string

**Note**: Can also use Netlify CLI for deployment without API token

---

### Priority 2: Business Automation

#### **GoHighLevel** (CRM)

1. **Go to**: Your GHL Agency Dashboard
2. **Navigate to**: Settings → Integrations → API
3. **Create**: New API key
4. **Copy**: API key and Location ID (if multi-location)

**Note**: Requires GHL agency or location account

---

#### **Slack**

1. **Go to**: https://api.slack.com/apps
2. **Click**: "Create New App" → "From scratch"
3. **Name**: "Genesis Docker MCP"
4. **Select**: Your workspace
5. **Navigate to**: OAuth & Permissions
6. **Bot Token Scopes**: Add these scopes:
   - `channels:history`
   - `channels:read`
   - `chat:write`
   - `files:write`
   - `users:read`
7. **Install to Workspace**: Click button at top
8. **Copy**: Bot User OAuth Token (starts with `xoxb-`)

**Optional Socket Mode** (for real-time events):
1. Navigate to: Socket Mode
2. Enable Socket Mode
3. Generate: App-Level Token
4. Copy: Token (starts with `xapp-`)

**Free Tier**: Yes (up to 10 integrations per workspace)

---

### Priority 3: Research & Enhancement

#### **Brave Search**

1. **Go to**: https://brave.com/search/api/
2. **Sign up**: Create account (free)
3. **Navigate to**: Dashboard → API Keys
4. **Create**: New API key
5. **Copy**: API key

**Free Tier**: 2,000 queries per month
**Paid Tier**: $0.50 per 1,000 queries after free tier

**Token format**: Long alphanumeric string

---

#### **Firecrawl**

1. **Go to**: https://firecrawl.dev/
2. **Sign up**: Create account
3. **Navigate to**: Dashboard → API Keys
4. **Create**: New API key
5. **Copy**: API key

**Free Tier**: 500 credits
**Paid Tier**: Starts at $29/month for 5,000 credits

**Token format**: `fc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

#### **LinkedIn** (Optional)

1. **Go to**: https://www.linkedin.com/developers/
2. **Click**: "Create app"
3. **Fill in**: App details, verify
4. **Navigate to**: Auth tab
5. **Copy**: Client ID and Client Secret
6. **Configure**: Redirect URLs for OAuth flow

**Note**: Requires LinkedIn developer account approval
**Free Tier**: Limited API access

---

## 🔒 Security Best Practices

### DO ✅

- **Use environment variables** for API keys
- **Add `.env` to `.gitignore`** (never commit keys)
- **Rotate keys periodically** (every 90 days)
- **Use service-specific keys** (not personal access tokens when possible)
- **Monitor usage** (check API usage dashboards)
- **Set up alerts** (for unusual activity)
- **Use least privilege** (minimum scopes needed)

### DON'T ❌

- **Never commit API keys** to git repositories
- **Don't share keys** in Slack, email, or screenshots
- **Don't use production keys** in development (when possible)
- **Don't hardcode keys** in source code
- **Don't leave unused keys** active
- **Don't ignore security warnings** from services

---

## 🧪 Testing API Key Configuration

### After Adding Each Key

**Test in Claude Code**:

```bash
# Start Claude Code
cd ~/Developer/projects/project-genesis
claude

# Test each configured service:

# Supabase
"List all tables in the Supabase database"

# GitHub
"List my GitHub repositories"

# Netlify
"List my Netlify sites"

# Brave Search
"Use Brave Search to find 'Project Genesis'"

# Firecrawl
"Use Firecrawl to extract content from https://example.com"

# Slack
"List channels in my Slack workspace"
```

**Expected**: Service responds with data (or appropriate error if no data)

**If failing**: Check API key format, scopes, and expiration

---

## 📊 API Usage Monitoring

### Track Your Usage

**Set calendar reminders** to check these dashboards monthly:

- [ ] **Supabase**: https://supabase.com/dashboard/project/_/settings/billing
  - Monitor: Database size, bandwidth, auth users

- [ ] **GitHub**: https://github.com/settings/billing
  - Monitor: Actions minutes (if using CI/CD)

- [ ] **Netlify**: https://app.netlify.com/teams/[your-team]/billing
  - Monitor: Build minutes, bandwidth

- [ ] **Brave Search**: API dashboard
  - Monitor: Query count (free tier: 2,000/month)

- [ ] **Firecrawl**: Dashboard → Usage
  - Monitor: Credits used (free tier: 500)

- [ ] **Slack**: Workspace settings → Apps
  - Monitor: API calls, rate limits

### Free Tier Limits

**Know when you'll hit limits**:

| Service | Free Tier Limit | What Happens When Exceeded |
|---------|----------------|----------------------------|
| **Supabase** | 500MB DB, 1GB storage | Project paused |
| **GitHub** | Unlimited repos | Public repos always free |
| **Netlify** | 100GB bandwidth | Site offline |
| **Brave** | 2,000 queries/mo | API calls rejected |
| **Firecrawl** | 500 credits | API calls rejected |
| **Slack** | 10 integrations | Can't add more apps |

**Recommendations**:
- Start with free tiers
- Monitor usage weekly
- Upgrade when consistently hitting limits
- Set up billing alerts

---

## 🎯 Configuration Priority

### Week 1: Essential Setup

**Configure these first** (for basic Genesis workflows):

1. ✅ **GitHub** - Version control (critical)
2. ✅ **Supabase** - Database for projects (critical)
3. ⏸️ **Netlify** - Deployment (can use CLI instead)

**Time**: ~30 minutes to get all keys and configure

---

### Week 2: Enhanced Workflows

**Add these when ready** to use enhanced features:

4. ⏸️ **Brave Search** - Research workflows
5. ⏸️ **Firecrawl** - Content extraction

**Time**: ~15 minutes per service

---

### Later: Advanced Automation

**Add these when needed** for business automation:

6. ⏸️ **GoHighLevel** - CRM automation
7. ⏸️ **Slack** - Team notifications
8. ⏸️ **LinkedIn** - Professional network (optional)

**Time**: ~30 minutes per service (includes app setup)

---

## 📝 Configuration Log

**Keep track of what you've configured and when**:

```markdown
## My Configuration Log

### 2025-10-16
- [ ] Supabase: Not configured yet
- [ ] GitHub: Not configured yet
- [ ] Netlify: Not configured yet
- [ ] Brave Search: Not configured yet
- [ ] Firecrawl: Not configured yet
- [ ] Slack: Not configured yet
- [ ] GoHighLevel: Not configured yet
- [ ] LinkedIn: Not configured yet

### [Date] - First Configuration
- [x] GitHub: Configured with token ghp_****...
  - Scopes: repo, workflow
  - Tested: Successfully listed repositories

- [x] Supabase: Configured with project URL and service role key
  - Project: [project-name]
  - Tested: Successfully connected to database

### [Date] - Enhanced Workflows
- [x] Brave Search: Configured with API key
  - Free tier: 2,000 queries/month
  - Tested: Search query worked

[Add more entries as you configure services]
```

---

## 🆘 Troubleshooting

### Common Issues

#### "Invalid API Key"

**Possible causes**:
- Key expired
- Wrong format (extra spaces, missing prefix)
- Wrong key type (user token vs service token)
- Insufficient scopes

**Solutions**:
1. Regenerate key from service dashboard
2. Copy again (use Copy button, not manual selection)
3. Check key format in service docs
4. Verify scopes match requirements

---

#### "Rate Limit Exceeded"

**Possible causes**:
- Hit free tier limit
- Too many requests in short time
- Service downtime

**Solutions**:
1. Check usage dashboard
2. Wait for rate limit reset (usually hourly)
3. Upgrade to paid tier if needed
4. Implement caching to reduce API calls

---

#### "Authentication Failed"

**Possible causes**:
- Token revoked
- Workspace/organization changed
- Permissions changed

**Solutions**:
1. Check service dashboard for auth status
2. Regenerate token
3. Verify workspace/org access
4. Re-configure in Docker Desktop

---

## ✅ Quick Start Checklist

**To get Docker MCPs fully operational**:

### Today (15 minutes)

- [ ] Check Docker Desktop MCP Toolkit is enabled
- [ ] Verify Claude Code is connected
- [ ] Note which MCPs need API keys
- [ ] Decide which services to configure first

### This Week (1-2 hours)

- [ ] Get GitHub token
- [ ] Get Supabase credentials
- [ ] Configure both in Docker Desktop or ~/.bashrc
- [ ] Test both services in Claude Code
- [ ] Run first Genesis workflow

### Next Week (As Needed)

- [ ] Add Brave Search key (for research)
- [ ] Add Firecrawl key (for content extraction)
- [ ] Test multi-MCP workflow
- [ ] Document personal use cases

### Later (When Workflows Require)

- [ ] Add Slack (for team notifications)
- [ ] Add GoHighLevel (for CRM automation)
- [ ] Add other services as needed

---

## 📚 Additional Resources

**Service Documentation**:
- Supabase Docs: https://supabase.com/docs
- GitHub API Docs: https://docs.github.com/en/rest
- Netlify Docs: https://docs.netlify.com/
- Brave Search API: https://brave.com/search/api/docs/
- Firecrawl Docs: https://docs.firecrawl.dev/
- Slack API: https://api.slack.com/

**Security**:
- API Key Best Practices: https://owasp.org/www-project-api-security/
- GitHub Token Security: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure

**Project Genesis**:
- Docker MCP Setup: `docs/DOCKER_MCP_SETUP.md`
- MCP Workflow Templates: Coming soon

---

**Remember**: You don't need to configure all API keys immediately. Start with what you need for your current workflows, add more as you expand Genesis capabilities.

**Status**: Ready for Configuration
**Last Updated**: 2025-10-16
**Version**: 1.0
