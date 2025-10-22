"""
Archon MCP Client for autonomous agent integration.

Provides wrappers for:
- Project management (find, create, update, delete)
- Task management (find, create, update, delete)
- Document management (find, create, update, delete)
- RAG search (knowledge base, code examples)
"""

from agents.shared.mcp_client.client import ArchonMCPClient

__all__ = ["ArchonMCPClient"]
