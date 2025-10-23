# Project Genesis

> The Genesis Kernel: Intelligent, Self-Loading Development System

Genesis transforms software development through an AI-native skills architecture that automatically loads the right knowledge at the right time.

## What is Genesis?

Genesis is a **skills-first development framework** that combines:

1. **Intelligent Skills Library** - Auto-loading AI skills that guide development
2. **Comprehensive Documentation** - Deep reference for complex scenarios
3. **Proven Stack Patterns** - Next.js 14, Supabase, Netlify, CopilotKit
4. **Skills Factory** - Systematic skill generation from documentation

## Quick Start

### Install Genesis Skills

```bash
# Clone repository
git clone https://github.com/yourusername/project-genesis.git
cd project-genesis

# Install skills (once per machine)
./skills/install.sh

# Restart Claude Desktop
# Skills now auto-load when relevant!
```

### Start a New Project

Just tell Claude what you need:

```
"I need to create a landing page for lead generation"
→ Claude loads genesis-landing-page skill automatically

"Build a SaaS application with user authentication"
→ Claude loads genesis-saas-app + genesis-stack-setup

"Deploy with multiple backend services"
→ Claude loads genesis-deployment + genesis-archon
```

## Architecture

Genesis operates in 3 tiers:

### Tier 1: Core Skills (Always Available)
**Token Budget**: ~2,000 tokens
**Auto-loads based on context**

- `genesis-core` - Master decision tree for project selection
- `genesis-landing-page` - Landing page patterns and GHL integration
- `genesis-saas-app` - Multi-tenant SaaS architecture
- `genesis-stack-setup` - Quick integration reference
- `genesis-commands` - Claude Code command templates

### Tier 2: Specialized Skills (On-Demand)
**Token Budget**: ~2,400 tokens
**Loads when specific keywords detected**

- `genesis-copilotkit` - AI features integration
- `genesis-supabase` - Database schema and RLS patterns
- `genesis-deployment` - Netlify deployment patterns
- `genesis-archon` - Multi-service orchestration
- `genesis-testing` - Validation patterns
- `genesis-thread-transition` - Context preservation

### Tier 3: Documentation (Deep Reference)
**Full knowledge base in /docs**
**Referenced for complex implementations**

## The Stack

### Core Technologies
- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth)
- **Deployment**: Netlify
- **AI**: CopilotKit (optional)

### Integrations
- **CRM**: GoHighLevel (landing pages)
- **Orchestration**: Archon (multi-service)
- **Monitoring**: Supabase Dashboard, Netlify Analytics

## Project Types

### Landing Page
**Use for**: Lead generation, marketing campaigns
**Timeline**: Days
**Features**: Form capture, GHL integration, SEO optimization

```bash
npx create-next-app@latest my-landing-page --typescript --tailwind --app
# Genesis guides the rest automatically
```

### SaaS Application
**Use for**: Multi-tenant apps, user management
**Timeline**: Weeks (iterative)
**Features**: Authentication, CRUD operations, subscriptions, AI features

```bash
npx create-next-app@latest my-saas-app --typescript --tailwind --app
# Genesis provides architecture patterns automatically
```

## Troubleshooting

### Skills Not Working?

If Genesis skills aren't invoking, you may need to update your Claude Code permissions:

**Symptom**: "skill invocations are being blocked by your system configuration"

**Quick Fix**:
1. Open `~/.claude/settings.local.json`
2. Add `"Skill"` to the `permissions.allow` array:
```json
{
  "permissions": {
    "allow": [
      "Skill",  // ← Add this!
      "Bash",
      "WebFetch",
      // ... other permissions
    ]
  }
}
```
3. Save and test with: "Create a landing page for a restaurant"

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for complete guide.

## Documentation

### For Users
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md) - **Start here if skills aren't working**
- [Project Kickoff Checklist](docs/PROJECT_KICKOFF_CHECKLIST.md) - Start here
- [Landing Page Template](docs/LANDING_PAGE_TEMPLATE.md) - Lead generation patterns
- [SaaS Architecture](docs/SAAS_ARCHITECTURE.md) - Multi-tenant patterns
- [Stack Setup Guide](docs/STACK_SETUP.md) - Integration instructions
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Netlify deployment

### For Advanced Users
- [Archon Patterns](docs/ARCHON_PATTERNS.md) - Multi-service orchestration
- [CopilotKit Integration](docs/COPILOTKIT_PATTERNS.md) - AI features
- [Claude Code Instructions](docs/CLAUDE_CODE_INSTRUCTIONS.md) - Development workflow
- [Thread Transition](docs/MILESTONE_COMPRESSION_CHECKLIST.md) - Context management

### For Skill Developers
- [Skills Factory](skills/factory/README.md) - Generate new skills
- [Skill Examples](skills/factory/examples/) - Reference implementations

## Skills Factory

Generate new Genesis skills systematically:

```bash
cd skills/factory/

# Generate a skill
claude-code "Using genesis-skills-factory-prompt.md, generate:
NAME: genesis-[domain]
PURPOSE: [purpose]
SOURCE: docs/[source].md
TOKEN_TARGET: 400"

# Review generated skill
cat generated/genesis-[domain]/skill.md

# Install to production
cp -r generated/genesis-[domain] ../specialized/
./install.sh
```

See [Skills Factory Documentation](skills/factory/README.md) for details.

## Benefits

### For Solo Developers
✅ Zero manual setup - Install once, works forever
✅ Automatic knowledge - Skills load when needed
✅ Token efficient - 2K vs 50K+ tokens
✅ Easy updates - Edit skills or regenerate
✅ Portable - Works in Claude Desktop, Code, API

### For Teams
✅ Fast onboarding - Install skills, start coding
✅ Consistency - Same patterns everywhere
✅ Collaboration - PR workflow for improvements
✅ Distribution - `git clone` + install = done

### For Genesis Evolution
✅ Modular - Update individual skills
✅ Scalable - Add skills as patterns emerge
✅ Composable - Skills combine intelligently
✅ Maintainable - Docs → regenerate skills

## Updating Skills

### Method 1: Direct Edit (Quick Fixes)
```bash
code ~/.claude/skills/genesis/genesis-core/skill.md
# Edit, save
# Restart Claude Desktop
```

### Method 2: Regenerate from Factory (Major Updates)
```bash
cd skills/factory/
# Update docs/
# Regenerate skill
cd ..
./install.sh
```

### Method 3: Pull from GitHub (Team Updates)
```bash
git pull origin main
./skills/install.sh
```

## Contributing

Genesis is designed for collaborative evolution:

1. **Discover Pattern** - While building projects
2. **Document Pattern** - Add to appropriate doc in /docs
3. **Generate Skill** - Use Skills Factory
4. **Test Skill** - Verify loading and accuracy
5. **Submit PR** - Share with community

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Version History

### v2.0.1 (Current) - Skills Working & Production Ready
- ✅ Skills invocation issue resolved
- ✅ All 16 Genesis skills verified working
- ✅ Multi-skill complex prompts supported
- ✅ Troubleshooting documentation added
- Released: October 23, 2025

### v2.0 - Skills-First Architecture
- 16 production skills (5 core + 6 specialized + 5 workflow)
- Skills Factory for systematic generation
- Auto-loading based on context
- Token-efficient (2-4K vs 50K+)

### v1.0 - Documentation-Based
- Comprehensive markdown documentation
- Manual upload required
- High token usage
- Foundation for v2.0 skills

## Roadmap

### Q4 2025
- [ ] Additional specialized skills (Virtual Assistant, AI-Heavy Apps)
- [ ] Community skill contributions
- [ ] Automated skill testing framework
- [ ] Skill versioning system

### Q1 2026
- [ ] Genesis Hub (skill registry)
- [ ] One-click skill updates
- [ ] Skill composition patterns
- [ ] Advanced orchestration patterns

## Support

- **Documentation**: See [/docs](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/project-genesis/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/project-genesis/discussions)

## License

[MIT License](LICENSE)

## Acknowledgments

- **Anthropic** - Claude and skills framework
- **Community** - Pattern contributions and feedback
- Built with ❤️ for developers who value intelligent, efficient development

---

**Genesis: Where AI meets systematic development**

Start your next project with `./skills/install.sh` and experience development at the speed of thought.
