"""
Base Agent class for all Phase 2 autonomous agents.

Provides common functionality:
- Logging and error handling
- MCP client integration
- Phase 1 command execution
- Context loading strategy
- Progress tracking
"""

import asyncio
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

class AgentStatus(Enum):
    """Agent execution status"""
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    VALIDATING = "validating"
    COMPLETED = "completed"
    ERROR = "error"
    STOPPED = "stopped"


class BaseAgent(ABC):
    """
    Base class for all Phase 2 autonomous agents.

    Provides common infrastructure for:
    - Archon MCP integration
    - Phase 1 Scout-Plan-Build execution
    - Progress tracking and logging
    - Error handling and recovery
    """

    def __init__(
        self,
        agent_id: str,
        agent_type: str,
        archon_mcp_url: str = "http://localhost:8051",
        archon_api_url: str = "http://localhost:8181"
    ):
        """
        Initialize base agent.

        Args:
            agent_id: Unique identifier for this agent instance
            agent_type: Type of agent (GSA, GFA, CA)
            archon_mcp_url: URL for Archon MCP server
            archon_api_url: URL for Archon API server
        """
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.status = AgentStatus.IDLE
        self.created_at = datetime.now()
        self.last_activity = datetime.now()

        # Integration points
        self.archon_mcp_url = archon_mcp_url
        self.archon_api_url = archon_api_url
        self.mcp_client = None  # Will be initialized when needed
        self.phase1_executor = None  # Will be initialized when needed

        # Progress tracking
        self.current_task = None
        self.tasks_completed = []
        self.errors = []
        self.metrics = {
            "tasks_executed": 0,
            "tasks_succeeded": 0,
            "tasks_failed": 0,
            "total_duration_seconds": 0
        }

    def _update_activity(self):
        """Update last activity timestamp"""
        self.last_activity = datetime.now()

    def _update_status(self, new_status: AgentStatus):
        """
        Update agent status and log the change.

        Args:
            new_status: New agent status
        """
        old_status = self.status
        self.status = new_status
        self._update_activity()
        self._log(f"Status changed: {old_status.value} -> {new_status.value}")

    def _log(self, message: str, level: str = "INFO"):
        """
        Log a message with agent context.

        Args:
            message: Message to log
            level: Log level (INFO, WARNING, ERROR)
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{self.agent_type}:{self.agent_id}] [{level}] {message}")

    def _track_task_start(self, task_name: str):
        """
        Track the start of a task.

        Args:
            task_name: Name of the task being started
        """
        self.current_task = {
            "name": task_name,
            "started_at": datetime.now(),
            "status": "in_progress"
        }
        self._log(f"Started task: {task_name}")
        self.metrics["tasks_executed"] += 1

    def _track_task_complete(self, success: bool = True, result: Any = None):
        """
        Track the completion of a task.

        Args:
            success: Whether the task succeeded
            result: Task result data
        """
        if not self.current_task:
            return

        self.current_task["completed_at"] = datetime.now()
        self.current_task["duration_seconds"] = (
            self.current_task["completed_at"] - self.current_task["started_at"]
        ).total_seconds()
        self.current_task["success"] = success
        self.current_task["result"] = result

        self.tasks_completed.append(self.current_task)

        if success:
            self.metrics["tasks_succeeded"] += 1
            self._log(f"Completed task: {self.current_task['name']} ({self.current_task['duration_seconds']:.1f}s)")
        else:
            self.metrics["tasks_failed"] += 1
            self._log(f"Failed task: {self.current_task['name']}", level="ERROR")

        self.metrics["total_duration_seconds"] += self.current_task["duration_seconds"]
        self.current_task = None

    def _handle_error(self, error: Exception, context: Dict[str, Any]):
        """
        Handle an error with logging and recovery attempt.

        Args:
            error: The exception that occurred
            context: Context information about where the error occurred
        """
        error_info = {
            "timestamp": datetime.now(),
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context
        }
        self.errors.append(error_info)
        self._log(f"Error: {error_info['error_type']} - {error_info['error_message']}", level="ERROR")
        self._update_status(AgentStatus.ERROR)

    async def initialize(self):
        """
        Initialize agent dependencies (MCP client, Phase 1 executor, etc.).
        Should be called before executing tasks.
        """
        self._log("Initializing agent...")
        self._update_status(AgentStatus.PLANNING)

        # Initialize MCP client
        from agents.shared.mcp_client import ArchonMCPClient
        self.mcp_client = ArchonMCPClient(
            mcp_url=self.archon_mcp_url,
            api_url=self.archon_api_url
        )

        # Initialize Phase 1 command executor
        from agents.shared.phase1_integration import Phase1CommandExecutor
        self.phase1_executor = Phase1CommandExecutor()

        self._log("Agent initialized successfully")

    def get_status(self) -> Dict[str, Any]:
        """
        Get current agent status and metrics.

        Returns:
            Dictionary with agent status and metrics
        """
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "current_task": self.current_task,
            "metrics": self.metrics,
            "errors_count": len(self.errors)
        }

    async def stop(self, reason: str = "user_request"):
        """
        Stop the agent and preserve its state.

        Args:
            reason: Reason for stopping
        """
        self._log(f"Stopping agent. Reason: {reason}", level="WARNING")
        self._update_status(AgentStatus.STOPPED)

        # Preserve state for potential resumption
        stop_report = {
            "agent_id": self.agent_id,
            "stopped_at": datetime.now().isoformat(),
            "reason": reason,
            "status": self.get_status(),
            "can_resume": self.current_task is not None
        }

        return stop_report

    @abstractmethod
    async def execute(self, task_spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's main task.
        Must be implemented by subclasses.

        Args:
            task_spec: Specification of the task to execute

        Returns:
            Dictionary with execution results
        """
        pass

    @abstractmethod
    async def validate(self, result: Dict[str, Any]) -> bool:
        """
        Validate the result of agent execution.
        Must be implemented by subclasses.

        Args:
            result: Result to validate

        Returns:
            True if validation passes, False otherwise
        """
        pass
