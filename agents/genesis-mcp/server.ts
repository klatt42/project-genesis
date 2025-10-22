import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import {
  validateImplementation,
  formatValidationResult,
  getGenesisPattern,
} from "./tools/validation.js";
import {
  suggestImprovements,
  formatImprovementSuggestions,
} from "./tools/improvement.js";
import {
  recordNewPattern,
  listDiscoveredPatterns,
  type NewPattern,
} from "./tools/pattern-recording.js";

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
        {
          name: "genesis_validate_implementation",
          description: "Validate code implementation against Genesis patterns (8.0/10 minimum score required)",
          inputSchema: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "The code to validate against Genesis patterns",
              },
              patternType: {
                type: "string",
                enum: [
                  "supabase-client",
                  "ghl-sync",
                  "landing-page-component",
                  "saas-auth",
                  "copilotkit-integration",
                ],
                description: "The Genesis pattern type to validate against",
              },
              filePath: {
                type: "string",
                description: "Optional file path for context",
              },
            },
            required: ["code", "patternType"],
          },
        },
        {
          name: "genesis_suggest_improvement",
          description: "Analyze code and suggest Genesis-based improvements for performance, security, and maintainability",
          inputSchema: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "Code to analyze for improvements",
              },
              patternType: {
                type: "string",
                enum: [
                  "supabase-client",
                  "ghl-sync",
                  "landing-page-component",
                  "saas-auth",
                  "copilotkit-integration",
                ],
                description: "The Genesis pattern type",
              },
              context: {
                type: "string",
                description: "Optional: additional context about the code",
              },
            },
            required: ["code", "patternType"],
          },
        },
        {
          name: "genesis_record_new_pattern",
          description: "Record a newly discovered pattern for Genesis evolution and documentation",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Pattern name (e.g., 'Real-time Supabase Sync')",
              },
              category: {
                type: "string",
                enum: [
                  "integration",
                  "component",
                  "architecture",
                  "deployment",
                  "testing",
                ],
                description: "Pattern category",
              },
              description: {
                type: "string",
                description: "Brief description of the pattern",
              },
              problem: {
                type: "string",
                description: "What problem does this pattern solve?",
              },
              solution: {
                type: "string",
                description: "How does this pattern solve it?",
              },
              codeExample: {
                type: "string",
                description: "Code example demonstrating the pattern",
              },
              useCases: {
                type: "array",
                items: { type: "string" },
                description: "List of use cases for this pattern",
              },
              genesisDoc: {
                type: "string",
                description: "Optional: which Genesis doc should include this (e.g., STACK_SETUP.md)",
              },
            },
            required: [
              "name",
              "category",
              "description",
              "problem",
              "solution",
              "codeExample",
              "useCases",
            ],
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
            return await this.getStackPattern((args as any).integration);

          case "genesis_get_project_template":
            return await this.getProjectTemplate((args as any).type);

          case "genesis_search_patterns":
            return await this.searchPatterns((args as any).query);

          case "genesis_validate_implementation":
            return await this.validateImplementation(
              (args as any).code,
              (args as any).patternType,
              (args as any).filePath
            );

          case "genesis_suggest_improvement":
            return await this.suggestImprovements(
              (args as any).code,
              (args as any).patternType,
              (args as any).context
            );

          case "genesis_record_new_pattern":
            return await this.recordPattern(args as any);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
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

  private async validateImplementation(
    code: string,
    patternType: string,
    filePath?: string
  ) {
    try {
      const result = await validateImplementation(code, patternType, filePath);
      const formattedResult = formatValidationResult(result);

      // Also get Genesis pattern for reference
      const pattern = await getGenesisPattern(patternType);

      return {
        content: [
          {
            type: "text",
            text: `${formattedResult}\n\nGenesis Pattern Reference:\n${pattern.substring(0, 500)}...`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async suggestImprovements(
    code: string,
    patternType: string,
    context?: string
  ) {
    try {
      const suggestions = await suggestImprovements(code, patternType, context);
      const formatted = formatImprovementSuggestions(suggestions);

      return {
        content: [
          {
            type: "text",
            text: formatted,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Improvement analysis error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async recordPattern(args: any) {
    try {
      const pattern: NewPattern = {
        name: args.name || "",
        category: args.category || "component",
        description: args.description || "",
        problem: args.problem || "",
        solution: args.solution || "",
        codeExample: args.codeExample || "",
        useCases: args.useCases || [],
        genesisDoc: args.genesisDoc,
        discoveredBy: "Claude Agent SDK",
        discoveredDate: new Date().toISOString().split("T")[0],
        projectContext: args.projectContext,
      };

      await recordNewPattern(pattern);

      return {
        content: [
          {
            type: "text",
            text: `✅ Pattern "${pattern.name}" recorded successfully!\n\nSaved to: patterns-discovered/${pattern.name.toLowerCase().replace(/\s+/g, '-')}.md\n\nThis pattern will be reviewed for inclusion in Genesis documentation.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Pattern recording error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
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
