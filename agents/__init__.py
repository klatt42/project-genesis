"""
Phase 2 Autonomous Agents for Project Genesis

3-Agent parallel execution system integrating Archon MCP and Phase 1 Scout-Plan-Build.

Agents:
- GenesisSetupAgent: Autonomous project initialization
- GenesisFeatureAgent: Pattern-based feature implementation
- CoordinationAgent: Multi-agent orchestration

Target: 60-70% cumulative improvement over baseline through parallel execution.
"""

__version__ = "2.0.0-alpha"

from agents.genesis_setup.core.agent import GenesisSetupAgent
from agents.genesis_feature.core.agent import GenesisFeatureAgent
from agents.coordination.core.agent import CoordinationAgent

__all__ = [
    "GenesisSetupAgent",
    "GenesisFeatureAgent",
    "CoordinationAgent",
]
