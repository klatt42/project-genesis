"""
Common utilities for Phase 2 autonomous agents.

Modules:
- logging: Structured logging for agents
- error_handling: Error recovery and resilience
"""

from agents.shared.utils.logging import get_logger
from agents.shared.utils.error_handling import ErrorRecoverySystem

__all__ = ["get_logger", "ErrorRecoverySystem"]
