"""
Error handling and recovery utilities for Phase 2 autonomous agents.
"""

from typing import Dict, Any, Optional, Callable
from datetime import datetime


class ErrorRecoverySystem:
    """
    Autonomous error detection and recovery system.

    Provides:
    - Error pattern matching
    - Automatic recovery attempts
    - Escalation to human when needed
    """

    def __init__(self):
        self.error_patterns = {}
        self.recovery_strategies = {}
        self.error_history = []

    def register_pattern(
        self,
        error_type: str,
        pattern: str,
        recovery_strategy: Callable
    ):
        """
        Register an error pattern and recovery strategy.

        Args:
            error_type: Type of error (e.g., "api_timeout", "validation_error")
            pattern: Pattern to match in error message
            recovery_strategy: Function to call for recovery
        """
        self.error_patterns[error_type] = pattern
        self.recovery_strategies[error_type] = recovery_strategy

    async def handle_error(
        self,
        error: Exception,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Handle an error with automatic recovery if possible.

        Args:
            error: The exception that occurred
            context: Context information about the error

        Returns:
            Dictionary with recovery result
        """
        error_info = {
            "timestamp": datetime.now().isoformat(),
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context,
            "recovered": False,
            "recovery_method": None
        }

        self.error_history.append(error_info)

        # Try to match error pattern and recover
        for error_type, pattern in self.error_patterns.items():
            if pattern.lower() in str(error).lower():
                strategy = self.recovery_strategies.get(error_type)
                if strategy:
                    try:
                        recovery_result = await strategy(error, context)
                        error_info["recovered"] = True
                        error_info["recovery_method"] = error_type
                        error_info["recovery_result"] = recovery_result
                        return error_info
                    except Exception as recovery_error:
                        error_info["recovery_failed"] = str(recovery_error)

        # If no recovery possible, escalate to human
        error_info["escalated_to_human"] = True
        error_info["escalation_message"] = self._format_escalation(error, context)

        return error_info

    def _format_escalation(
        self,
        error: Exception,
        context: Dict[str, Any]
    ) -> str:
        """
        Format error information for human escalation.

        Args:
            error: The exception
            context: Error context

        Returns:
            Formatted escalation message
        """
        return f"""
Error requires human intervention:

Error Type: {type(error).__name__}
Error Message: {str(error)}

Context:
{context}

Recent Errors: {len(self.error_history)} total
Time: {datetime.now().isoformat()}

Please review and provide guidance for recovery.
"""

    def get_error_statistics(self) -> Dict[str, Any]:
        """
        Get error statistics.

        Returns:
            Dictionary with error stats
        """
        total_errors = len(self.error_history)
        recovered = sum(1 for e in self.error_history if e.get("recovered", False))

        error_types = {}
        for error in self.error_history:
            error_type = error["error_type"]
            error_types[error_type] = error_types.get(error_type, 0) + 1

        return {
            "total_errors": total_errors,
            "recovered": recovered,
            "recovery_rate": recovered / total_errors if total_errors > 0 else 0,
            "error_types": error_types
        }
