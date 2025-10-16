# Genesis Agent SDK - Implementation Plan
## Transforming Genesis into an Autonomous Development Platform

**WSL Directory**: `/home/[user]/project-genesis`
**Claude Code Project Directory**: `/home/[user]/project-genesis`

---

## PHASE 1: GENESIS MCP SERVER (Week 1-2)
**Goal**: Create MCP server exposing Genesis patterns as programmatic tools
**Impact**: 50% reduction in context loading, real-time pattern validation
**Risk**: Low (isolated component)

### Week 1: Core MCP Server

#### Step 1.1: Setup MCP Server Structure
```bash
# WSL Terminal Commands:
cd ~/project-genesis

# Create MCP server directory structure
mkdir -p agents/genesis-mcp/{tools,config,tests}
mkdir -p agents/genesis-mcp/prompts

# Install dependencies
cd agents/genesis-mcp
npm init -y
npm install @anthropic-ai/sdk
npm install @modelcontextprotocol/sdk
npm install tsx typescript @types/node

# Python dependencies (for future agents)
pip install claude-agent-sdk pydantic anthropic --break-system-packages

# Initialize TypeScript
npx tsc --init
```

#### Step 1.2: Create Genesis MCP Server Core

Create `agents/genesis-mcp/server.ts`:
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

// Genesis documentation paths
const GENESIS_DOCS_PATH = path.join(process.cwd(), "../..", "docs");

interface GenesisPattern {
  name: string;
  category: string;
  content: string;
  file: string;
}

class GenesisMCPServer {
  private server: Server;
  private patterns: Map<string, GenesisPattern> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: "genesis-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.loadGenesisPatterns();
  }

  private async loadGenesisPatterns() {
    // Load all Genesis .md files
    const files = await fs.readdir(GENESIS_DOCS_PATH);

    for (const file of files) {
      if (file.endsWith(".md")) {
        const content = await fs.readFile(
          path.join(GENESIS_DOCS_PATH, file),
          "utf-8"
        );

        // Extract patterns from markdown
        this.patterns.set(file, {
          name: file.replace(".md", ""),
          category: this.categorizeDoc(file),
          content: content,
          file: file,
        });
      }
    }
  }

  private categorizeDoc(filename: string): string {
    const categories: Record<string, string> = {
      "STACK_SETUP": "integration",
      "LANDING_PAGE_TEMPLATE": "template",
      "SAAS_ARCHITECTURE": "template",
      "COPILOTKIT_PATTERNS": "feature",
      "ARCHON_PATTERNS": "deployment",
      "PROJECT_KICKOFF_CHECKLIST": "process",
      "DEPLOYMENT_GUIDE": "deployment",
      "CLAUDE_CODE_INSTRUCTIONS": "development",
    };

    for (const [key, category] of Object.entries(categories)) {
      if (filename.includes(key)) return category;
    }

    return "general";
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "genesis_get_stack_pattern",
          description:
            "Get Genesis integration patterns for specific technologies (supabase, ghl, copilotkit, netlify, archon)",
          inputSchema: {
            type: "object",
            properties: {
              integration: {
                type: "string",
                enum: ["supabase", "ghl", "copilotkit", "netlify", "archon"],
                description: "The technology integration to get patterns for",
              },
            },
            required: ["integration"],
          },
        },
        {
          name: "genesis_get_project_template",
          description:
            "Get complete Genesis project template (landing-page or saas-app)",
          inputSchema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["landing-page", "saas-app"],
                description: "The type of project template",
              },
            },
            required: ["type"],
          },
        },
        {
          name: "genesis_validate_implementation",
          description:
            "Validate code implementation against Genesis patterns and best practices",
          inputSchema: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "The code to validate",
              },
              pattern_type: {
                type: "string",
                description: "The Genesis pattern type to validate against",
              },
              file_path: {
                type: "string",
                description: "The file path being validated",
              },
            },
            required: ["code", "pattern_type"],
          },
        },
        {
          name: "genesis_suggest_improvement",
          description:
            "Suggest improvements to code based on Genesis best practices",
          inputSchema: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "The code to analyze",
              },
              context: {
                type: "string",
                description: "Additional context about the code's purpose",
              },
            },
            required: ["code"],
          },
        },
        {
          name: "genesis_record_new_pattern",
          description:
            "Record a new pattern discovered during project development for Genesis evolution",
          inputSchema: {
            type: "object",
            properties: {
              pattern_name: {
                type: "string",
                description: "Name of the pattern",
              },
              pattern_description: {
                type: "string",
                description: "Description of the pattern and its use case",
              },
              code_example: {
                type: "string",
                description: "Code example demonstrating the pattern",
              },
              category: {
                type: "string",
                enum: ["integration", "template", "feature", "deployment"],
                description: "Category of the pattern",
              },
              project_context: {
                type: "string",
                description: "Project where pattern was discovered",
              },
            },
            required: [
              "pattern_name",
              "pattern_description",
              "code_example",
              "category",
            ],
          },
        },
        {
          name: "genesis_search_patterns",
          description:
            "Semantic search across all Genesis patterns and documentation",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for finding relevant Genesis patterns",
              },
              category: {
                type: "string",
                enum: [
                  "integration",
                  "template",
                  "feature",
                  "deployment",
                  "process",
                  "development",
                ],
                description: "Optional category filter",
              },
            },
            required: ["query"],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "genesis_get_stack_pattern":
          return this.getStackPattern(args.integration);

        case "genesis_get_project_template":
          return this.getProjectTemplate(args.type);

        case "genesis_validate_implementation":
          return this.validateImplementation(
            args.code,
            args.pattern_type,
            args.file_path
          );

        case "genesis_suggest_improvement":
          return this.suggestImprovement(args.code, args.context);

        case "genesis_record_new_pattern":
          return this.recordNewPattern(args);

        case "genesis_search_patterns":
          return this.searchPatterns(args.query, args.category);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async getStackPattern(integration: string) {
    const content = await fs.readFile(
      path.join(GENESIS_DOCS_PATH, "STACK_SETUP.md"),
      "utf-8"
    );

    // Extract integration-specific section
    const integrationSections: Record<string, RegExp> = {
      supabase: /## Supabase Setup.*?(?=##|$)/s,
      ghl: /## GoHighLevel.*?(?=##|$)/s,
      copilotkit: /## CopilotKit.*?(?=##|$)/s,
      netlify: /## Netlify.*?(?=##|$)/s,
      archon: /## Archon.*?(?=##|$)/s,
    };

    const pattern = integrationSections[integration];
    const match = content.match(pattern);

    if (!match) {
      return {
        content: [
          {
            type: "text",
            text: `Pattern not found for ${integration}. Available integrations: ${Object.keys(integrationSections).join(", ")}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Genesis ${integration} Integration Pattern:\n\n${match[0]}`,
        },
      ],
    };
  }

  private async getProjectTemplate(type: string) {
    const templateFiles: Record<string, string> = {
      "landing-page": "LANDING_PAGE_TEMPLATE.md",
      "saas-app": "SAAS_ARCHITECTURE.md",
    };

    const file = templateFiles[type];
    if (!file) {
      return {
        content: [
          {
            type: "text",
            text: `Unknown template type: ${type}. Available: landing-page, saas-app`,
          },
        ],
      };
    }

    const content = await fs.readFile(
      path.join(GENESIS_DOCS_PATH, file),
      "utf-8"
    );

    return {
      content: [
        {
          type: "text",
          text: `Genesis ${type} Template:\n\n${content}`,
        },
      ],
    };
  }

  private async validateImplementation(
    code: string,
    pattern_type: string,
    file_path?: string
  ) {
    // Simple validation logic (expand with actual pattern matching)
    const validations = [];

    // Check for Genesis patterns
    if (pattern_type === "supabase-client") {
      if (!code.includes("createClient")) {
        validations.push("Missing createClient import from @supabase/supabase-js");
      }
      if (!code.includes("SUPABASE_URL")) {
        validations.push("Missing SUPABASE_URL environment variable");
      }
    }

    // Check for Genesis conventions
    if (file_path) {
      if (file_path.includes("components/") && !code.includes("export")) {
        validations.push("Components should use named or default exports");
      }
    }

    const isValid = validations.length === 0;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              valid: isValid,
              pattern_type,
              file_path,
              issues: validations,
              genesis_reference: `See docs/${pattern_type.toUpperCase()}.md`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async suggestImprovement(code: string, context?: string) {
    // Analyze code and suggest Genesis patterns
    const suggestions = [];

    // Check for common improvements
    if (code.includes("fetch(") && !code.includes("try {")) {
      suggestions.push({
        type: "error-handling",
        suggestion: "Add try-catch for fetch calls (Genesis best practice)",
        genesis_pattern: "STACK_SETUP.md - Error Handling",
      });
    }

    if (code.includes("supabase.from") && !code.includes(".select()")) {
      suggestions.push({
        type: "query-optimization",
        suggestion: "Use .select() to specify fields (Genesis performance pattern)",
        genesis_pattern: "STACK_SETUP.md - Supabase Queries",
      });
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              suggestions,
              context,
              genesis_reference: "Genesis best practices applied",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async recordNewPattern(args: any) {
    const timestamp = new Date().toISOString();
    const patternRecord = {
      ...args,
      discovered_at: timestamp,
      status: "pending_review",
    };

    // Save to patterns directory
    const patternsDir = path.join(process.cwd(), "../..", "patterns", "discovered");
    await fs.mkdir(patternsDir, { recursive: true });

    const filename = `${args.pattern_name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
    await fs.writeFile(
      path.join(patternsDir, filename),
      JSON.stringify(patternRecord, null, 2)
    );

    return {
      content: [
        {
          type: "text",
          text: `Pattern recorded successfully:\n${JSON.stringify(patternRecord, null, 2)}\n\nSaved to: patterns/discovered/${filename}`,
        },
      ],
    };
  }

  private async searchPatterns(query: string, category?: string) {
    // Simple keyword search (expand with vector search later)
    const results = [];

    for (const [file, pattern] of this.patterns.entries()) {
      if (category && pattern.category !== category) continue;

      const queryLower = query.toLowerCase();
      if (
        pattern.content.toLowerCase().includes(queryLower) ||
        pattern.name.toLowerCase().includes(queryLower)
      ) {
        // Extract relevant section
        const lines = pattern.content.split("\n");
        const relevantLines = lines.filter((line) =>
          line.toLowerCase().includes(queryLower)
        );

        results.push({
          file: pattern.file,
          category: pattern.category,
          matches: relevantLines.slice(0, 3), // First 3 matches
        });
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query,
              category,
              results_count: results.length,
              results: results.slice(0, 5), // Top 5 results
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Genesis MCP Server running on stdio");
  }
}

// Start server
const server = new GenesisMCPServer();
server.start().catch(console.error);
```

#### Step 1.3: Configure MCP Server

Create `agents/genesis-mcp/config.json`:
```json
{
  "mcpServers": {
    "genesis": {
      "command": "npx",
      "args": ["tsx", "server.ts"],
      "cwd": "/home/[user]/project-genesis/agents/genesis-mcp",
      "env": {
        "GENESIS_DOCS_PATH": "/home/[user]/project-genesis/docs"
      }
    }
  }
}
```

Create `agents/genesis-mcp/package.json`:
```json
{
  "name": "genesis-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "server.ts",
  "scripts": {
    "start": "tsx server.ts",
    "dev": "tsx watch server.ts",
    "build": "tsc",
    "test": "tsx test/server.test.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "@modelcontextprotocol/sdk": "^0.6.0"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0"
  }
}
```

**CHECKPOINT 1.3**: Verify MCP server starts without errors
```bash
cd agents/genesis-mcp
npm run start
# Should see: "Genesis MCP Server running on stdio"
```

---

### Week 2: Claude Code Integration

#### Step 2.1: Configure Claude Code MCP Integration

Create `.claude/config.json` in project root:
```json
{
  "mcpServers": {
    "genesis": {
      "command": "npx",
      "args": ["tsx", "agents/genesis-mcp/server.ts"],
      "env": {
        "GENESIS_DOCS_PATH": "./docs"
      }
    }
  },
  "settingSources": ["project"]
}
```

Create `.claude/CLAUDE.md` for Genesis context:
```markdown
# Genesis Project Context

This project uses Project Genesis patterns and conventions.

## Available Genesis Tools

The Genesis MCP server provides these tools:
- genesis_get_stack_pattern: Get integration patterns
- genesis_get_project_template: Get project templates
- genesis_validate_implementation: Validate code against Genesis patterns
- genesis_suggest_improvement: Get Genesis-based suggestions
- genesis_record_new_pattern: Record new patterns
- genesis_search_patterns: Search Genesis documentation

## Development Guidelines

1. Always use Genesis patterns from the MCP server
2. Validate implementations with genesis_validate_implementation
3. Record new patterns with genesis_record_new_pattern
4. Search patterns before implementing custom solutions

## Project Type

[Set to: landing-page OR saas-app]

## Active Integrations

[List: supabase, ghl, copilotkit, netlify, archon]
```

#### Step 2.2: Test Claude Code Integration

```bash
# WSL Terminal:
cd ~/project-genesis

# Start Claude Code
claude-code

# In Claude Code, test Genesis MCP:
# "Use the genesis_get_stack_pattern tool to get Supabase patterns"
# "Validate this code: <paste some code>"
# "Search Genesis patterns for authentication"
```

**CHECKPOINT 2.2**: Claude Code can call Genesis MCP tools successfully

#### Step 2.3: Create Genesis Helper Commands

Create `.claude/commands/genesis-validate.md`:
```markdown
---
title: Validate Against Genesis Patterns
description: Validate code implementation against Genesis best practices
---

Please use the genesis_validate_implementation tool to validate the current code against Genesis patterns.

Steps:
1. Identify the pattern type (e.g., supabase-client, ghl-sync, landing-page-component)
2. Get the relevant code
3. Run validation
4. Report issues and provide Genesis-compliant fixes
```

Create `.claude/commands/genesis-implement.md`:
```markdown
---
title: Implement Using Genesis Pattern
description: Implement a feature using Genesis patterns
---

Please implement this feature following Genesis patterns:

Steps:
1. Search Genesis patterns relevant to the feature
2. Get the appropriate template (landing-page or saas-app)
3. Implement following Genesis conventions
4. Validate implementation
5. Record any new patterns discovered
```

Create `.claude/commands/genesis-improve.md`:
```markdown
---
title: Suggest Genesis Improvements
description: Analyze code and suggest Genesis pattern improvements
---

Please analyze the code and suggest improvements based on Genesis best practices:

Steps:
1. Use genesis_suggest_improvement on the code
2. Search Genesis patterns for better approaches
3. Provide specific, actionable suggestions
4. Include Genesis documentation references
```

**CHECKPOINT 2.3**: Claude Code can use /genesis-* commands

---

## PHASE 2: SCAFFOLDING AGENT (Week 3-4)
**Goal**: Autonomous project creation from Genesis templates
**Impact**: Project setup time: 2 hours → 15 minutes
**Risk**: Low (well-defined task)

### Week 3: Basic Scaffolding

#### Step 3.1: Create Scaffolding Agent

Create `agents/scaffolder/genesis_scaffolder.py`:
```python
"""
Genesis Scaffolding Agent - Autonomous Project Creation
"""
import asyncio
import os
import subprocess
from pathlib import Path
from typing import Literal
from claude_agent_sdk import query, ClaudeAgentOptions

ProjectType = Literal["landing-page", "saas-app"]

class GenesisScaffolder:
    def __init__(self, project_name: str, project_type: ProjectType):
        self.project_name = project_name
        self.project_type = project_type
        self.project_path = Path.cwd() / project_name

    async def create_project(self):
        """Main scaffolding workflow"""
        print(f"🚀 Creating Genesis {self.project_type} project: {self.project_name}")

        steps = [
            ("Cloning Genesis template", self.clone_template),
            ("Selecting boilerplate", self.select_boilerplate),
            ("Configuring project", self.configure_project),
            ("Setting up services", self.setup_services),
            ("Validating setup", self.validate_setup),
        ]

        for step_name, step_func in steps:
            print(f"\n⏳ {step_name}...")
            try:
                await step_func()
                print(f"✅ {step_name} complete")
            except Exception as e:
                print(f"❌ {step_name} failed: {e}")
                raise

        print(f"\n✨ Project {self.project_name} created successfully!")
        print(f"📁 Location: {self.project_path}")
        print(f"\n🎯 Next steps:")
        print(f"   cd {self.project_name}")
        print(f"   claude-code 'Implement the features following Genesis patterns'")

    async def clone_template(self):
        """Clone Genesis template from GitHub"""
        subprocess.run([
            "gh", "repo", "create", self.project_name,
            "--template", "project-genesis",
            "--private",
            "--clone"
        ], check=True)

        os.chdir(self.project_path)

    async def select_boilerplate(self):
        """Select and configure boilerplate"""
        # Remove unused boilerplate
        unused = "saas-app" if self.project_type == "landing-page" else "landing-page"
        unused_path = self.project_path / "boilerplate" / unused

        if unused_path.exists():
            import shutil
            shutil.rmtree(unused_path)

        # Move selected boilerplate to root
        boilerplate_path = self.project_path / "boilerplate" / self.project_type
        if boilerplate_path.exists():
            import shutil
            for item in boilerplate_path.iterdir():
                shutil.move(str(item), str(self.project_path))

    async def configure_project(self):
        """Configure project using Claude Agent SDK"""
        system_prompt = f"""You are a Genesis project configuration expert.

Project: {self.project_name}
Type: {self.project_type}

Your task is to configure this Genesis project following the PROJECT_KICKOFF_CHECKLIST.md.

Use the Genesis MCP tools to:
1. Get the appropriate project template
2. Configure environment variables
3. Set up package.json
4. Configure Netlify settings

Be precise and follow Genesis patterns exactly."""

        options = ClaudeAgentOptions(
            cwd=str(self.project_path),
            allowed_tools=["Read", "Write", "Bash"],
            permission_mode="acceptAll",
            system_prompt=system_prompt,
            setting_sources=["project"]  # Load .claude/CLAUDE.md
        )

        prompt = f"""Configure this Genesis {self.project_type} project.

Steps:
1. Use genesis_get_project_template to get the template
2. Update package.json with project name
3. Create .env.example with required variables
4. Configure netlify.toml following Genesis patterns
5. Validate all configurations"""

        async for message in query(prompt=prompt, options=options):
            if message.type == "text":
                print(f"Agent: {message.text}")

    async def setup_services(self):
        """Setup external services (Supabase, etc.)"""
        system_prompt = f"""You are a Genesis services setup expert.

Project: {self.project_name}
Type: {self.project_type}

Configure external services following STACK_SETUP.md:
1. Supabase (database, auth, storage)
2. Environment variables
3. Service verification

Use Genesis MCP tools for patterns."""

        options = ClaudeAgentOptions(
            cwd=str(self.project_path),
            allowed_tools=["Read", "Write", "Bash"],
            permission_mode="acceptAll",
            system_prompt=system_prompt,
            setting_sources=["project"]
        )

        prompt = f"""Set up services for this Genesis {self.project_type} project.

Steps:
1. Use genesis_get_stack_pattern to get Supabase setup
2. Create lib/supabase-client.ts following Genesis pattern
3. Add environment variables to .env.example
4. Create any required database schemas
5. Verify service connections"""

        async for message in query(prompt=prompt, options=options):
            if message.type == "text":
                print(f"Agent: {message.text}")

    async def validate_setup(self):
        """Validate project setup"""
        system_prompt = """You are a Genesis validation expert.

Validate the project setup:
1. Check all required files exist
2. Verify Genesis pattern compliance
3. Test configurations
4. Report any issues"""

        options = ClaudeAgentOptions(
            cwd=str(self.project_path),
            allowed_tools=["Read", "Bash"],
            permission_mode="acceptAll",
            system_prompt=system_prompt,
            setting_sources=["project"]
        )

        prompt = """Validate this Genesis project setup.

Use genesis_validate_implementation on key files:
1. lib/supabase-client.ts
2. netlify.toml
3. package.json

Report validation results."""

        async for message in query(prompt=prompt, options=options):
            if message.type == "text":
                print(f"Agent: {message.text}")

async def main():
    import sys

    if len(sys.argv) < 3:
        print("Usage: python genesis_scaffolder.py <project-name> <landing-page|saas-app>")
        sys.exit(1)

    project_name = sys.argv[1]
    project_type = sys.argv[2]

    if project_type not in ["landing-page", "saas-app"]:
        print("Error: project_type must be 'landing-page' or 'saas-app'")
        sys.exit(1)

    scaffolder = GenesisScaffolder(project_name, project_type)
    await scaffolder.create_project()

if __name__ == "__main__":
    asyncio.run(main())
```

#### Step 3.2: Create CLI Wrapper

Create `cli/genesis-agent`:
```bash
#!/bin/bash
# Genesis Agent CLI - Main entry point

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Ensure Python environment
if [ ! -d "$PROJECT_ROOT/agents/.venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$PROJECT_ROOT/agents/.venv"
    source "$PROJECT_ROOT/agents/.venv/bin/activate"
    pip install claude-agent-sdk anthropic pydantic --break-system-packages
else
    source "$PROJECT_ROOT/agents/.venv/bin/activate"
fi

# Parse command
COMMAND=$1
shift

case $COMMAND in
    create-project)
        python "$PROJECT_ROOT/agents/scaffolder/genesis_scaffolder.py" "$@"
        ;;

    validate)
        python "$PROJECT_ROOT/agents/validator/genesis_validator.py" "$@"
        ;;

    *)
        echo "Genesis Agent CLI"
        echo ""
        echo "Commands:"
        echo "  create-project <name> <type>    Create new Genesis project"
        echo "  validate [path]                  Validate Genesis compliance"
        echo ""
        echo "Examples:"
        echo "  genesis-agent create-project my-app landing-page"
        echo "  genesis-agent validate ./src"
        ;;
esac
```

Make executable:
```bash
chmod +x cli/genesis-agent
```

#### Step 3.3: Test Scaffolding Agent

```bash
# WSL Terminal:
cd ~/project-genesis

# Test scaffolding a landing page
./cli/genesis-agent create-project test-landing-page landing-page

# Verify creation
cd test-landing-page
ls -la

# Should see:
# - components/
# - lib/
# - pages/
# - netlify.toml
# - package.json
# - .env.example
```

**CHECKPOINT 3.3**: Agent successfully creates Genesis project

---

### Week 4: Advanced Features

#### Step 4.1: Add Service Integration

Enhance `genesis_scaffolder.py` with service setup:
```python
async def setup_supabase(self):
    """Automated Supabase setup"""
    system_prompt = """You are a Supabase setup expert.

Create complete Supabase setup:
1. Database schema (if needed)
2. RLS policies
3. Client configuration
4. Test connection

Use Genesis patterns from STACK_SETUP.md."""

    options = ClaudeAgentOptions(
        cwd=str(self.project_path),
        allowed_tools=["Read", "Write", "Bash"],
        permission_mode="acceptAll",
        system_prompt=system_prompt
    )

    prompt = """Set up Supabase for this project.

1. Use genesis_get_stack_pattern for Supabase
2. Create lib/supabase-client.ts
3. Create database schema if needed
4. Test connection
5. Validate setup"""

    async for message in query(prompt=prompt, options=options):
        if message.type == "text":
            print(f"Supabase Setup: {message.text}")

async def setup_ghl(self):
    """Automated GoHighLevel setup"""
    if self.project_type != "landing-page":
        return  # GHL primarily for landing pages

    system_prompt = """You are a GoHighLevel integration expert.

Set up GHL webhook integration:
1. Create webhook handler
2. Configure environment variables
3. Set up lead sync
4. Test integration

Use Genesis patterns from STACK_SETUP.md."""

    # Similar to setup_supabase...
```

#### Step 4.2: Add Deployment Configuration

Add to `genesis_scaffolder.py`:
```python
async def setup_deployment(self):
    """Configure deployment to Netlify"""
    system_prompt = """You are a Netlify deployment expert.

Configure Netlify deployment:
1. Create/update netlify.toml
2. Set build commands
3. Configure environment variables
4. Set up redirects if needed

Use Genesis patterns from DEPLOYMENT_GUIDE.md."""

    options = ClaudeAgentOptions(
        cwd=str(self.project_path),
        allowed_tools=["Read", "Write"],
        permission_mode="acceptAll",
        system_prompt=system_prompt
    )

    prompt = """Configure Netlify deployment.

1. Create netlify.toml following Genesis pattern
2. Set build command: npm run build
3. Set publish directory: out
4. Add any required redirects
5. Validate configuration"""

    async for message in query(prompt=prompt, options=options):
        if message.type == "text":
            print(f"Deployment: {message.text}")
```

**CHECKPOINT 4.2**: Agent creates fully-configured, deployment-ready project

---

## PHASE 3: SCOUT-PLAN-BUILD (Week 5-6)
**Goal**: Implement Cole Medin's proven workflow
**Impact**: 30-40% faster feature development
**Risk**: Medium (orchestration complexity)

### Week 5: Scout & Plan Agents

#### Step 5.1: Create Scout Agent

Create `agents/subagents/scout.py`:
```python
"""
Genesis Scout Agent - Context Gathering
Following Cole Medin's Scout-Plan-Build pattern
"""
import asyncio
from pathlib import Path
from claude_agent_sdk import query, ClaudeAgentOptions

class GenesisScout:
    def __init__(self, feature: str, project_path: Path):
        self.feature = feature
        self.project_path = project_path

    async def scout(self) -> dict:
        """Scout phase: Gather context intelligently"""
        print(f"🔍 Scouting for: {self.feature}")

        system_prompt = f"""You are a Genesis Scout Agent.

Your role: Gather ALL relevant context for implementing this feature.

Feature: {self.feature}

Tasks:
1. Search Genesis patterns for similar implementations
2. Find relevant files in the codebase
3. Identify dependencies and integrations
4. Note Genesis conventions to follow
5. Flag any potential issues

Use Genesis MCP tools extensively."""

        options = ClaudeAgentOptions(
            cwd=str(self.project_path),
            allowed_tools=["Read", "Bash"],  # Read-only for safety
            permission_mode="acceptAll",
            system_prompt=system_prompt,
            setting_sources=["project"]
        )

        prompt = f"""Scout context for implementing: {self.feature}

Steps:
1. Use genesis_search_patterns to find relevant Genesis patterns
2. Search codebase for similar existing implementations
3. Identify which Genesis integration patterns are needed
4. List dependencies and environment variables required
5. Note Genesis conventions from project template
6. Create comprehensive context report

Output a detailed JSON report with all findings."""

        context_report = {
            "feature": self.feature,
            "genesis_patterns": [],
            "existing_code": [],
            "dependencies": [],
            "conventions": [],
            "notes": []
        }

        async for message in query(prompt=prompt, options=options):
            if message.type == "text":
                print(f"Scout: {message.text}")
                # Parse and accumulate findings
                # (In production, parse JSON responses)

        return context_report

async def main():
    import sys

    if len(sys.argv) < 2:
        print("Usage: python scout.py '<feature description>'")
        sys.exit(1)

    feature = sys.argv[1]
    project_path = Path.cwd()

    scout = GenesisScout(feature, project_path)
    report = await scout.scout()

    # Save report
    import json
    report_path = project_path / ".genesis" / "scout_reports"
    report_path.mkdir(parents=True, exist_ok=True)

    with open(report_path / f"scout_{feature.replace(' ', '_')}.json", "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n✅ Scout report saved to .genesis/scout_reports/")

if __name__ == "__main__":
    asyncio.run(main())
```

#### Step 5.2: Create Plan Agent

Create `agents/subagents/planner.py`:
```python
"""
Genesis Plan Agent - Implementation Planning
Following Cole Medin's Scout-Plan-Build pattern
"""
import asyncio
import json
from pathlib import Path
from claude_agent_sdk import query, ClaudeAgentOptions

class GenesisPlan:
    def __init__(self, scout_report_path: Path, project_path: Path):
        self.scout_report_path = scout_report_path
        self.project_path = project_path

        # Load scout report
        with open(scout_report_path) as f:
            self.scout_report = json.load(f)

    async def plan(self) -> dict:
        """Plan phase: Create implementation roadmap"""
        print(f"📋 Planning implementation: {self.scout_report['feature']}")

        system_prompt = f"""You are a Genesis Plan Agent.

Your role: Create a detailed implementation plan following Genesis patterns.

Scout Report: {json.dumps(self.scout_report, indent=2)}

Tasks:
1. Break down feature into implementation steps
2. Reference specific Genesis patterns for each step
3. Identify files to create/modify
4. Define validation checkpoints
5. Create testing strategy

Output a detailed implementation plan."""

        options = ClaudeAgentOptions(
            cwd=str(self.project_path),
            allowed_tools=["Read"],  # Read-only for planning
            permission_mode="acceptAll",
            system_prompt=system_prompt,
            setting_sources=["project"]
        )

        prompt = f"""Create implementation plan for: {self.scout_report['feature']}

Based on scout report findings, create a step-by-step plan:

1. For each implementation step:
   - Specific Genesis pattern to use
   - Files to create/modify
   - Code structure
   - Validation checkpoint

2. Use genesis_validate_implementation to pre-check plan

3. Include testing strategy from Genesis best practices

Output detailed JSON implementation plan."""

        implementation_plan = {
            "feature": self.scout_report["feature"],
            "steps": [],
            "validation_checkpoints": [],
            "test_strategy": {},
            "genesis_references": []
        }

        async for message in query(prompt=prompt, options=options):
            if message.type == "text":
                print(f"Plan: {message.text}")
                # Parse plan details

        return implementation_plan

async def main():
    import sys

    if len(sys.argv) < 2:
        print("Usage: python planner.py <scout_report_path>")
        sys.exit(1)

    scout_report_path = Path(sys.argv[1])
    project_path = Path.cwd()

    planner = GenesisPlan(scout_report_path, project_path)
    plan = await planner.plan()

    # Save plan
    plan_path = project_path / ".genesis" / "plans"
    plan_path.mkdir(parents=True, exist_ok=True)

    feature_name = plan["feature"].replace(" ", "_")
    with open(plan_path / f"plan_{feature_name}.json", "w") as f:
        json.dump(plan, f, indent=2)

    print(f"\n✅ Implementation plan saved to .genesis/plans/")

if __name__ == "__main__":
    asyncio.run(main())
```

**CHECKPOINT 5.2**: Scout and Plan agents work independently

---

### Week 6: Build Agent & Orchestration

#### Step 6.1: Create Build Agent

Create `agents/subagents/builder.py`:
```python
"""
Genesis Build Agent - Feature Implementation
Following Cole Medin's Scout-Plan-Build pattern
"""
import asyncio
import json
from pathlib import Path
from claude_agent_sdk import query, ClaudeAgentOptions

class GenesisBuild:
    def __init__(self, plan_path: Path, project_path: Path):
        self.plan_path = plan_path
        self.project_path = project_path

        # Load plan
        with open(plan_path) as f:
            self.plan = json.load(f)

    async def build(self):
        """Build phase: Implement feature with checkpoints"""
        print(f"🔨 Building: {self.plan['feature']}")

        system_prompt = f"""You are a Genesis Build Agent.

Your role: Implement the feature following the implementation plan exactly.

Plan: {json.dumps(self.plan, indent=2)}

Tasks:
1. Implement each step following Genesis patterns
2. Create checkpoints after each major step
3. Validate after each file creation
4. Run tests after implementation
5. Generate documentation

CRITICAL: Follow Genesis patterns precisely. Validate frequently."""

        options = ClaudeAgentOptions(
            cwd=str(self.project_path),
            allowed_tools=["Read", "Write", "Bash"],
            permission_mode="acceptAll",  # In production, use "manual" for safety
            system_prompt=system_prompt,
            setting_sources=["project"]
        )

        for step_idx, step in enumerate(self.plan["steps"], 1):
            print(f"\n📍 Step {step_idx}/{len(self.plan['steps'])}: {step['description']}")

            prompt = f"""Implement step {step_idx}: {step['description']}

Genesis Pattern: {step['genesis_pattern']}
Files: {step['files']}

Implementation:
1. Get Genesis pattern using MCP tools
2. Implement following pattern exactly
3. Validate implementation
4. Create checkpoint
5. Report completion

After implementation, use genesis_validate_implementation."""

            async for message in query(prompt=prompt, options=options):
                if message.type == "text":
                    print(f"Build: {message.text}")

            # Checkpoint created automatically by Agent SDK
            print(f"✅ Step {step_idx} complete (checkpoint created)")

        print(f"\n🎉 Feature implementation complete!")

async def main():
    import sys

    if len(sys.argv) < 2:
        print("Usage: python builder.py <plan_path>")
        sys.exit(1)

    plan_path = Path(sys.argv[1])
    project_path = Path.cwd()

    builder = GenesisBuild(plan_path, project_path)
    await builder.build()

if __name__ == "__main__":
    asyncio.run(main())
```

#### Step 6.2: Create Orchestrator

Create `agents/orchestrator/scout_plan_build.py`:
```python
"""
Genesis Orchestrator - Scout-Plan-Build Workflow
Coordinates the full Cole Medin workflow
"""
import asyncio
from pathlib import Path
from agents.subagents.scout import GenesisScout
from agents.subagents.planner import GenesisPlan
from agents.subagents.builder import GenesisBuild

class GenesisOrchestrator:
    def __init__(self, feature: str, project_path: Path):
        self.feature = feature
        self.project_path = project_path

    async def execute_workflow(self):
        """Execute full Scout-Plan-Build workflow"""
        print(f"🚀 Genesis Workflow: {self.feature}")
        print("=" * 60)

        try:
            # Phase 1: Scout
            print("\n🔍 PHASE 1: SCOUT")
            print("-" * 60)
            scout = GenesisScout(self.feature, self.project_path)
            scout_report = await scout.scout()

            # Save scout report
            reports_dir = self.project_path / ".genesis" / "scout_reports"
            reports_dir.mkdir(parents=True, exist_ok=True)
            report_path = reports_dir / f"{self.feature.replace(' ', '_')}.json"

            import json
            with open(report_path, "w") as f:
                json.dump(scout_report, f, indent=2)

            print(f"\n✅ Scout phase complete")

            # Phase 2: Plan
            print("\n📋 PHASE 2: PLAN")
            print("-" * 60)
            planner = GenesisPlan(report_path, self.project_path)
            plan = await planner.plan()

            # Save plan
            plans_dir = self.project_path / ".genesis" / "plans"
            plans_dir.mkdir(parents=True, exist_ok=True)
            plan_path = plans_dir / f"{self.feature.replace(' ', '_')}.json"

            with open(plan_path, "w") as f:
                json.dump(plan, f, indent=2)

            print(f"\n✅ Plan phase complete")

            # Phase 3: Build
            print("\n🔨 PHASE 3: BUILD")
            print("-" * 60)
            builder = GenesisBuild(plan_path, self.project_path)
            await builder.build()

            print(f"\n✅ Build phase complete")

            print("\n" + "=" * 60)
            print(f"🎉 Genesis Workflow Complete: {self.feature}")
            print("=" * 60)

        except Exception as e:
            print(f"\n❌ Workflow failed: {e}")
            print("\nCheckpoints created - use Esc+Esc to rewind")
            raise

async def main():
    import sys

    if len(sys.argv) < 2:
        print("Usage: python scout_plan_build.py '<feature description>'")
        print("\nExample:")
        print("  python scout_plan_build.py 'OAuth2 authentication with Google'")
        sys.exit(1)

    feature = sys.argv[1]
    project_path = Path.cwd()

    orchestrator = GenesisOrchestrator(feature, project_path)
    await orchestrator.execute_workflow()

if __name__ == "__main__":
    asyncio.run(main())
```

#### Step 6.3: Add to CLI

Update `cli/genesis-agent`:
```bash
case $COMMAND in
    create-project)
        python "$PROJECT_ROOT/agents/scaffolder/genesis_scaffolder.py" "$@"
        ;;

    scout-plan-build)
        python "$PROJECT_ROOT/agents/orchestrator/scout_plan_build.py" "$@"
        ;;

    scout)
        python "$PROJECT_ROOT/agents/subagents/scout.py" "$@"
        ;;

    plan)
        python "$PROJECT_ROOT/agents/subagents/planner.py" "$@"
        ;;

    build)
        python "$PROJECT_ROOT/agents/subagents/builder.py" "$@"
        ;;

    # ... rest of commands
esac
```

**CHECKPOINT 6.3**: Full Scout-Plan-Build workflow executes successfully

---

## PHASE 4: MULTI-AGENT PARALLELIZATION (Week 7-8)
**Goal**: Parallel development with specialized subagents
**Impact**: 50-60% faster development
**Risk**: Medium (coordination complexity)

*[Implementation details similar to above, with parallel agent execution]*

---

## PHASE 5: SELF-IMPROVEMENT (Week 9-10)
**Goal**: Genesis learns from every project
**Impact**: Exponential platform improvement
**Risk**: Low (doesn't affect current workflow)

*[Implementation of pattern extraction and Genesis evolution agents]*

---

## SUCCESS METRICS

### Phase 1-2 Success:
- ✅ MCP server responds in <100ms
- ✅ Project scaffolding completes in <15 minutes
- ✅ Zero configuration errors in 10 test projects
- ✅ 50%+ reduction in context loading

### Phase 3 Success:
- ✅ Scout-Plan-Build completes features 30%+ faster
- ✅ 99%+ Genesis pattern compliance
- ✅ Checkpoint system works reliably
- ✅ Validation catches issues immediately

### Phase 4-5 Success:
- ✅ Parallel agents complete without conflicts
- ✅ 10+ new patterns discovered automatically
- ✅ Genesis improves measurably each month

---

## ROLLOUT STRATEGY

### Week 1-2: Foundation
- Deploy Genesis MCP server
- Test with Claude Code
- Train team on MCP tools

### Week 3-4: Early Adoption
- Use scaffolding agent for 2-3 projects
- Gather feedback
- Iterate on prompts

### Week 5-6: Full Workflow
- Implement Scout-Plan-Build
- Run parallel with manual workflow
- Compare results

### Week 7-10: Scale
- Multi-agent parallelization
- Self-improvement loop
- Full team adoption

---

## MAINTENANCE & MONITORING

### Daily:
- Monitor agent execution logs
- Check error rates
- Verify Genesis pattern compliance

### Weekly:
- Review new patterns discovered
- Update Genesis documentation
- Optimize agent prompts

### Monthly:
- Measure efficiency gains
- Update success metrics
- Plan next improvements

---

*Implementation Plan v1.0*
*Ready for execution: Phase 1 can start immediately*
*Estimated total: 10-12 weeks to full autonomous platform*
