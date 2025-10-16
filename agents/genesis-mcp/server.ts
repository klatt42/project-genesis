import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

// Genesis documentation paths
const GENESIS_DOCS_PATH = path.join(process.cwd(), "..", "..", "docs");

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
    try {
      const files = await fs.readdir(GENESIS_DOCS_PATH);

      for (const file of files) {
        if (file.endsWith(".md")) {
          const content = await fs.readFile(
            path.join(GENESIS_DOCS_PATH, file),
            "utf-8"
          );

          this.patterns.set(file, {
            name: file.replace(".md", ""),
            category: this.categorizeDoc(file),
            content: content,
            file: file,
          });
        }
      }

      console.error(`Loaded ${this.patterns.size} Genesis patterns`);
    } catch (error) {
      console.error("Error loading Genesis patterns:", error);
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
      "DOCKER_MCP_SETUP": "integration",
      "CHROME_DEVTOOLS": "quality",
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
          description: "Get Genesis integration patterns for specific technologies (supabase, ghl, copilotkit, netlify, archon)",
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
          description: "Get complete Genesis project template (landing-page or saas-app)",
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
          name: "genesis_search_patterns",
          description: "Search across all Genesis patterns and documentation",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for finding relevant Genesis patterns",
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

      try {
        switch (name) {
          case "genesis_get_stack_pattern":
            return await this.getStackPattern(args.integration);

          case "genesis_get_project_template":
            return await this.getProjectTemplate(args.type);

          case "genesis_search_patterns":
            return await this.searchPatterns(args.query);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
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
      supabase: /## Supabase.*?(?=##|$)/s,
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

  private async searchPatterns(query: string) {
    const results = [];

    for (const [file, pattern] of this.patterns.entries()) {
      const queryLower = query.toLowerCase();
      if (
        pattern.content.toLowerCase().includes(queryLower) ||
        pattern.name.toLowerCase().includes(queryLower)
      ) {
        const lines = pattern.content.split("\n");
        const relevantLines = lines.filter((line) =>
          line.toLowerCase().includes(queryLower)
        );

        results.push({
          file: pattern.file,
          category: pattern.category,
          matches: relevantLines.slice(0, 3),
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
              results_count: results.length,
              results: results.slice(0, 5),
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
