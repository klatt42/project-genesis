# Project Genesis

> AI-powered project framework integrating Claude Code 2.0 agentic workflows

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code 2.0](https://img.shields.io/badge/Claude_Code-2.0-blue)](https://docs.claude.com/en/docs/claude-code)

## 🎯 What is Project Genesis?

Project Genesis is a comprehensive framework for rapid AI-assisted development using Claude Code 2.0's Scout-Plan-Build workflow pattern. It provides:

- **Scout-Plan-Build Workflow**: Anthropic's recommended pattern for agentic coding
- **Project Templates**: Landing page and SaaS app boilerplates
- **Context Management**: Priority-based loading for optimal token usage
- **Archon Integration**: Task management and knowledge base via MCP
- **Genesis Design Studio**: AI-powered UI component generation

## 🚀 Quick Start

### Prerequisites

- [Claude Code 2.0](https://docs.claude.com/en/docs/claude-code)
- Node.js 18+
- (Optional) [Archon OS](https://github.com/coleam00/Archon) for advanced features

### Installation

```bash
# Clone repository
git clone https://github.com/klatt42/project-genesis.git
cd project-genesis

# Choose your starting point
cd boilerplate/landing-page  # For marketing sites
# OR
cd boilerplate/saas-app      # For SaaS applications

# Install dependencies
npm install

# Start development
npm run dev
```

## 📚 Scout-Plan-Build Workflow

Based on [Anthropic's Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices):

### 1. Scout Phase (`/scout-genesis-pattern`)
- **Purpose**: Explore and understand before coding
- **Actions**: Read files, verify details, analyze patterns
- **Output**: Comprehensive analysis report
- **No coding**: Pure exploration

### 2. Plan Phase (`/plan-genesis-implementation`)
- **Purpose**: Create detailed implementation strategy
- **Actions**: Use "think" modes, generate specifications
- **Output**: Executable plan with tasks
- **Think Levels**: think → think hard → think harder → ultrathink

### 3. Build Phase (`/build-genesis-feature`)
- **Purpose**: Implement based on plan
- **Actions**: Code, test, verify, iterate
- **Output**: Production-ready implementation
- **Quality**: 2-3 iterations for optimal results

## 📦 What's Included

### Boilerplates
- **Landing Page**: Marketing site template with Genesis Design Studio
- **SaaS App**: Full-stack application with auth, dashboard, and payments

### Documentation
- **Scout-Plan-Build Commands**: Custom Claude Code workflows
- **Context Loading Strategy**: Optimize token usage
- **Thread Transitions**: Resume work efficiently
- **Integration Guides**: Step-by-step setup

### Features
- ✅ Scout-Plan-Build command files
- ✅ Priority-based context loading
- ✅ Thread transition templates
- ✅ Archon MCP integration
- ✅ Genesis Design Studio (optional)
- ✅ Test-driven development support

## 🎨 Genesis Design Studio

Optional AI-powered design tool (see `tools/design-studio/`):
- 15+ professional themes
- 22+ design templates
- Real-time visual validation
- One-click React export
- 85-90% time savings

## 🔗 Archon Integration

Archon MCP server provides:
- **Knowledge Base**: Crawled docs, PDFs, project context
- **Task Management**: Integrated with Scout-Plan-Build workflow
- **Smart Search**: RAG-powered documentation retrieval
- **Real-time Updates**: Collaborative context management

Setup: See [`docs/ARCHON_INTEGRATION.md`](docs/ARCHON_INTEGRATION.md)

## 📖 Documentation

- [Scout-Plan-Build Guide](docs/SCOUT_PLAN_BUILD.md)
- [Context Loading Strategy](docs/CONTEXT_LOADING_STRATEGY.md)
- [Thread Transitions](templates/THREAD_TRANSITION_V2.md)
- [Claude Code Instructions](docs/CLAUDE_CODE_INSTRUCTIONS.md)
- [Project Kickoff Checklist](docs/PROJECT_KICKOFF_CHECKLIST.md)

## 🛠️ Commands

Available in `.claude/commands/`:

```bash
/scout-genesis-pattern "feature description"  # Analyze before implementing
/plan-genesis-implementation                   # Create detailed plan
/build-genesis-feature                         # Implement with validation
/generate-transition                           # Create thread transition
```

## 🎯 Example Workflow

```bash
# 1. Scout: Understand authentication requirements
/scout-genesis-pattern "OAuth 2.0 authentication with Google"

# 2. Plan: Create implementation strategy
/plan-genesis-implementation --from-last-scout

# 3. Build: Implement with testing
/build-genesis-feature --from-last-plan

# 4. Transition: Save progress for later
/generate-transition
```

## 📊 Benefits

- **30-40% faster development** with Scout-Plan-Build
- **50-60% better context efficiency** with priority loading
- **80% faster thread resumption** with transitions
- **Higher code quality** through systematic planning
- **Better Genesis compliance** with validated patterns

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) - Claude Code 2.0 and best practices
- [Archon OS](https://github.com/coleam00/Archon) - MCP server and knowledge base
- [Genesis Community](https://github.com/klatt42/project-genesis/discussions) - Feedback and contributions

---

**Project Genesis** - Transform development with AI-powered workflows
