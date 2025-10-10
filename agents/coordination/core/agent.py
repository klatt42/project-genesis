"""
CoordinationAgent - Multi-agent orchestration for parallel execution.

Capabilities:
- Hierarchical task planning and decomposition
- Parallel agent execution coordination
- Resource allocation and optimization
- Dependency management
- Progress monitoring and reporting
- Error detection and recovery

Orchestrates GenesisSetupAgent and GenesisFeatureAgent instances.
"""

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from agents.shared.base_agent import BaseAgent, AgentStatus


class CoordinationAgent(BaseAgent):
    """
    Coordination agent for orchestrating multiple autonomous agents.

    Manages:
    - 1x GenesisSetupAgent (sequential project setup)
    - Nx GenesisFeatureAgent (parallel feature implementation)

    Expected overhead: ~5-10% of total project time
    """

    def __init__(self, agent_id: str = "ca-1"):
        """
        Initialize CoordinationAgent.

        Args:
            agent_id: Unique identifier for this agent instance
        """
        super().__init__(
            agent_id=agent_id,
            agent_type="CoordinationAgent"
        )
        self.managed_agents = {}  # Track all agents being coordinated
        self.task_graph = None  # Hierarchical task dependency graph
        self.execution_plan = None  # Planned execution strategy

    async def initialize(self):
        """
        Initialize coordination agent and prepare for orchestration.
        """
        await super().initialize()
        self._log("Coordination agent initialized and ready")

    async def execute(self, task_spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute coordinated autonomous project development.

        Args:
            task_spec: Project specification with keys:
                - description: Project description
                - features: List of features to implement
                - project_type: Optional project type hint
                - max_parallel: Max parallel feature agents (default: 3)

        Returns:
            Dictionary with execution results:
                - project_id: Created project ID
                - features_completed: List of completed features
                - total_time_seconds: Total execution time
                - parallel_speedup: Speedup factor vs sequential
                - agent_executions: Detailed agent execution logs
        """
        self._track_task_start("Coordinated Project Development")
        self._update_status(AgentStatus.PLANNING)

        try:
            # Step 1: Create hierarchical task plan
            self._log("Step 1: Creating hierarchical task plan...")
            task_graph = await self._plan_tasks(task_spec)

            # Step 2: Plan parallel execution strategy
            self._log("Step 2: Planning parallel execution strategy...")
            execution_plan = await self._plan_execution(task_graph, task_spec)

            # Step 3: Execute plan with parallel coordination
            self._log("Step 3: Executing plan with parallel coordination...")
            self._update_status(AgentStatus.EXECUTING)
            execution_result = await self._execute_plan(execution_plan)

            # Step 4: Validate results
            self._log("Step 4: Validating results...")
            self._update_status(AgentStatus.VALIDATING)
            validation = await self._validate_results(execution_result)

            # Step 5: Generate metrics and report
            self._log("Step 5: Generating metrics and report...")
            metrics = await self._generate_metrics(execution_result, task_spec)

            result = {
                "project_id": execution_result.get("project_id"),
                "features_completed": execution_result.get("features", []),
                "total_time_seconds": execution_result.get("duration", 0),
                "parallel_speedup": metrics.get("speedup", 1.0),
                "agent_executions": self._get_agent_logs(),
                "validation": validation
            }

            self._track_task_complete(success=True, result=result)
            self._update_status(AgentStatus.COMPLETED)

            return result

        except Exception as e:
            self._handle_error(e, {"task_spec": task_spec})
            self._track_task_complete(success=False)
            raise

    async def validate(self, result: Dict[str, Any]) -> bool:
        """
        Validate coordinated execution results.

        Args:
            result: Execution results to validate

        Returns:
            True if all agents completed successfully
        """
        # Check project was created
        if not result.get("project_id"):
            return False

        # Check features were completed
        features = result.get("features_completed", [])
        if not features:
            return False

        # Verify parallel speedup achieved (should be >1.0)
        speedup = result.get("parallel_speedup", 0)
        if speedup < 1.0:
            self._log(f"Warning: No speedup achieved ({speedup})", level="WARNING")

        return True

    # ========================================================================
    # Task Planning and Decomposition
    # ========================================================================

    async def _plan_tasks(
        self,
        task_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create hierarchical task dependency graph.

        Args:
            task_spec: Project specification

        Returns:
            Task graph with dependencies
        """
        features = task_spec.get("features", [])

        task_graph = {
            "setup": {
                "agent": "GenesisSetupAgent",
                "dependencies": [],
                "parallel": False,
                "task_spec": {
                    "description": task_spec.get("description", ""),
                    "project_type": task_spec.get("project_type")
                }
            },
            "features": []
        }

        # Create feature tasks
        for i, feature in enumerate(features):
            task_graph["features"].append({
                "agent": "GenesisFeatureAgent",
                "feature_name": feature,
                "dependencies": ["setup"],  # All features depend on setup
                "parallel": True,  # Features can run in parallel
                "task_spec": {
                    "feature_name": feature,
                    "description": f"Implement {feature}"
                }
            })

        return task_graph

    async def _plan_execution(
        self,
        task_graph: Dict[str, Any],
        task_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Plan parallel execution strategy.

        Args:
            task_graph: Task dependency graph
            task_spec: Project specification

        Returns:
            Execution plan with parallel batches
        """
        max_parallel = task_spec.get("max_parallel", 3)

        execution_plan = {
            "phases": [
                {
                    "name": "Setup",
                    "parallel": False,
                    "tasks": [task_graph["setup"]]
                },
                {
                    "name": "Features",
                    "parallel": True,
                    "max_parallel": max_parallel,
                    "tasks": task_graph["features"]
                }
            ]
        }

        return execution_plan

    # ========================================================================
    # Parallel Execution Engine
    # ========================================================================

    async def _execute_plan(
        self,
        execution_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute plan with parallel coordination.

        Args:
            execution_plan: Planned execution strategy

        Returns:
            Execution results
        """
        start_time = datetime.now()
        results = {
            "project_id": None,
            "features": [],
            "phase_results": []
        }

        for phase in execution_plan.get("phases", []):
            self._log(f"Executing phase: {phase['name']}")

            if phase.get("parallel", False):
                # Execute tasks in parallel
                phase_result = await self._execute_parallel(
                    phase["tasks"],
                    max_parallel=phase.get("max_parallel", 3),
                    project_id=results.get("project_id")
                )
            else:
                # Execute tasks sequentially
                phase_result = await self._execute_sequential(
                    phase["tasks"]
                )

            results["phase_results"].append(phase_result)

            # Update results based on phase
            if phase["name"] == "Setup":
                results["project_id"] = phase_result[0].get("project_id")
            elif phase["name"] == "Features":
                results["features"] = [
                    r.get("feature_name") for r in phase_result
                ]

        end_time = datetime.now()
        results["duration"] = (end_time - start_time).total_seconds()

        return results

    async def _execute_parallel(
        self,
        tasks: List[Dict[str, Any]],
        max_parallel: int = 3,
        project_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Execute tasks in parallel with concurrency limit.

        Args:
            tasks: List of tasks to execute
            max_parallel: Maximum parallel executions
            project_id: Archon project ID (for features)

        Returns:
            List of task results
        """
        from agents.genesis_feature.core import GenesisFeatureAgent

        # Create semaphore to limit concurrency
        semaphore = asyncio.Semaphore(max_parallel)

        async def execute_with_limit(task_spec):
            async with semaphore:
                agent_id = f"gfa-{len(self.managed_agents) + 1}"
                agent = GenesisFeatureAgent(agent_id)
                await agent.initialize()

                self.managed_agents[agent_id] = agent

                # Add project_id to task_spec
                if project_id:
                    task_spec["task_spec"]["project_id"] = project_id

                result = await agent.execute(task_spec["task_spec"])
                return result

        # Execute all tasks in parallel (up to max_parallel at a time)
        results = await asyncio.gather(
            *[execute_with_limit(task) for task in tasks],
            return_exceptions=True
        )

        # Filter out exceptions and log them
        valid_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                self._log(f"Task {i} failed: {result}", level="ERROR")
            else:
                valid_results.append(result)

        return valid_results

    async def _execute_sequential(
        self,
        tasks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Execute tasks sequentially.

        Args:
            tasks: List of tasks to execute

        Returns:
            List of task results
        """
        from agents.genesis_setup.core import GenesisSetupAgent

        results = []

        for task in tasks:
            agent_type = task.get("agent")

            if agent_type == "GenesisSetupAgent":
                agent_id = f"gsa-{len(self.managed_agents) + 1}"
                agent = GenesisSetupAgent(agent_id)
                await agent.initialize()

                self.managed_agents[agent_id] = agent

                result = await agent.execute(task["task_spec"])
                results.append(result)

        return results

    # ========================================================================
    # Monitoring and Metrics
    # ========================================================================

    async def _validate_results(
        self,
        execution_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate execution results.

        Args:
            execution_result: Results from execution

        Returns:
            Validation results
        """
        validation = {
            "project_created": execution_result.get("project_id") is not None,
            "features_completed": len(execution_result.get("features", [])),
            "all_agents_succeeded": True  # Will check agent statuses
        }

        # Check each agent's status
        for agent_id, agent in self.managed_agents.items():
            if agent.status != AgentStatus.COMPLETED:
                validation["all_agents_succeeded"] = False
                validation["failed_agent"] = agent_id

        return validation

    async def _generate_metrics(
        self,
        execution_result: Dict[str, Any],
        task_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate performance metrics.

        Args:
            execution_result: Results from execution
            task_spec: Original task specification

        Returns:
            Performance metrics
        """
        features_count = len(task_spec.get("features", []))
        total_time = execution_result.get("duration", 0)

        # Estimate sequential time (30 min per feature + 15 min setup)
        estimated_sequential = 15 * 60 + (features_count * 30 * 60)

        # Calculate speedup
        speedup = estimated_sequential / total_time if total_time > 0 else 1.0

        return {
            "total_time_seconds": total_time,
            "estimated_sequential_seconds": estimated_sequential,
            "speedup": speedup,
            "features_count": features_count,
            "agents_used": len(self.managed_agents)
        }

    def _get_agent_logs(self) -> List[Dict[str, Any]]:
        """
        Get execution logs from all managed agents.

        Returns:
            List of agent execution summaries
        """
        logs = []
        for agent_id, agent in self.managed_agents.items():
            logs.append(agent.get_status())
        return logs

    async def emergency_stop(self, reason: str = "user_request"):
        """
        Emergency stop all managed agents.

        Args:
            reason: Reason for stop
        """
        self._log(f"Emergency stop initiated: {reason}", level="WARNING")

        # Stop all managed agents
        for agent_id, agent in self.managed_agents.items():
            await agent.stop(reason=reason)

        # Stop self
        await self.stop(reason=reason)
