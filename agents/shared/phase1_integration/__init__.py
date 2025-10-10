"""
Phase 1 Scout-Plan-Build command integration for autonomous agents.

Allows agents to programmatically execute Phase 1 commands:
- /scout-genesis-pattern
- /plan-genesis-implementation
- /build-genesis-feature
- /generate-transition
"""

from agents.shared.phase1_integration.commands import Phase1CommandExecutor

__all__ = ["Phase1CommandExecutor"]
