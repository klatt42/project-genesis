#!/usr/bin/env python3
"""
Genesis Agents MCP Server

Exposes Genesis autonomous agents as MCP tools for Claude Code integration.
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Any, Dict, List

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from agents.genesis_setup.core.project_detector import ProjectTypeDetector
from agents.genesis_feature.core.pattern_matcher import PatternMatcher
from agents.genesis_feature.core.code_generator import CodeGenerator
from agents.genesis_feature.core.pattern_library import GenesisPatternLibrary


class GenesisMCPServer:
    """MCP server for Genesis agents."""

    def __init__(self):
        self.name = "genesis-agents"
        self.version = "1.0.0"
        self.tools = self._register_tools()

    def _register_tools(self) -> List[Dict[str, Any]]:
        """Register available MCP tools."""
        return [
            {
                "name": "detect_project_type",
                "description": "Detect whether a project is a landing page or SaaS app based on description",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string",
                            "description": "Project description"
                        }
                    },
                    "required": ["description"]
                }
            },
            {
                "name": "match_pattern",
                "description": "Match a feature description to a Genesis pattern",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "feature_name": {
                            "type": "string",
                            "description": "Name of the feature (e.g., 'hero section', 'user authentication')"
                        },
                        "description": {
                            "type": "string",
                            "description": "Detailed feature description"
                        },
                        "project_type": {
                            "type": "string",
                            "enum": ["landing_page", "saas_app"],
                            "description": "Type of project (optional)"
                        }
                    },
                    "required": ["feature_name"]
                }
            },
            {
                "name": "generate_code",
                "description": "Generate production-ready code from a Genesis pattern",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "pattern_id": {
                            "type": "string",
                            "description": "Pattern ID (e.g., 'lp_hero_section', 'saas_authentication')"
                        },
                        "feature_name": {
                            "type": "string",
                            "description": "Name for this feature implementation"
                        },
                        "output_dir": {
                            "type": "string",
                            "description": "Output directory (defaults to current directory)"
                        },
                        "dry_run": {
                            "type": "boolean",
                            "description": "If true, don't write files, just return what would be generated"
                        }
                    },
                    "required": ["pattern_id", "feature_name"]
                }
            },
            {
                "name": "list_patterns",
                "description": "List all available Genesis patterns",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "enum": ["landing_page", "saas_app", "all"],
                            "description": "Filter by category (optional)"
                        }
                    }
                }
            },
            {
                "name": "estimate_time",
                "description": "Estimate implementation time for a list of features",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "features": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of feature names"
                        },
                        "project_type": {
                            "type": "string",
                            "enum": ["landing_page", "saas_app"],
                            "description": "Type of project"
                        },
                        "max_parallel": {
                            "type": "integer",
                            "description": "Maximum parallel agents (default: 3)"
                        }
                    },
                    "required": ["features", "project_type"]
                }
            }
        ]

    async def handle_tool_call(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle tool call and return result."""
        try:
            if tool_name == "detect_project_type":
                return await self._detect_project_type(arguments)
            elif tool_name == "match_pattern":
                return await self._match_pattern(arguments)
            elif tool_name == "generate_code":
                return await self._generate_code(arguments)
            elif tool_name == "list_patterns":
                return await self._list_patterns(arguments)
            elif tool_name == "estimate_time":
                return await self._estimate_time(arguments)
            else:
                return {
                    "success": False,
                    "error": f"Unknown tool: {tool_name}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def _detect_project_type(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Detect project type from description."""
        detector = ProjectTypeDetector()
        result = detector.detect_project_type(args["description"])

        return {
            "success": True,
            "project_type": result["project_type"].value,
            "confidence": f"{result['confidence']:.0%}",
            "reasoning": result["reasoning"],
            "recommended_template": result["recommended_template"]
        }

    async def _match_pattern(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Match feature to Genesis pattern."""
        matcher = PatternMatcher()

        feature_name = args["feature_name"]
        description = args.get("description", "")
        project_type = args.get("project_type")

        match_result = matcher.match_pattern(feature_name, description, project_type)
        pattern = match_result["pattern"]

        return {
            "success": True,
            "pattern": {
                "id": pattern.id,
                "name": pattern.name,
                "category": pattern.category,
                "description": pattern.description,
                "estimated_time_minutes": pattern.estimated_time_minutes,
                "complexity": pattern.complexity,
                "files_to_create": pattern.files_to_create
            },
            "confidence": f"{match_result['confidence']:.0%}",
            "reasoning": match_result["reasoning"]
        }

    async def _generate_code(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Generate code from pattern."""
        generator = CodeGenerator()

        # Set output directory if provided
        if args.get("output_dir"):
            generator.project_root = Path(args["output_dir"])

        pattern_id = args["pattern_id"]
        feature_name = args["feature_name"]
        dry_run = args.get("dry_run", False)

        # Get pattern info
        library = GenesisPatternLibrary()
        pattern = library.get_pattern_by_id(pattern_id)

        if not pattern:
            return {
                "success": False,
                "error": f"Pattern not found: {pattern_id}"
            }

        # Generate files
        feature_spec = {
            "feature_name": feature_name,
            "description": pattern.description
        }

        files = generator.generate_from_pattern(
            {
                "id": pattern.id,
                "name": pattern.name,
                "category": pattern.category
            },
            feature_spec
        )

        # Write files
        write_result = generator.write_files(files, dry_run=dry_run)

        return {
            "success": True,
            "pattern_used": pattern.name,
            "files_generated": len(files),
            "files_written": write_result["files_written"],
            "files_skipped": write_result["files_skipped"],
            "dry_run": dry_run,
            "total_lines": sum(len(f.content.split('\n')) for f in files)
        }

    async def _list_patterns(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """List available patterns."""
        library = GenesisPatternLibrary()
        category = args.get("category", "all")

        if category == "all":
            patterns = library.list_all_patterns()
        else:
            patterns = library.get_patterns_by_category(category)

        return {
            "success": True,
            "count": len(patterns),
            "patterns": [
                {
                    "id": p.id,
                    "name": p.name,
                    "category": p.category,
                    "description": p.description,
                    "estimated_time_minutes": p.estimated_time_minutes,
                    "complexity": p.complexity
                }
                for p in patterns
            ]
        }

    async def _estimate_time(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Estimate implementation time."""
        matcher = PatternMatcher()

        features = args["features"]
        project_type = args["project_type"]

        estimates = matcher.estimate_implementation_time(features, project_type)

        return {
            "success": True,
            "features_count": len(features),
            "setup_time_minutes": estimates["setup_time_minutes"],
            "sequential_time_minutes": estimates["sequential_time_minutes"],
            "parallel_time_minutes": estimates["parallel_time_minutes"],
            "speedup": f"{estimates['speedup']:.2f}x",
            "max_parallel_agents": 3  # Fixed assumption in pattern matcher
        }

    def handle_initialize(self) -> Dict[str, Any]:
        """Handle MCP initialize request."""
        return {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "serverInfo": {
                "name": self.name,
                "version": self.version
            }
        }

    def handle_list_tools(self) -> Dict[str, Any]:
        """Handle MCP tools/list request."""
        return {
            "tools": self.tools
        }

    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP request."""
        method = request.get("method")

        if method == "initialize":
            return self.handle_initialize()
        elif method == "tools/list":
            return self.handle_list_tools()
        elif method == "tools/call":
            params = request.get("params", {})
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            return await self.handle_tool_call(tool_name, arguments)
        else:
            return {
                "error": {
                    "code": -32601,
                    "message": f"Method not found: {method}"
                }
            }

    async def run(self):
        """Run MCP server (stdio mode)."""
        while True:
            try:
                # Read JSON-RPC request from stdin
                line = sys.stdin.readline()
                if not line:
                    break

                request = json.loads(line)
                response = await self.handle_request(request)

                # Write JSON-RPC response to stdout
                response_obj = {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": response
                }
                print(json.dumps(response_obj), flush=True)

            except json.JSONDecodeError as e:
                error_response = {
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {
                        "code": -32700,
                        "message": f"Parse error: {e}"
                    }
                }
                print(json.dumps(error_response), flush=True)
            except Exception as e:
                error_response = {
                    "jsonrpc": "2.0",
                    "id": request.get("id") if 'request' in locals() else None,
                    "error": {
                        "code": -32603,
                        "message": f"Internal error: {e}"
                    }
                }
                print(json.dumps(error_response), flush=True)


def main():
    """Main entry point."""
    server = GenesisMCPServer()
    asyncio.run(server.run())


if __name__ == "__main__":
    main()
