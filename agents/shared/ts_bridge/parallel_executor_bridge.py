"""
Python-TypeScript Bridge for Parallel Executor.

Enables Python agents to leverage the existing TypeScript parallel-executor
infrastructure for advanced features like:
- Smart scheduling
- Resource monitoring
- Auto-scaling
- Performance metrics
- Time estimation
"""

import asyncio
import json
import subprocess
from typing import Dict, Any, List, Optional
from pathlib import Path


class ParallelExecutorBridge:
    """
    Bridge between Python agent system and TypeScript parallel-executor.

    Uses subprocess to run TypeScript modules and communicate via JSON.
    """

    def __init__(self, ts_executor_path: Optional[str] = None):
        """
        Initialize bridge to TypeScript parallel executor.

        Args:
            ts_executor_path: Path to TypeScript parallel-executor directory
        """
        if ts_executor_path:
            self.executor_path = Path(ts_executor_path)
        else:
            # Default to agents/parallel-executor
            self.executor_path = Path(__file__).parent.parent.parent / "parallel-executor"

        self.verify_executor_exists()

    def verify_executor_exists(self):
        """Verify TypeScript executor directory exists"""
        if not self.executor_path.exists():
            raise FileNotFoundError(
                f"TypeScript parallel-executor not found at: {self.executor_path}"
            )

        # Check for index.ts
        index_file = self.executor_path / "index.ts"
        if not index_file.exists():
            raise FileNotFoundError(
                f"index.ts not found in: {self.executor_path}"
            )

    async def estimate_execution_time(
        self,
        tasks: List[Dict[str, Any]],
        max_parallel: int = 3
    ) -> Dict[str, Any]:
        """
        Estimate execution time using TypeScript time-estimator.

        Args:
            tasks: List of task specifications
            max_parallel: Maximum parallel workers

        Returns:
            Time estimation results
        """
        # Prepare input for TypeScript module
        input_data = {
            "tasks": tasks,
            "maxParallel": max_parallel
        }

        # Call TypeScript module
        result = await self._call_ts_module("time-estimator", input_data)

        return result

    async def optimize_schedule(
        self,
        tasks: List[Dict[str, Any]],
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Optimize task scheduling using TypeScript smart-scheduler.

        Args:
            tasks: List of task specifications
            constraints: Optional scheduling constraints

        Returns:
            Optimized schedule
        """
        input_data = {
            "tasks": tasks,
            "constraints": constraints or {}
        }

        result = await self._call_ts_module("smart-scheduler", input_data)

        return result

    async def monitor_resources(
        self,
        agent_count: int
    ) -> Dict[str, Any]:
        """
        Monitor resource usage using TypeScript resource-monitor.

        Args:
            agent_count: Number of active agents

        Returns:
            Resource usage metrics
        """
        input_data = {
            "agentCount": agent_count
        }

        result = await self._call_ts_module("resource-monitor", input_data)

        return result

    async def calculate_auto_scaling(
        self,
        current_load: Dict[str, Any],
        performance_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate auto-scaling recommendation using TypeScript auto-scaler.

        Args:
            current_load: Current system load
            performance_metrics: Recent performance metrics

        Returns:
            Auto-scaling recommendation
        """
        input_data = {
            "currentLoad": current_load,
            "performanceMetrics": performance_metrics
        }

        result = await self._call_ts_module("auto-scaler", input_data)

        return result

    async def resolve_dependencies(
        self,
        tasks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Resolve task dependencies using TypeScript dependency-resolver.

        Args:
            tasks: List of tasks with dependencies

        Returns:
            Resolved dependency graph with execution order
        """
        input_data = {
            "tasks": tasks
        }

        result = await self._call_ts_module("dependency-resolver", input_data)

        return result

    async def aggregate_progress(
        self,
        agent_statuses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Aggregate progress across agents using TypeScript progress-aggregator.

        Args:
            agent_statuses: List of agent status objects

        Returns:
            Aggregated progress metrics
        """
        input_data = {
            "agentStatuses": agent_statuses
        }

        result = await self._call_ts_module("progress-aggregator", input_data)

        return result

    async def _call_ts_module(
        self,
        module_name: str,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Call a TypeScript module and return results.

        Args:
            module_name: Name of TypeScript module (without .ts extension)
            input_data: Input data to pass to module

        Returns:
            Module output as dictionary
        """
        # Create a temporary runner script
        runner_script = f"""
import {{ {self._get_module_function(module_name)} }} from './{module_name}';

const input = {json.dumps(input_data)};
const result = {self._get_module_function(module_name)}(input);
console.log(JSON.stringify(result));
"""

        # Write runner script to temp file
        runner_path = self.executor_path / f"_temp_runner_{module_name}.ts"
        runner_path.write_text(runner_script)

        try:
            # Execute TypeScript using ts-node
            process = await asyncio.create_subprocess_exec(
                "npx",
                "ts-node",
                str(runner_path),
                cwd=str(self.executor_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown error"
                raise RuntimeError(f"TypeScript module failed: {error_msg}")

            # Parse JSON output
            output = json.loads(stdout.decode())
            return output

        finally:
            # Clean up temp file
            if runner_path.exists():
                runner_path.unlink()

    def _get_module_function(self, module_name: str) -> str:
        """Get the main export function name for a module"""
        # Map module names to their main functions
        function_map = {
            "time-estimator": "estimateTime",
            "smart-scheduler": "optimizeSchedule",
            "resource-monitor": "monitorResources",
            "auto-scaler": "calculateScaling",
            "dependency-resolver": "resolveDependencies",
            "progress-aggregator": "aggregateProgress"
        }

        return function_map.get(module_name, module_name)


class ParallelExecutorEnhancer:
    """
    Enhances Python CoordinationAgent with TypeScript parallel-executor capabilities.

    Wraps ParallelExecutorBridge to provide high-level integration points.
    """

    def __init__(self):
        self.bridge = ParallelExecutorBridge()

    async def enhance_task_planning(
        self,
        task_graph: Dict[str, Any],
        max_parallel: int = 3
    ) -> Dict[str, Any]:
        """
        Enhance task planning with TypeScript capabilities.

        Args:
            task_graph: Task dependency graph from CoordinationAgent
            max_parallel: Maximum parallel agents

        Returns:
            Enhanced task graph with optimized schedule and time estimates
        """
        tasks = task_graph.get("features", [])

        # Resolve dependencies
        dependency_result = await self.bridge.resolve_dependencies(tasks)

        # Optimize schedule
        schedule_result = await self.bridge.optimize_schedule(
            tasks,
            {"maxParallel": max_parallel}
        )

        # Estimate time
        time_estimate = await self.bridge.estimate_execution_time(
            tasks,
            max_parallel
        )

        # Enhance task graph
        enhanced_graph = task_graph.copy()
        enhanced_graph["dependency_order"] = dependency_result.get("executionOrder", [])
        enhanced_graph["optimized_schedule"] = schedule_result.get("schedule", [])
        enhanced_graph["time_estimate"] = time_estimate

        return enhanced_graph

    async def monitor_execution(
        self,
        agent_statuses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Monitor execution with TypeScript capabilities.

        Args:
            agent_statuses: List of agent status objects

        Returns:
            Monitoring metrics and recommendations
        """
        # Aggregate progress
        progress = await self.bridge.aggregate_progress(agent_statuses)

        # Monitor resources
        resources = await self.bridge.monitor_resources(len(agent_statuses))

        # Calculate auto-scaling if needed
        auto_scale = await self.bridge.calculate_auto_scaling(
            {
                "activeAgents": len(agent_statuses),
                "pendingTasks": progress.get("pendingTasks", 0)
            },
            {
                "avgTaskDuration": progress.get("avgTaskDuration", 0),
                "throughput": progress.get("throughput", 0)
            }
        )

        return {
            "progress": progress,
            "resources": resources,
            "auto_scale_recommendation": auto_scale
        }
