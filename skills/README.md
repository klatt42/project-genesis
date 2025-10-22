# Genesis Skills v2.0

Genesis Skills transform the Genesis Kernel into an **intelligent, auto-loading development system** that eliminates repetitive context-setting.

## 🎯 What Are Genesis Skills?

Skills are specialized knowledge packages that Claude automatically loads when relevant. Instead of manually uploading Genesis docs to every Claude Project, Genesis skills:

- ✅ **Auto-load** when you start project work
- ✅ **Save 80% tokens** (10K vs 50K+ for full docs)
- ✅ **Compose intelligently** (multiple skills load together)
- ✅ **Work everywhere** (claude.ai, Claude Desktop, Claude Code, API)

## 🚀 Quick Start

```bash
# Clone Genesis repo
git clone https://github.com/YOUR_USERNAME/project-genesis.git
cd project-genesis

# Install Genesis skills (one-time setup)
cd skills
chmod +x install.sh
./install.sh

# Restart Claude Desktop
# Skills now load automatically! 🎉
```

## 📦 Skills Included

### Core Skills (5) - Always Available

**Auto-load when you start any Genesis project**

| Skill | Purpose | Triggers |
|-------|---------|----------|
| **genesis-core** | Master decision tree for project type selection | "new project", "genesis", "which template" |
| **genesis-landing-page** | Landing page patterns + GHL integration | "landing page", "lead generation" |
| **genesis-saas-app** | SaaS architecture + multi-tenancy | "saas", "multi-tenant", "authentication" |
| **genesis-stack-setup** | Integration setup (Supabase, GHL, CopilotKit) | "setup", "integration", "supabase" |
| **genesis-commands** | Command templates + workflows | "commands", "how to run" |

### Specialized Skills (6) - On-Demand

**Load automatically when specific work detected**

| Skill | Purpose | Triggers |
|-------|---------|----------|
| **genesis-copilotkit** | AI features + CopilotKit integration | "copilotkit", "ai features" |
| **genesis-supabase** | Database schema + RLS policies | "database", "schema", "rls" |
| **genesis-deployment** | Netlify deployment strategies | "deploy", "netlify", "production" |
| **genesis-archon** | Multi-service orchestration | "orchestration", "archon", "microservices" |
| **genesis-testing** | Testing + validation patterns | "test", "validation", "verify" |
| **genesis-thread-transition** | Context preservation + handoff | "transition", "new thread", "handoff" |

## 💡 How Skills Work

**Automatic Loading:**
```
You: "I need to create a landing page for lead generation"
Claude: [Automatically loads genesis-core + genesis-landing-page]
        "I'll help you create a Genesis landing page..."

You: "Deploy this SaaS app with multiple services"
Claude: [Automatically loads genesis-saas-app + genesis-deployment + genesis-archon]
        "I'll set up multi-service deployment..."
```

**Progressive Disclosure:**
- Skills load minimal metadata initially (~100 tokens each)
- Full details pulled only when needed
- You can have dozens of skills without context bloat

**Composition:**
- Skills reference each other intelligently
- Multiple skills combine automatically
- No manual orchestration required

## 📊 Token Efficiency

**Genesis Skills vs. Full Documentation:**

| Approach | Token Usage | Context Available |
|----------|-------------|-------------------|
| Full Genesis Docs | ~50,000 tokens | Limited workspace |
| Genesis Skills (all 11) | ~10,300 tokens | **80% more space!** |

This means **deeper conversations** before hitting context limits.

## 🔧 Usage Examples

### Starting a New Project
```
You: "I want to start a new Genesis project"
Claude: [Loads genesis-core]
        "I'll help you choose between Landing Page or SaaS templates..."
```

### Adding AI Features
```
You: "Add AI chat functionality with CopilotKit"
Claude: [Loads genesis-copilotkit + genesis-supabase]
        "I'll implement CopilotKit actions following Genesis patterns..."
```

### Complex Deployment
```
You: "Deploy with separate API and worker services"
Claude: [Loads genesis-deployment + genesis-archon]
        "I'll set up Archon orchestration for your multi-service architecture..."
```

## 🔄 Updating Skills

### Method 1: Direct Edit (Quick Fixes)
```bash
# Edit skill directly
code ~/.claude/skills/genesis/genesis-core/skill.md

# Restart Claude Desktop
# Done - skill updated everywhere
```

### Method 2: Regenerate from Factory (Major Updates)
```bash
cd ~/project-genesis/skills/factory/

# Update source docs
vim docs/LANDING_PAGE_TEMPLATE.md

# Regenerate skill
claude-code "Regenerate genesis-landing-page from updated docs"

# Install updated skill
cd ..
./install.sh
```

### Method 3: Pull from GitHub (Team Updates)
```bash
cd ~/project-genesis/
git pull origin main
cd skills
./install.sh
```

## 🏭 Skills Factory

Generate new Genesis skills systematically using the **Skills Factory**:

```bash
cd skills/factory/

# Generate new skill
claude-code "Using genesis-skills-factory-prompt.md, generate:
NAME: genesis-[domain]
PURPOSE: [description]
SOURCE: docs/[file].md
TOKEN_TARGET: 400"

# Review generated skill
cat generated/genesis-[domain]/skill.md

# Move to production
cp -r generated/genesis-[domain] ../specialized/

# Install
cd ..
./install.sh
```

See [factory/README.md](factory/README.md) for complete Skills Factory documentation.

## 📁 Directory Structure

```
skills/
├── core/                      # Production core skills (5)
│   ├── genesis-core/
│   ├── genesis-landing-page/
│   ├── genesis-saas-app/
│   ├── genesis-stack-setup/
│   └── genesis-commands/
│
├── specialized/               # Production specialized skills (6)
│   ├── genesis-copilotkit/
│   ├── genesis-supabase/
│   ├── genesis-deployment/
│   ├── genesis-archon/
│   ├── genesis-testing/
│   └── genesis-thread-transition/
│
├── factory/                   # Skills Factory tooling
│   ├── genesis-skills-factory-prompt.md
│   ├── docs/                  # Source documentation
│   ├── examples/              # Anthropic examples
│   └── generated/             # Generated skills (gitignored)
│
├── install.sh                 # Install all skills
├── uninstall.sh               # Remove Genesis skills
└── README.md                  # This file
```

## 🧪 Testing Skills

After installation, test each skill:

```bash
# Test 1: Core decision tree
"I want to start a new Genesis project"
# Should load: genesis-core

# Test 2: Landing page
"Create a landing page for lead generation"
# Should load: genesis-landing-page

# Test 3: Multi-service deployment
"Deploy my SaaS app with separate API services"
# Should load: genesis-saas-app + genesis-deployment + genesis-archon

# Test 4: AI features
"Add AI chat with CopilotKit"
# Should load: genesis-copilotkit
```

## 🤝 Contributing

### Adding New Skills

1. Document pattern in `docs/[PATTERN_NAME].md`
2. Generate skill using Skills Factory
3. Test skill triggers and accuracy
4. Move to `core/` or `specialized/`
5. Update this README
6. Commit to Genesis repo

### Improving Existing Skills

1. Update source docs in `docs/`
2. Regenerate skill from updated docs
3. Test updated skill
4. Replace in production directory
5. Run `install.sh` to update local installation
6. Commit changes

## 📚 Related Documentation

- **Full Genesis Docs**: `/docs` (for deep-dive reference)
- **Skills Factory Guide**: `factory/README.md`
- **Genesis Setup**: `/docs/PROJECT_KICKOFF_CHECKLIST.md`
- **Deployment**: `/docs/DEPLOYMENT_GUIDE.md`

## ❓ FAQ

**Q: Do skills replace Genesis documentation?**
A: No - skills are **quick reference**, docs are **deep dive**. Use both:
- Skills: 90% of daily work (auto-load patterns)
- Docs: Complex implementations, edge cases, learning

**Q: Can I use skills without installing them?**
A: No - skills must be in `~/.claude/skills/` to work. But installation is one command: `./install.sh`

**Q: Do skills work in the API?**
A: Yes! Same skill format works across claude.ai, Claude Desktop, Claude Code, and API.

**Q: How do I know which skills are loading?**
A: Watch Claude's responses - it will naturally reference Genesis patterns when skills load. You can also ask: "Which Genesis skills are you using?"

**Q: Can I customize skills for my team?**
A: Yes! Edit skills directly or regenerate from custom docs. Share via Git.

## 🎉 Benefits

### For Solo Developers
- ✅ Zero manual setup (install once, works forever)
- ✅ Automatic Genesis patterns (no more forgetting to upload docs)
- ✅ 80% more context space (token efficiency)
- ✅ Works everywhere (all Claude products)

### For Teams
- ✅ Instant onboarding (git clone + install.sh = done)
- ✅ Consistent patterns (everyone uses same Genesis)
- ✅ Easy updates (pull + reinstall)
- ✅ Collaborative improvement (PR workflow)

### For Genesis Evolution
- ✅ Modular (update skills independently)
- ✅ Scalable (add skills as patterns discovered)
- ✅ Composable (skills combine intelligently)
- ✅ Maintainable (regenerate from source docs)

---

## 🚀 Get Started

```bash
# Install Genesis Skills
cd ~/project-genesis/skills/
./install.sh

# Restart Claude Desktop

# Start building!
"I need to create a new Genesis project"
```

**Genesis v2.0 - Skills-First Architecture** 🎯

For support, see [GitHub Issues](https://github.com/YOUR_USERNAME/project-genesis/issues)
