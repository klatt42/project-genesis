"""
TypeScript Bridge Module

Enables Python agents to leverage TypeScript parallel-executor capabilities.
"""

from agents.shared.ts_bridge.parallel_executor_bridge import (
    ParallelExecutorBridge,
    ParallelExecutorEnhancer
)

__all__ = [
    "ParallelExecutorBridge",
    "ParallelExecutorEnhancer"
]
